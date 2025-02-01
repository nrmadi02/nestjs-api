import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';
import { UserRoleDto } from './user-role.dto';

export class UserDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  uuid: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: Boolean })
  isVerified: boolean;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty({ type: Date, nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ type: UserProfileDto, nullable: true, required: false })
  profile?: UserProfileDto | null;

  @ApiProperty({ type: UserRoleDto, nullable: true, required: false })
  role?: UserRoleDto | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
