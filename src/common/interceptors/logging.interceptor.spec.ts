/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { PinoLogger } from 'nestjs-pino';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: jest.Mocked<PinoLogger>;

  // Mock request object
  const mockRequest = {
    method: 'GET',
    url: '/test',
    ip: '127.0.0.1',
    query: {},
    body: {},
    headers: {},
  } as FastifyRequest;

  // Mock execution context
  const mockExecutionContext: ExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getArgByIndex: function <T = any>(): T {
      throw new Error('Function not implemented.');
    },
  };

  beforeEach(async () => {
    // Create mock logger
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      setContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: PinoLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    logger = module.get<PinoLogger>(PinoLogger) as jest.Mocked<PinoLogger>;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should set logger context to HTTP', () => {
    expect(logger.setContext).toHaveBeenCalledWith('HTTP');
  });

  describe('intercept', () => {
    it('should log successful requests', (done) => {
      // Mock response data
      const responseData = { success: true };

      // Mock call handler
      const mockCallHandler: CallHandler = {
        handle: () => of(responseData),
      };

      // Execute interceptor
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'GET /test',
              config: expect.objectContaining({
                ip: '127.0.0.1',
                method: 'GET',
                url: '/test',
              }),
              data: responseData,
            }),
            expect.stringContaining('Request Completed -> GET /test'),
          );
          done();
        },
      });
    });

    it('should log error responses', (done) => {
      // Mock error
      const error = new Error('Test error');

      // Mock call handler with error
      const mockCallHandler: CallHandler = {
        handle: () => throwError(() => error),
      };

      // Execute interceptor
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(logger.error).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'GET /test',
              config: expect.objectContaining({
                ip: '127.0.0.1',
                method: 'GET',
                url: '/test',
              }),
              err: error,
            }),
            expect.stringContaining('Test error -> GET /test'),
          );
          done();
        },
      });
    });

    it('should handle unique constraint errors', (done) => {
      // Mock unique constraint error
      const uniqueError = new Error('Unique violation: email already exists');

      // Mock call handler with unique error
      const mockCallHandler: CallHandler = {
        handle: () => throwError(() => uniqueError),
      };

      // Execute interceptor
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(logger.error).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'GET /test',
              config: expect.objectContaining({
                ip: '127.0.0.1',
                method: 'GET',
                url: '/test',
              }),
              err: uniqueError,
            }),
            expect.stringContaining('email already exists'),
          );
          done();
        },
      });
    });

    it('should include request details in logs', (done) => {
      const customRequest = {
        ...mockRequest,
        query: { filter: 'test' },
        body: { data: 'test' },
        headers: { 'custom-header': 'test' },
      };

      const customContext: ExecutionContext = {
        ...mockExecutionContext,
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(customRequest),
        }),
      };

      const mockCallHandler: CallHandler = {
        handle: () => of({ success: true }),
      };

      interceptor.intercept(customContext, mockCallHandler).subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            expect.objectContaining({
              config: expect.objectContaining({
                query: { filter: 'test' },
                body: { data: 'test' },
                headers: { 'custom-header': 'test' },
              }),
            }),
            expect.any(String),
          );
          done();
        },
      });
    });
  });
});
