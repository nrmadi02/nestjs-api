import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDetail {
  @ApiProperty()
  field?: string;

  @ApiProperty()
  message: string;
}

export class ApiErrorResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}

export class ApiValidationErrorResponse extends ApiErrorResponse {
  @ApiProperty({ type: [ApiErrorDetail] })
  errors: ApiErrorDetail[];
}

export class ApiBaseErrorResponse extends ApiErrorResponse {
  @ApiProperty()
  errors: string[];
}
