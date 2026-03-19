/**
 * Serviço de Reserva de Estoque
 *
 * Protege contra race conditions no checkout:
 * - "reserveStock" segura N unidades de um produto por 15 minutos
 * - "releaseStock" libera imediatamente (checkout cancelado)
 * - Cron job chama "releaseExpiredReservations" a cada 5 minutos
 *
 * Fluxo:
 *   1. Início do checkout → POST /ecommerce/cart/reserve
 *   2. Pedido confirmado  → POST /ecommerce/orders (debita stock real, libera reserva)
 *   3. Timeout (15 min)  → Cron libera reserva
 */

import { prisma } from "../lib/prisma";

const RESERVATION_TTL_MINUTES = 15;

interface ReservationItem {
  productId: string;
  quantity: number;
}

/**
 * Reserva estoque para uma sessão de checkout.
 * Libera reservas antigas da mesma sessão antes de criar novas.
 */
export async function reserveStock(
  sessionId: string,
  items: ReservationItem[],
): Promise<{ success: boolean; failedProductId?: string; failedProductName?: string }> {
  // 1. Libera reservas anteriores desta sessão
  await releaseSessionReservations(sessionId);

  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true, stockReserved: true },
      });

      if (!product) {
        return { success: false, failedProductId: item.productId };
      }

      const available = product.stock - product.stockReserved;
      if (available < item.quantity) {
        return {
          success: false,
          failedProductId: product.id,
          failedProductName: product.name,
        };
      }

      // Incrementa stockReserved
      await (tx as any).product.update({
        where: { id: product.id },
        data: { stockReserved: { increment: item.quantity } },
      });

      // Cria registro de reserva
      await (tx as any).cartReservation.create({
        data: {
          sessionId,
          productId: product.id,
          quantity: item.quantity,
          expiresAt,
        },
      });
    }

    return { success: true };
  });
}

/**
 * Libera as reservas de uma sessão específica (checkout cancelado ou finalizado)
 */
export async function releaseSessionReservations(sessionId: string): Promise<void> {
  const reservations = await (prisma as any).cartReservation.findMany({
    where: { sessionId },
  });

  if (reservations.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const res of reservations) {
      await (tx as any).product.update({
        where: { id: res.productId },
        data: { stockReserved: { decrement: res.quantity } },
      });
    }
    await (tx as any).cartReservation.deleteMany({ where: { sessionId } });
  });
}

/**
 * Libera todas as reservas expiradas (chamado pelo cron a cada 5 min)
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date();

  const expired = await (prisma as any).cartReservation.findMany({
    where: { expiresAt: { lt: now } },
  });

  if (expired.length === 0) return 0;

  console.log(`🔓 [Reservation Cron] Liberando ${expired.length} reserv${expired.length === 1 ? "a" : "as"} expirad${expired.length === 1 ? "a" : "as"}`);

  await prisma.$transaction(async (tx) => {
    for (const res of expired) {
      await (tx as any).product.update({
        where: { id: res.productId },
        data: { stockReserved: { decrement: res.quantity } },
      });
    }
    await (tx as any).cartReservation.deleteMany({
      where: { expiresAt: { lt: now } },
    });
  });

  return expired.length;
}
