import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  roleId: number | null;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @Exclude()
  id: number;
}
