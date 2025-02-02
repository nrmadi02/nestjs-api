/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
import { usersSeeder } from './users';
import { rolePermissionSeeder } from './role-permission';

const prisma = new PrismaClient();

async function main() {
  const { adminRole, userRole } = await rolePermissionSeeder(prisma);
  await usersSeeder(adminRole, userRole, prisma);

  console.log(`📝 Seeded ${adminRole.name} role`);
  console.log(`📝 Seeded ${userRole.name} role`);
  console.log(`📝 Seeded users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
