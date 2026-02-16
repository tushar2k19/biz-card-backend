import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@platform.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Super admin already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt());
  const platform = await prisma.organization.upsert({
    where: { slug: 'platform' },
    create: { name: 'Platform', slug: 'platform' },
    update: {},
  });

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      organizationId: platform.id,
    },
  });
  console.log('Super admin created:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
