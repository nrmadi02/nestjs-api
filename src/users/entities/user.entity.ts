import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';

export class IUser implements Omit<User, 'password'> {
  roleId: number | null;
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  lastLoginAt: Date | null;

  @ApiProperty()
  role: $Enums.UserRole;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  uuid: string;
}
