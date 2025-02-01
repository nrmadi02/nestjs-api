/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenType } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET') as string,
    });
  }

  async validate(payload: any) {
    const token = await this.prisma.token.findFirst({
      where: {
        userId: payload.sub,
        type: TokenType.ACCESS,
        expires: {
          gt: new Date(),
        },
      },
      select: {
        expires: true,
        user: {
          select: {
            isActive: true,
            id: true,
            email: true,
            username: true,
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

    if (!token || !token.user.isActive) {
      throw new UnauthorizedException(['Unauthorized']);
    }

    return token.user;
  }
}
