import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class PermissionDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ enum: $Enums.Action })
  action: $Enums.Action;

  @ApiProperty()
  subject: string;

  @ApiProperty({ type: Object })
  conditions: JsonValue;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  reason: string | null;
}
