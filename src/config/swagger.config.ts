import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Laundry API')
  .setDescription('API Documentation for Laundry Application')
  .setVersion('1.0')
  .build();
