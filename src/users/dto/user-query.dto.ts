import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  name: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  email?: string;
}
