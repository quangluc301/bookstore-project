import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const { hashPassword } = require('../src/utils/hashPassword') as {
  hashPassword: (password: string) => Promise<string>;
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Sample admin seeding is disabled in production.');
  }

  const password = process.env.SEED_ADMIN_PASSWORD;
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Set SEED_ADMIN_PASSWORD to a password with at least 8 characters.');
  }

  const email = 'luuquangluc301@gmail.com';
  const password_hash = await hashPassword(password);
  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password_hash,
      full_name: 'Store Admin',
      role: 'ADMIN',
      email_verified: true,
    },
    update: {
      password_hash,
      role: 'ADMIN',
      email_verified: true,
      email_verification_code: null,
      email_verification_expires: null,
    },
  });

  console.log(`Admin sample created or updated: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });