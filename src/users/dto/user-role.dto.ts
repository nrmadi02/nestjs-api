import { ApiProperty } from '@nestjs/swagger';

export class UserRoleDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String, nullable: true })
  name: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  description?: string | null;
}
