import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = async (p: string) => bcrypt.hash(p, await bcrypt.genSalt());

  // 1. Super admin: tushar@admin.com / 123
  const platform = await prisma.organization.upsert({
    where: { slug: 'platform' },
    create: { name: 'Platform', slug: 'platform' },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: 'tushar@admin.com' },
    create: {
      email: 'tushar@admin.com',
      passwordHash: await hash('123'),
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      organizationId: platform.id,
    },
    update: { passwordHash: await hash('123') },
  });
  console.log('Super admin created/updated: tushar@admin.com');

  // 2. Company GT and company user tushar@gmail.com / 123
  const gt = await prisma.organization.upsert({
    where: { slug: 'gt' },
    create: { name: 'GT', slug: 'gt' },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: 'tushar@gmail.com' },
    create: {
      email: 'tushar@gmail.com',
      passwordHash: await hash('123'),
      fullName: 'Tushar',
      role: 'MEMBER',
      organizationId: gt.id,
    },
    update: { passwordHash: await hash('123'), organizationId: gt.id },
  });
  console.log('Company GT and user tushar@gmail.com created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
