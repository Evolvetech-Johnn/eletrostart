// Cron do Sistema – Snapshots Analíticos + Limpeza de Reservas de Estoque

import cron from 'node-cron';
import { generateDailySnapshot, generateMonthlySnapshot } from '../modules/executive/services/snapshot.service';
import { releaseExpiredReservations } from '../services/reservation.service';

/**
 * Inicializa os crons do sistema.
 * Deve ser chamado após a inicialização do servidor.
 */
export const initAnalyticsCron = (): void => {
  console.log('🕒 Crons do sistema inicializados');

  // Snapshot diário – todo dia às 23:59
  cron.schedule('59 23 * * *', async () => {
    console.log('⏱ Executando snapshot diário...');
    await generateDailySnapshot();
  }, {
    timezone: 'America/Sao_Paulo',
  });

  // Snapshot mensal – último dia do mês às 23:58
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

  // Limpeza de reservas de estoque expiradas — a cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      const released = await releaseExpiredReservations();
      if (released > 0) {
        console.log(`🔓 Reservas de estoque liberadas: ${released}`);
      }
    } catch (err) {
      console.error('❌ Erro ao liberar reservas expiradas:', err);
    }
  });
};
