/* eslint-disable @typescript-eslint/unbound-method */
import { FastifyReply, FastifyRequest } from 'fastify';
import { corsMiddleware } from './cors.middleware';

describe('CORS Middleware', () => {
  let mockRequest: FastifyRequest['raw'];
  let mockResponse: FastifyReply['raw'];
  let nextFunction: jest.Mock;
  let headers: Record<string, string>;

  beforeEach(() => {
    headers = {};

    mockRequest = {} as FastifyRequest['raw'];

    mockResponse = {
      setHeader: jest.fn().mockImplementation((name: string, value: string) => {
        headers[name] = value;
      }),
    } as unknown as FastifyReply['raw'];

    // Mock next function
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(corsMiddleware).toBeDefined();
  });

  it('should set CORS headers', () => {
    corsMiddleware(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledTimes(4);

    // Check if all required CORS headers are set
    expect(headers['Access-Control-Allow-Origin']).toBe('*');
    expect(headers['Access-Control-Allow-Methods']).toBe(
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    expect(headers['Access-Control-Allow-Headers']).toBe(
      'X-Requested-With,content-type',
    );
    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('should call next function', () => {
    corsMiddleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('should set correct Access-Control-Allow-Methods header', () => {
    corsMiddleware(mockRequest, mockResponse, nextFunction);

    const methods = headers['Access-Control-Allow-Methods'].split(', ');
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('OPTIONS');
    expect(methods).toContain('PUT');
    expect(methods).toContain('PATCH');
    expect(methods).toContain('DELETE');
  });

  it('should set correct Access-Control-Allow-Headers header', () => {
    corsMiddleware(mockRequest, mockResponse, nextFunction);

    const allowedHeaders = headers['Access-Control-Allow-Headers'].split(',');
    expect(allowedHeaders).toContain('X-Requested-With');
    expect(allowedHeaders).toContain('content-type');
  });

  it('should handle multiple calls correctly', () => {
    corsMiddleware(mockRequest, mockResponse, nextFunction);
    corsMiddleware(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledTimes(8);
    expect(nextFunction).toHaveBeenCalledTimes(2);
  });

  it('should not modify other response headers', () => {
    const existingHeader = 'existing-header';
    const existingValue = 'existing-value';
    headers[existingHeader] = existingValue;

    corsMiddleware(mockRequest, mockResponse, nextFunction);

    expect(headers[existingHeader]).toBe(existingValue);
  });
});
