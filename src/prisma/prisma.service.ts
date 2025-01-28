import { Injectable, Type } from '@nestjs/common';

import { PrismaClientProvider } from './client.provider';

const buildPrismaService = () => {
  return class {
    constructor(provider: PrismaClientProvider) {
      return provider;
    }
  } as Type<PrismaClientProvider>;
};

@Injectable()
export class PrismaService extends buildPrismaService() {
  constructor(provider: PrismaClientProvider) {
    super(provider);
  }
}
