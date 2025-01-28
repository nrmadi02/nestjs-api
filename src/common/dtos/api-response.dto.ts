import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 10 })
  lastPage: number;

  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 10 })
  totalPerPage: number;

  @ApiProperty({ example: null })
  prevPage: number | null;

  @ApiProperty({ example: null })
  nextPage: number | null;
}

export class ApiResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  data: T;
}

export class ApiResponsePaginated<T> extends ApiResponse<T> {
  @ApiProperty({ required: false })
  meta?: PaginationMeta;
}
