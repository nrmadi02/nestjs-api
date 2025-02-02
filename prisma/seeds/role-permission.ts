import { Action, PrismaClient } from '@prisma/client';

const adminRoleObj = {
  name: 'Admin',
  description: 'Administrator with full access',
  permissions: {
    create: [
      {
        action: Action.MANAGE,
        subject: 'all',
        reason: 'Admin has full access',
      },
    ],
  },
};

const userRoleObj = {
  name: 'User',
  description: 'Regular user with limited access',
  permissions: {
    create: [
      {
        action: Action.READ,
        subject: 'User',
        reason: 'Users can read their own profile',
      },
      {
        action: Action.UPDATE,
        subject: 'User',
        reason: 'Users can update their own profile',
      },
    ],
  },
};

export async function rolePermissionSeeder(prisma: PrismaClient) {
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      ...adminRoleObj,
      permissions: {
        connectOrCreate: [
          {
            where: {
              action_subject: { action: Action.MANAGE, subject: 'all' },
            },
            create: {
              action: Action.MANAGE,
              subject: 'all',
              reason: 'Admin has full access',
            },
          },
        ],
      },
    },
    create: {
      ...adminRoleObj,
      permissions: {
        connectOrCreate: [
          {
            where: {
              action_subject: { action: Action.MANAGE, subject: 'all' },
            },
            create: {
              action: Action.MANAGE,
              subject: 'all',
              reason: 'Admin has full access',
            },
          },
        ],
      },
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {
      ...userRoleObj,
      permissions: {
        connectOrCreate: [
          ...userRoleObj.permissions.create.map((p) => {
            return {
              where: {
                action_subject: { action: p.action, subject: p.subject },
              },
              create: p,
            };
          }),
        ],
      },
    },
    create: {
      ...userRoleObj,
      permissions: {
        connectOrCreate: [
          ...userRoleObj.permissions.create.map((p) => {
            return {
              where: {
                action_subject: { action: p.action, subject: p.subject },
              },
              create: p,
            };
          }),
        ],
      },
    },
  });

  return { adminRole, userRole };
}
