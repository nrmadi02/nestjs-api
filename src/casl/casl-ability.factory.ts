/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AbilityBuilder,
  AbilityClass,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { User } from '@prisma/client';
import { Action } from '@prisma/client';

export type Subjects =
  | InferSubjects<'User' | 'Profile' | 'Role' | 'Permission'>
  | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private prisma: PrismaService) {}

  async createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        Role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!userWithRole?.Role) {
      can(Action.READ, 'Profile', { userId: user.id });
      can(Action.UPDATE, 'Profile', { userId: user.id });
      return build();
    }

    userWithRole.Role.permissions.forEach((permission) => {
      if (permission.conditions) {
        can(
          permission.action,
          permission.subject as Subjects,
          permission.conditions,
        );
      } else {
        can(permission.action, permission.subject as Subjects);
      }
    });

    if (userWithRole.Role.name === 'ADMIN') {
      can(Action.MANAGE, 'all');
    } else {
      can(Action.READ, 'Profile', { userId: user.id });
      can(Action.UPDATE, 'Profile', { userId: user.id });
      can(Action.READ, 'User', { id: user.id });
      can(Action.UPDATE, 'User', { id: user.id });
    }

    return build();
  }
}
