/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  softDeleteExtension = Prisma.defineExtension({
    name: 'soft-delete-extension',
    model: {
      $allModels: {
        async softDelete<T>(this: T, where: Prisma.Args<T, 'update'>['where']) {
          const context = Prisma.getExtensionContext(this) as T;
          return await (context as any).update({
            where,
            data: { deletedAt: new Date() },
          });
        },

        async restore<T>(this: T, where: Prisma.Args<T, 'update'>['where']) {
          const context = Prisma.getExtensionContext(this) as T;
          return await (context as any).update({
            where,
            data: { deletedAt: null },
          });
        },
      },
    },
    query: {
      user: {
        async findMany({ args, query }) {
          if (!args.where) args.where = {};
          if (args.where.deletedAt === undefined) {
            args.where.deletedAt = null;
          }
          console.log(args.where);
          return query(args);
        },
        async findFirst({ args, query }) {
          if (!args.where) args.where = {};
          if (args.where.deletedAt === undefined) {
            args.where.deletedAt = null;
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          if (!args.where) args.where = {} as any;
          if (args.where.deletedAt === undefined) {
            args.where.deletedAt = null;
          }
          return query(args);
        },
      },
    },
  });
}
