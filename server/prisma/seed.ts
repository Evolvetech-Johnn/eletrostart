// Seed script para criar o usuário admin inicial
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuário admin padrão
  const adminEmail = process.env.ADMIN_EMAIL || "admin@eletrostart.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  // Criar usuário admin Henrique
  const henriqueEmail = "henrique@eletrostart.com.br";
  const henriquePassword = "Eletro5020";

  // Verificar se já existe o admin padrão
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("ℹ️  Usuário admin já existe:", adminEmail);
  } else {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Criar admin
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrador",
        role: "ADMIN",
      },
    });

    console.log("✅ Usuário admin criado:", admin.email);
  }

  // Verificar se já existe o admin Henrique
  const existingHenrique = await prisma.adminUser.findUnique({
    where: { email: henriqueEmail },
  });

  if (existingHenrique) {
    console.log("ℹ️  Usuário Henrique já existe:", henriqueEmail);
  } else {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(henriquePassword, 12);

    // Criar admin Henrique
    const henrique = await prisma.adminUser.create({
      data: {
        email: henriqueEmail,
        password: hashedPassword,
        name: "Henrique Eletrostart",
        role: "ADMIN",
      },
    });

    console.log("✅ Usuário Henrique criado:", henrique.email);
  }

  // Criar algumas mensagens de exemplo
  const existingMessages = await prisma.contactMessage.count();

  if (existingMessages === 0) {
    const sampleMessages: Prisma.ContactMessageCreateInput[] = [
      {
        name: "João Silva",
        email: "joao@exemplo.com",
        phone: "(43) 99999-1111",
        subject: "Orçamento",
        message:
          "Gostaria de um orçamento para instalação elétrica residencial.",
        status: "NEW",
      },
      {
        name: "Maria Santos",
        email: "maria@exemplo.com",
        phone: "(43) 98888-2222",
        subject: "Dúvida sobre produto",
        message:
          "Vocês trabalham com painéis solares? Qual a potência disponível?",
        status: "READ",
      },
      {
        name: "Pedro Oliveira",
        email: "pedro@exemplo.com",
        phone: "(43) 97777-3333",
        subject: "Parceria",
        message: "Tenho interesse em ser revendedor. Como funciona?",
        status: "REPLIED",
      },
    ];

    for (const msg of sampleMessages) {
      await prisma.contactMessage.create({ data: msg });
    }
    console.log(`✅ ${sampleMessages.length} mensagens de exemplo criadas.`);
  } else {
    console.log("ℹ️  Mensagens já existem, pulando criação.");
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
