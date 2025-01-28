import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import {
  ApiBaseErrorResponse,
  ApiValidationErrorResponse,
} from '../dtos/api-error.dto';

export const ApiErrorResponseDecorator = (
  options: {
    validation?: boolean;
    badRequest?: boolean;
    unauthorized?: boolean;
    notFound?: boolean;
    forbidden?: boolean;
  } = {},
) => {
  const decorators: Array<MethodDecorator & ClassDecorator> = [];

  if (options.validation) {
    decorators.push(
      ApiResponse({
        status: 422,
        description: 'Validation Error',
        type: ApiValidationErrorResponse,
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 422,
              message: 'Validation Error',
              errors: [
                {
                  field: 'email',
                  message: 'Email harus dalam format yang valid',
                },
                {
                  field: 'password',
                  message: 'Password minimal 6 karakter',
                },
              ],
            },
          },
        },
      }),
    );
  }

  if (options.badRequest) {
    decorators.push(
      ApiResponse({
        status: 400,
        description: 'Bad Request',
        type: ApiBaseErrorResponse,
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 400,
              message: 'Bad Request',
              errors: ['Bad Request'],
            },
          },
        },
      }),
    );
  }

  if (options.unauthorized) {
    decorators.push(
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: ApiBaseErrorResponse,
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 401,
              message: 'Unauthorized',
              errors: ['Anda belum login, silahkan login terlebih dahulu'],
            },
          },
        },
      }),
    );
  }

  if (options.notFound) {
    decorators.push(
      ApiResponse({
        status: 404,
        description: 'Not Found',
        type: ApiBaseErrorResponse,
        content: {
          'application/json': {
            example: {
              success: false,
              statusCode: 404,
              message: 'Not Found',
              errors: [
                'Data yang anda cari tidak ditemukan, silahkan coba lagi',
              ],
            },
          },
        },
      }),
    );
  }

  return applyDecorators(...decorators);
};
