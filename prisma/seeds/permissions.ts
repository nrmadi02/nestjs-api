/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient, UserRole, Action } from '@prisma/client';

const prisma = new PrismaClient();

const adminRoleObj = {
  name: UserRole.ADMIN,
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
  name: UserRole.USER,
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

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: UserRole.ADMIN },
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
    where: { name: UserRole.USER },
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

  console.log(`📝 Seeded ${adminRole.name} role`);

  console.log(`📝 Seeded ${userRole.name} role`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
