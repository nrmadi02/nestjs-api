import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ type: String, nullable: true })
  firstName: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatar: string | null;

  @ApiProperty({ type: String, nullable: true })
  phoneNumber: string | null;
}
