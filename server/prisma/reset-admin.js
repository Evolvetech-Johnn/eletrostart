
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@eletrostart.com.br';
  const password = 'Admin@123';
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      active: true,
      role: 'admin'
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      active: true
    }
  });

  console.log(`✅ Admin user reset: ${user.email}`);
  console.log(`✅ Password: ${password}`);
  console.log(`✅ Active: ${user.active}`);
  console.log(`✅ Role: ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
