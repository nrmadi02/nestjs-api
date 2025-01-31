import { ApiResponseDecorator } from 'src/common/decorators/api-response.decorator';
import { AuthService } from './auth.service';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiErrorResponseDecorator } from 'src/common/decorators/api-error-response.decorator';
import { LoginDto } from './dto/login.dto';
import { FastifyRequest } from 'fastify';
import { SucessResponse } from 'src/common/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
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
}
