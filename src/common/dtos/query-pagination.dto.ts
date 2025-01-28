import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class QueryPaginationDto {
  @IsNumberString()
  @ApiProperty()
  page: number;

  @IsNumberString()
  @ApiProperty()
  size: number;
}
