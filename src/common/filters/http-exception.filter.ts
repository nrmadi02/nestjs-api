import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FastifyReply } from 'fastify';
import { extractFieldFromUniqueError } from '../utils/extract';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: Record<string, any> = {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      errors: ['An unexpected error occurred'],
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as Record<string, any>;

      if (
        status === (HttpStatus.UNPROCESSABLE_ENTITY as number) &&
        Array.isArray(exceptionResponse.message)
      ) {
        statusCode = status;
        errorResponse = {
          success: false,
          statusCode: status,
          message: 'Validation Error',
          errors: exceptionResponse.message.map((message) => ({
            field: (message as string).split(' ')[0],
            message: message as string,
          })),
        };
      } else {
        statusCode = status;
        errorResponse = {
          success: false,
          statusCode: status,
          message: exception.message,
          errors: exceptionResponse.message as [],
        };
      }
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      const field = extractFieldFromUniqueError(exception.message);
      if (exception.code === 'P2002') {
        statusCode = HttpStatus.CONFLICT;
        errorResponse = {
          success: false,
          statusCode: HttpStatus.CONFLICT,
          message: 'Conflict Error',
          errors: [`${field} already exists`],
        };
      }
    }

    return response
      .status(statusCode)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send(errorResponse);
  }
}
