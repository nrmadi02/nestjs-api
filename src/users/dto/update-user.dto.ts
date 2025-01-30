import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty()
  username: string;

  @IsEmail()
  @MaxLength(255)
  @ApiProperty()
  email: string;

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

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
