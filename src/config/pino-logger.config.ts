import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';

const customTimestamp = () => {
  return `,"time":"${new Date().toISOString()}"`;
};

export const pinoLoggerConfig = (
  config: ConfigService,
): Params['pinoHttp'] => ({
  transport: config.get('LOGTAIL_SOURCE_TOKEN')
    ? {
        target: '@logtail/pino',
        options: { sourceToken: config.get('LOGTAIL_SOURCE_TOKEN') as string },
      }
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
  timestamp: customTimestamp,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },
  customProps: () => ({
    context: 'HTTP',
  }),
  genReqId: (request) => request.id ?? randomUUID(),
  autoLogging: false,
  serializers: {
    req: () => undefined,
  },
  customLogLevel: (_req, res, error) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || error) return 'error';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    if (res.statusCode === 404) {
      return 'Resource not found';
    }
    return `${req.method} completed`;
  },
  customErrorMessage: (_req, _res, error) => {
    return error?.message ?? 'Internal server error';
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'timeTaken',
  },
  redact: {
    paths: [
      'config.headers.authorization',
      'config.headers.cookie',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});
