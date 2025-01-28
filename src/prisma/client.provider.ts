import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaQueryHelperService } from './query-helper.service';

@Injectable()
export class PrismaClientProvider
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectPinoLogger('Prisma Service')
    private readonly logger: PinoLogger,
    private readonly queryHelper: PrismaQueryHelperService,
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
    });
  }

  withExtensions() {
    return this.$extends(withAccelerate()).$extends(
      this.queryHelper.existsExtension,
    );
  }

  async onModuleInit() {
    await this.$connect();
    this.$on('query', (e) => {
      this.logger.debug(e, 'Prisma query');
    });
    this.$on('info', (e) => {
      this.logger.debug(e, 'Prisma info');
    });
    this.$on('warn', (e) => {
      this.logger.warn(e, 'Prisma warn');
    });
    this.$on('error', (e) => {
      this.logger.error(e, 'Prisma error');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
