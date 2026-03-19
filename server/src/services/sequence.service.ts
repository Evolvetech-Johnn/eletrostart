import { prisma } from "../lib/prisma";

export class SequenceService {
  /**
   * Obtém o próximo valor de uma sequência e o incrementa de forma atômica.
   * Em bancos que suportam findAndModify (como MongoDB), isso garante unicidade.
   */
  async getNextSequence(key: string): Promise<number> {
    const sequence = await prisma.sequence.upsert({
      where: { key },
      update: { value: { increment: 1 } },
      create: { key, value: 1 },
    });

    return sequence.value;
  }

  /**
   * Formata um número de sequência no padrão especificado.
   * Ex: 5 -> "PN000000000005"
   */
  formatOrderNumber(value: number): string {
    return `PN${String(value).padStart(12, "0")}`;
  }
}

export const sequenceService = new SequenceService();
