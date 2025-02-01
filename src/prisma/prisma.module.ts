import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientProvider } from './client.provider';
import { PrismaQueryHelperService } from './query-helper.service';

@Global()
@Module({
  exports: [PrismaService, PrismaQueryHelperService],
  providers: [PrismaService, PrismaClientProvider, PrismaQueryHelperService],
})
export class PrismaModule {}
