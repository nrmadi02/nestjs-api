/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaQueryHelperService {
  existsExtension = Prisma.defineExtension({
    name: 'exists-extension',
    model: {
      $allModels: {
        async exists<T>(
          this: T,
          where: Prisma.Args<T, 'findFirst'>['where'],
        ): Promise<boolean> {
          const context = Prisma.getExtensionContext(this) as T;
          const result = await (context as any).findFirst({ where });
          return result !== null;
        },
      },
    },
  });
}
