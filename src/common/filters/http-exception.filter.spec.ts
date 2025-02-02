/* eslint-disable @typescript-eslint/unbound-method */
import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FastifyReply } from 'fastify';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: FastifyReply;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as FastifyReply;

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn(),
      }),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };

    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle unknown exceptions', () => {
    const exception = new Error('Unknown error');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      errors: ['An unexpected error occurred'],
    });
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Test error',
      errors: undefined,
    });
  });

  it('should handle validation errors', () => {
    const validationError = new HttpException(
      {
        message: ['email must be an email', 'password must be strong'],
        error: 'Validation Error',
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    filter.catch(validationError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation Error',
      errors: [
        {
          field: 'email',
          message: 'email must be an email',
        },
        {
          field: 'password',
          message: 'password must be strong',
        },
      ],
    });
  });

  it('should handle Prisma unique constraint violations', () => {
    const prismaError = new PrismaClientKnownRequestError(
      'Unique constraint failed on the constraint: `email`',
      {
        code: 'P2002',
        clientVersion: '2.x.x',
      },
    );

    filter.catch(prismaError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.CONFLICT,
      message: 'Conflict Error',
      errors: ['null already exists'],
    });
  });

  it('should handle other Prisma errors', () => {
    const prismaError = new PrismaClientKnownRequestError(
      'Other Prisma error',
      {
        code: 'P2000',
        clientVersion: '2.x.x',
      },
    );

    filter.catch(prismaError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should set correct Content-Type header', () => {
    const exception = new Error('Test error');

    filter.catch(exception, mockHost);

    expect(mockResponse.header).toHaveBeenCalledWith(
      'Content-Type',
      'application/json; charset=utf-8',
    );
  });

  it('should handle HttpException with non-array message', () => {
    const exception = new HttpException(
      {
        message: 'Bad Request',
        error: 'Error',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Bad Request',
      errors: 'Bad Request',
    });
  });

  it('should handle undefined exception message', () => {
    const exception = new HttpException(
      {
        error: 'Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.send).toHaveBeenCalledWith({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Http Exception',
      errors: undefined,
    });
  });
});
