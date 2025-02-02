import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty()
  username: string;

  @IsEmail()
  @MaxLength(255)
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty()
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiProperty()
  phoneNumber?: string;

  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  roleId: number;
}
