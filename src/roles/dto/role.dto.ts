import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from 'src/permissions/dto/permission.dto';

export class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: String,
  })
  description: string | null;

  @ApiProperty({
    type: [PermissionDto],
  })
  permissions: PermissionDto[];
}
