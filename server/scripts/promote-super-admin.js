const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const result = await prisma.adminUser.updateMany({
    data: { role: 'SUPER_ADMIN' }
  });
  console.log('Atualizados:', result.count, 'usuário(s) para SUPER_ADMIN');

  const users = await prisma.adminUser.findMany({
    select: { email: true, name: true, role: true, active: true }
  });
  console.log('\nUsuários no banco:');
  users.forEach(u => console.log(`  - ${u.email} | ${u.name} | role: ${u.role} | ativo: ${u.active}`));

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
