import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { AuthService } from './auth.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiErrorResponseDecorator } from 'src/common/decorators/api-error-response.decorator';
import { LoginDto } from './dto/login.dto';
import { FastifyRequest } from 'fastify';
import { SucessResponse } from 'src/common/utils/response.util';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, OmitType } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponseDecorator(AuthResponseDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async login(@Body() loginDto: LoginDto, @Req() req: FastifyRequest) {
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
    const user = await this.authService.login(loginDto, deviceInfo);
    return SucessResponse('Success to login', 200, user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiResponseDecorator(OmitType(UserDto, ['createdAt', 'updatedAt']))
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async register(@Body() registerDto: RegisterDto) {
    const res = await this.authService.register(registerDto);
    return SucessResponse('Success to register', 200, res);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponseDecorator(AuthResponseDto)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const res = await this.authService.refreshToken(refreshTokenDto);
    return SucessResponse('Success to refresh token', 200, res);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiResponseDecorator(Boolean)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const res = await this.authService.verifyEmail(verifyEmailDto);
    return SucessResponse('Success to verify email', 200, res);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponseDecorator(Boolean)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const res = await this.authService.forgotPassword(forgotPasswordDto);
    return SucessResponse('Success to forgot password', 200, res);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponseDecorator(Boolean)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const res = await this.authService.resetPassword(resetPasswordDto);
    return SucessResponse('Success to reset password', 200, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponseDecorator(Boolean)
  @ApiErrorResponseDecorator({
    validation: true,
    badRequest: true,
    notFound: true,
    forbidden: true,
    unauthorized: true,
  })
  async logout(@GetUser('id') userId: number) {
    const res = await this.authService.logout(userId);
    return SucessResponse('Success to logout', 200, res);
  }
}
