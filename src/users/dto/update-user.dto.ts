import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto implements User {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  id: number;
}
