import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClientProvider } from './client.provider';
import { PrismaQueryHelperService } from './query-helper.service';
import { LoggerModule } from 'nestjs-pino';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        PrismaService,
        PrismaClientProvider,
        PrismaQueryHelperService,
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
