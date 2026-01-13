// Seed script para criar o usuário admin inicial
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin padrão
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eletrostart.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  // Verificar se já existe
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('ℹ️  Usuário admin já existe:', adminEmail);
  } else {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Criar admin
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin'
      }
    });

    console.log('✅ Usuário admin criado:', admin.email);
  }

  // Criar algumas mensagens de exemplo
  const existingMessages = await prisma.contactMessage.count();
  
  if (existingMessages === 0) {
    const sampleMessages = [
      {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '(43) 99999-1111',
        subject: 'Orçamento',
        message: 'Gostaria de um orçamento para instalação elétrica residencial.',
        status: 'NEW',
        discordSent: true
      },
      {
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        phone: '(43) 98888-2222',
        subject: 'Dúvida sobre produto',
        message: 'Vocês trabalham com painéis solares? Qual a potência disponível?',
        status: 'READ',
        discordSent: true
      },
      {
        name: 'Pedro Oliveira',
        email: 'pedro@exemplo.com',
        phone: '(43) 97777-3333',
        subject: 'Parceria',
        message: 'Tenho interesse em ser revendedor. Como funciona?',
        status: 'REPLIED',
        discordSent: true
      }
    ];

    for (const msg of sampleMessages) {
      await prisma.contactMessage.create({ data: msg });
    }

    console.log('✅ Mensagens de exemplo criadas');
  }

  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
