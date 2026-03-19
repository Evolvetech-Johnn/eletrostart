import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillOrderNumbers() {
  console.log("🚀 Iniciando backfill de números de pedido...");

  const orders = await prisma.order.findMany({
    where: { orderNumber: null },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📦 Encontrados ${orders.length} pedidos sem número.`);

  let count = 0;
  for (const order of orders) {
    const sequenceValue = await prisma.sequence.upsert({
      where: { key: "order" },
      update: { value: { increment: 1 } },
      create: { key: "order", value: 1 },
    });

    const orderNumber = `PN${String(sequenceValue.value).padStart(12, "0")}`;

    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber },
    });

    count++;
    if (count % 10 === 0) console.log(`✅ ${count} pedidos processados...`);
  }

  console.log(`✨ Backfill concluído! ${count} pedidos atualizados.`);
}

backfillOrderNumbers()
  .catch((e) => {
    console.error("❌ Erro no backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
