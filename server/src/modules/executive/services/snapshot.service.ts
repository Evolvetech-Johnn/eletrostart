// Executive Module – Snapshot Service (cron analítico)

import { executiveRepository } from '../repositories/executive.repository';

const COST_RATIO = 0.60; // Ratio de custo estimado (sem campo costPrice no produto)

/**
 * Gera snapshot diário para uma data específica (padrão: ontem)
 */
export const generateDailySnapshot = async (targetDate?: Date): Promise<void> => {
  const date = targetDate ?? new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  const periodRef = start.toISOString().split('T')[0]; // "2025-01-27"

  try {
    const orders = await executiveRepository.getOrdersWithItems({ startDate: start, endDate: end });

    const revenue = orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const cost = revenue * COST_RATIO;
    const grossProfit = revenue - cost;
    const ordersCount = orders.length;
    const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;

    await executiveRepository.upsertSnapshot({
      periodType: 'daily',
      periodRef,
      revenue,
      cost,
      grossProfit,
      ordersCount,
      avgTicket,
    });

    console.log(`✅ Snapshot diário gerado: ${periodRef} | Receita: R$${revenue.toFixed(2)} | Pedidos: ${ordersCount}`);
  } catch (error) {
    console.error(`❌ Erro ao gerar snapshot diário (${periodRef}):`, error);
  }
};

/**
 * Gera snapshot mensal para um mês específico (padrão: mês atual)
 */
export const generateMonthlySnapshot = async (targetDate?: Date): Promise<void> => {
  const date = targetDate ?? new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  const periodRef = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "2025-01"

  try {
    const orders = await executiveRepository.getOrdersWithItems({ startDate: start, endDate: end });

    const revenue = orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
    const cost = revenue * COST_RATIO;
    const grossProfit = revenue - cost;
    const ordersCount = orders.length;
    const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;

    await executiveRepository.upsertSnapshot({
      periodType: 'monthly',
      periodRef,
      revenue,
      cost,
      grossProfit,
      ordersCount,
      avgTicket,
    });

    console.log(`✅ Snapshot mensal gerado: ${periodRef} | Receita: R$${revenue.toFixed(2)} | Pedidos: ${ordersCount}`);
  } catch (error) {
    console.error(`❌ Erro ao gerar snapshot mensal (${periodRef}):`, error);
  }
};
