/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { Permission, PrismaClient, User } from '@prisma/client';
import { Action } from '@prisma/client';

export type Actions = 'manage' | 'read' | 'create' | 'update' | 'delete';

type PrismaModelNames<T> = {
  [K in keyof T]: T[K] extends { count: any } ? K : never;
}[keyof T];

type GetPrismaModels = PrismaModelNames<Omit<PrismaClient, symbol>>;

export type Subjects = InferSubjects<GetPrismaModels> | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private prisma: PrismaService) {}

  createForUser(
    user: User & {
      role?: {
        permissions: Permission[];
      };
    },
  ) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    if (user.role?.permissions) {
      for (const permission of user.role.permissions) {
        const action = permission.action.toLowerCase() as Actions;

        if (permission.conditions) {
          can(action, permission.subject as any, permission.conditions);
        } else {
          can(action, permission.subject as any);
        }
        if (permission.action === Action.MANAGE) {
          can(
            ['read', 'create', 'update', 'delete'] as Actions[],
            permission.subject as any,
          );
        }
      }
    }

    return build({
      detectSubjectType: (item: any) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
