import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Logger, PinoLogger } from 'nestjs-pino';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { corsMiddleware } from './common/middlewares/cors.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );
  const logger = await app.resolve(PinoLogger);
  const configService = app.get(ConfigService);

  app.use(corsMiddleware);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      validationError: { target: false, value: false },
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  const documentFactory = () =>
    SwaggerModule.createDocument(app, {
      ...swaggerConfig,
    });
  SwaggerModule.setup('docs', app, documentFactory());

  const port = configService.get('PORT') as number;
  await app.listen(port ?? 3000, '0.0.0.0');
}

void bootstrap().finally(() => {
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT ?? 3000}`,
  );
});
