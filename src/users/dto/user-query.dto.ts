import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';

export class UserQueryDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
  })
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({
    required: false,
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({
    required: false,
  })
  isVerified?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    required: false,
  })
  roleId?: number;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  username?: string;

  @IsOptional()
  @ApiProperty({
    required: false,
  })
  email?: string;
}
