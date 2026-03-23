import cron from "node-cron";
import { releaseExpiredReservations } from "../services/reservation.service";

/**
 * Inicializa o cron job de limpeza de reservas de estoque.
 * Executa a cada 5 minutos.
 */
export function initReservationCron() {
  // Executa a cada 5 minutos
  cron.schedule("*/5 * * * *", async () => {
    try {
      const count = await releaseExpiredReservations();
      if (count > 0) {
        console.log(`[Cron] 🔓 ${count} reserva(s) de estoque expirada(s) liberada(s).`);
      }
    } catch (error) {
      console.error("[Cron] ❌ Erro ao liberar reservas expiradas:", error);
    }
  });

  console.log("⏰ Cron de Reserva de Estoque iniciado (5min interval)");
}
