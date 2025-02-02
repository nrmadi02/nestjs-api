import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, TokenType } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JsonObject } from '@prisma/client/runtime/library';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PrismaQueryHelperService } from 'src/prisma/query-helper.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly config: ConfigService,
    private readonly queryHelper: PrismaQueryHelperService,
  ) {}

  extendedPrisma = this.prisma.$extends(this.queryHelper.softDeleteExtension);

  private parseDuration(duration: string): number {
    const matches = duration.match(/^(\d+)([mhd])$/);
    if (!matches) {
      throw new Error('Invalid duration format');
    }

    const [, value, unit] = matches;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 'm':
        return numValue * 60 * 1000;
      case 'h':
        return numValue * 60 * 60 * 1000;
      case 'd':
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

  async register(registerDto: RegisterDto) {
    this.logger.info('Registering user');

    const { password, passwordConfirmation, ...userData } = registerDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException(['Passwords do not match']);
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(['Email or username already exists']);
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isVerified: true,
        uuid: true,
        profile: true,
        role: {
          select: {
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
    });

    // Generate verification token
    // const verificationToken = await this.generateToken(
    //   user.id,
    //   TokenType.VERIFY_EMAIL,
    //   this.config.get('JWT_VERIFICATION_EXPIRATION') as string,
    // );

    // TODO: Send verification email

    return user;
  }

  async login(loginDto: LoginDto, deviceInfo?: Prisma.JsonObject) {
    this.logger.info('Logging in user');

    const user = await this.extendedPrisma.user.findUnique({
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
      throw new UnauthorizedException(['User not found or inactive']);
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

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    this.logger.info('Refreshing token');

    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshTokenDto.refreshToken,
        isRevoked: false,
        expires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        token: true,
        userId: true,
        deviceInfo: true,
        user: {
          select: {
            isActive: true,
            id: true,
            uuid: true,
            email: true,
            username: true,
            isVerified: true,
            profile: true,
            role: {
              select: {
                name: true,
                description: true,
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!refreshToken || !refreshToken.user.isActive) {
      throw new UnauthorizedException(['Invalid refresh token']);
    }

    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateAuthTokens(
      refreshToken.userId,
      refreshToken.deviceInfo as JsonObject,
    );

    return {
      user: refreshToken.user,
      tokens,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    this.logger.info('Verifying email');

    const token = await this.prisma.token.findFirst({
      where: {
        token: verifyEmailDto.token,
        type: TokenType.VERIFY_EMAIL,
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!token) {
      throw new BadRequestException(['Invalid or expired token']);
    }

    await this.prisma.user.update({
      where: { id: token.userId },
      data: { isVerified: true },
    });

    await this.prisma.token.delete({
      where: { id: token.id },
    });

    return true;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    this.logger.info('Forgot password');

    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException(['User not found']);
    }

    // Generate reset password token
    // const resetToken = await this.generateToken(
    //   user.id,
    //   TokenType.RESET_PASSWORD,
    //   this.config.get('JWT_RESET_PASSWORD_EXPIRATION') as string,
    // );

    // TODO: Send reset password email

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    this.logger.info('Reset password');

    const { token, password, passwordConfirmation } = resetPasswordDto;

    if (password !== passwordConfirmation) {
      throw new BadRequestException(['Passwords do not match']);
    }

    const resetToken = await this.prisma.token.findFirst({
      where: {
        token,
        type: TokenType.RESET_PASSWORD,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw new BadRequestException(['Invalid or expired token']);
    }

    const hashedPassword = await this.hashPassword(password);
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.token.delete({
      where: { id: resetToken.id },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { isRevoked: true },
    });

    return true;
  }

  async logout(userId: number) {
    this.logger.info('Logging out user');

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return true;
  }
}
