/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';
import { FastifyRequest } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const config = {
      ip: request.ip,
      method: request.method,
      url: request.url,
      query: request.query,
      body: request.body,
      headers: request.headers,
    };

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.info(
            {
              message: `${method} ${url}`,
              timeTaken: `${Date.now() - now}ms`,
              config: config,
              data,
            },
            'Request Completed',
          );
        },
        error: (error) => {
          const err = error as { message: string };
          this.logger.error(
            {
              message: `${method} ${url}`,
              timeTaken: `${Date.now() - now}ms`,
              config: config,
              err,
            },
            err.message,
          );
        },
      }),
    );
  }
}
