import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
});

async function main() {
  const email = process.env['ADMIN_EMAIL'];
  const password = process.env['ADMIN_PASSWORD'];
  const name = process.env['ADMIN_NAME'] ?? 'Admin';

  if (!email || !password) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`Admin pronto: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
