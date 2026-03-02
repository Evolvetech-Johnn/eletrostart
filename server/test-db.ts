import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
      },
    });
    console.log("Usuários na Base de Dados de Produção:");
    console.table(users);
  } catch (error) {
    console.error("Erro na consulta:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
