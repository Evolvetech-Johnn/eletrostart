// Cron Analítico – Agendamento de Snapshots

import cron from 'node-cron';
import { generateDailySnapshot, generateMonthlySnapshot } from '../modules/executive/services/snapshot.service';

/**
 * Inicializa os crons analíticos do sistema executivo.
 * Deve ser chamado após a inicialização do servidor.
 */
export const initAnalyticsCron = (): void => {
  console.log('🕒 Cron analítico inicializado');

  // Snapshot diário – todo dia às 23:59
  cron.schedule('59 23 * * *', async () => {
    console.log('⏱ Executando snapshot diário...');
    await generateDailySnapshot();
  }, {
    timezone: 'America/Sao_Paulo',
  });

  // Snapshot mensal – último dia do mês às 23:58
  // Verificação: se hoje é o último dia do mês
  cron.schedule('58 23 28-31 * *', async () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() === lastDayOfMonth) {
      console.log('⏱ Executando snapshot mensal...');
      await generateMonthlySnapshot();
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });
};
