import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, TokenType } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly config: ConfigService,
  ) {}

  private parseDuration(duration: string): number {
    const matches = duration.match(/^(\d+)([mhd])$/);
    if (!matches) {
      throw new Error('Invalid duration format');
    }

    const [, value, unit] = matches;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 'm': // minutes
        return numValue * 60 * 1000;
      case 'h': // hours
        return numValue * 60 * 60 * 1000;
      case 'd': // days
        return numValue * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid duration unit');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private async generateToken(
    userId: number,
    type: TokenType,
    expiresIn: string,
  ): Promise<string> {
    const token = this.jwtService.sign({ sub: userId, type }, { expiresIn });

    const expiresInMs = this.parseDuration(expiresIn);

    await this.prisma.token.create({
      data: {
        userId,
        type,
        token,
        expires: new Date(Date.now() + expiresInMs),
      },
    });

    return token;
  }

  private async generateAuthTokens(
    userId: number,
    deviceInfo?: Prisma.JsonObject,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await this.generateToken(
      userId,
      TokenType.ACCESS,
      this.config.get('JWT_ACCESS_EXPIRATION') as string,
    );

    const refreshToken = uuidv4();
    const expiresInMs = this.parseDuration(
      this.config.get('JWT_REFRESH_EXPIRATION') as string,
    );
    const refreshTokenExpiration = new Date(Date.now() + expiresInMs);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expires: refreshTokenExpiration,
        deviceInfo: deviceInfo,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto, deviceInfo?: Prisma.JsonObject) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        profile: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(['Email not found or inactive']);
    }

    const isPasswordValid = await this.verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(['Password is incorrect']);
    }

    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateAuthTokens(user.id, deviceInfo);

    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        isActive: user.isActive,
        profile: user.profile,
        role: user.role
          ? {
              name: user.role.name,
              permissions: user.role.permissions.map((p) => ({
                action: p.action,
                subject: p.subject,
              })),
            }
          : null,
      },
      tokens,
    };
  }
}
