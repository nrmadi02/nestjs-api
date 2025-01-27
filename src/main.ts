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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );
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

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') as number;

  const documentFactory = () =>
    SwaggerModule.createDocument(app, {
      ...swaggerConfig,
    });
  SwaggerModule.setup('docs', app, documentFactory());

  await app.listen(port ?? 3000);
}

void bootstrap().finally(() => {
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT ?? 3000}`,
  );
});
