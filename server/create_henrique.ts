import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "henrique@eletrostart.com.br";
  const password = "Eletro5020";
  
  console.log(`Verificando usuário ${email}...`);
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const existing = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (existing) {
    console.log("Usuário já existe, atualizando senha...");
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { password: hashedPassword, role: "SUPER_ADMIN", active: true, name: "Henrique" }
    });
  } else {
    console.log("Criando novo usuário admin...");
    await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: "Henrique",
        role: "SUPER_ADMIN",
        active: true
      }
    });
  }
  
  console.log(`✅ Usuário ${email} criado/atualizado com sucesso! Pronto para realizar login.`);
}

main()
  .catch(e => {
    console.error("❌ Falha:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
