import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UserQueryDto {
  @IsNotEmpty()
  @ApiProperty({
    required: false,
  })
  name?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  email?: string;
}
