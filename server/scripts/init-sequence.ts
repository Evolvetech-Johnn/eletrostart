import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initSequence() {
  const START_VALUE = 999; // O próximo será 1000

  console.log(`🎯 Configurando sequência de pedidos para começar em ${START_VALUE + 1}...`);

  await prisma.sequence.upsert({
    where: { key: "order" },
    update: { value: START_VALUE },
    create: { key: "order", value: START_VALUE },
  });

  console.log("✅ Sequência atualizada com sucesso.");
}

initSequence()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
