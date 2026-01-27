
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Teste de Verificação MongoDB Atlas...');
  
  try {
    // 1. Testar Conexão
    console.log('📡 Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    // 2. Testar Operação de Leitura (Admin User)
    console.log('🔍 Buscando Admin User padrão...');
    const admin = await prisma.adminUser.findFirst();
    if (admin) {
        console.log(`✅ Usuário Admin encontrado: ${admin.email}`);
    } else {
        console.log('⚠️ Nenhum usuário admin encontrado.');
    }

    // 3. Testar Operação de Escrita (Criar Mensagem de Teste)
    console.log('📝 Criando mensagem de teste de integração...');
    const testMessage = await prisma.contactMessage.create({
        data: {
            name: "Teste Automatizado",
            email: "teste@eletrostart.com",
            message: "Verificação de funcionamento do MongoDB Atlas",
            subject: "Teste de Integração",
            status: "NEW",
            discordSent: false
        }
    });
    console.log(`✅ Mensagem criada com ID: ${testMessage.id}`);

    // 4. Testar Operação de Atualização
    console.log('🔄 Atualizando status da mensagem...');
    const updated = await prisma.contactMessage.update({
        where: { id: testMessage.id },
        data: { status: "ARCHIVED" }
    });
    console.log(`✅ Status atualizado para: ${updated.status}`);

    // 5. Testar Operação de Deleção
    console.log('🗑️ Excluindo mensagem de teste...');
    await prisma.contactMessage.delete({
        where: { id: testMessage.id }
    });
    console.log('✅ Mensagem excluída com sucesso!');

    console.log('🎉 TODOS OS TESTES PASSARAM! MongoDB Atlas está operando corretamente.');

  } catch (error) {
    console.error('❌ ERRO DURANTE A VERIFICAÇÃO:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
