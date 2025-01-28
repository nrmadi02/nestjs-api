import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';

export class UserQueryDto extends QueryPaginationDto {
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  name?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  email?: string;
}
