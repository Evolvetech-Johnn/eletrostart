/**
 * Serviço de Cache com Redis
 * 
 * Implementa cache distribuído usando ioredis.
 * Usa um fallback graceful: se não houver REDIS_URL configurada, o serviço
 * apenas retornará "null" nos gets e ignorará os sets, sem quebrar a aplicação.
 */

import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

class CacheService {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    if (REDIS_URL) {
      try {
        this.client = new Redis(REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 1, // Não travar reqs tentando conectar pro resto da vida
          retryStrategy: (times) => {
            if (times > 3) return null; // Para de tentar após 3 erros
            return Math.min(times * 100, 3000);
          }
        });

        this.client.on("connect", () => {
          this.isConnected = true;
          console.log("⚡ [Redis] Conectado com sucesso");
        });

        this.client.on("error", (err) => {
          this.isConnected = false;
          console.warn("⚠️ [Redis] Erro de conexão, fallback ativado:", err.message);
        });
      } catch (err) {
        console.warn("⚠️ [Redis] Falha na inicialização do cliente, fallback ativado.");
      }
    } else {
      console.log("ℹ️ [Redis] REDIS_URL não configurada. Operando sem cache (fallback in memory omitido p/ Render).");
    }
  }

  // Obter valor do cache
  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.warn(`[Redis] Erro ao ler key ${key}`);
      return null;
    }
  }

  // Setar valor no cache com TTL (tempo de vida) em segundos
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      console.warn(`[Redis] Erro ao gravar key ${key}`);
    }
  }

  // Deletar keys por padrão (ex: invalidate('products:*'))
  // No Redis "scanStream" é melhor que "keys *" para não travar event loop em bases grandes
  async invalidate(pattern: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    
    try {
      if (!pattern.includes("*")) {
        await this.client.del(pattern);
        return;
      }

      const stream = this.client.scanStream({
        match: pattern,
        count: 100
      });

      stream.on("data", async (keys: string[]) => {
        if (keys.length) {
          const pipeline = this.client!.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      });
      
      stream.on("error", (err) => {
        console.warn(`[Redis] Erro escaneando keys para '${pattern}':`, err.message);
      });
      
      return new Promise((resolve) => {
        stream.on("end", () => resolve());
      });
      
    } catch (err) {
      console.warn(`[Redis] Erro ao invalidar keys com pattern ${pattern}`);
    }
  }
}

export const cacheService = new CacheService();
