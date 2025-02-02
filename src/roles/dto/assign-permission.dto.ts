import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  permissionIds: number[];
}
