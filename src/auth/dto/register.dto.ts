import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
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

  @IsString()
  @MinLength(8)
  @ApiProperty()
  passwordConfirmation: string;
}
