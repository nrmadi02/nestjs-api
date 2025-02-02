import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adminObj = (password: string, adminRole: Role) => ({
  email: 'admin@admin.com',
  username: 'admin',
  password: password,
  isVerified: true,
  isActive: true,
  roleId: adminRole.id,
  profile: {
    create: {
      firstName: 'Admin',
      lastName: 'User',
    },
  },
});

const userObj = (password: string, userRole: Role) => ({
  email: 'user@user.com',
  username: 'user',
  password: password,
  isVerified: true,
  isActive: true,
  roleId: userRole.id,
  profile: {
    create: {
      firstName: 'Regular',
      lastName: 'User',
    },
  },
});

export async function usersSeeder(
  adminRole: Role,
  userRole: Role,
  prisma: PrismaClient,
) {
  const saltRounds = 10;
  const password = await bcrypt.hash('password', saltRounds);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      ...adminObj(password, adminRole),
      profile: {
        update: {
          ...adminObj(password, adminRole).profile.create,
        },
      },
    },
    create: {
      ...adminObj(password, adminRole),
      profile: {
        create: {
          ...adminObj(password, adminRole).profile.create,
        },
      },
    },
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@user.com' },
    update: {
      ...userObj(password, userRole),
      profile: {
        update: {
          ...userObj(password, userRole).profile.create,
        },
      },
    },
    create: {
      ...userObj(password, userRole),
      profile: {
        create: {
          ...userObj(password, userRole).profile.create,
        },
      },
    },
  });

  return { admin, user };
}
