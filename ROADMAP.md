# 🗺️ Roadmap Profissional de Aperfeiçoamento — Eletrostart

**Versão:** 1.0 — Março de 2026  
**Avaliação Atual:** ⭐ 7.2 / 10  
**Meta:** ⭐ 9.3 / 10 (Nível Enterprise)

---

## Avaliação por Critério

| Critério | Nota Atual | Meta |
|---|---|---|
| Arquitetura | 8/10 | 9/10 |
| Segurança | 6/10 | 9/10 |
| Performance | 7/10 | 9/10 |
| Escalabilidade | 6/10 | 9/10 |
| Qualidade de Código | 8/10 | 9/10 |

---

## 🔴 FASE 1 — Segurança e Hardening `[EM ANDAMENTO]`

**Prioridade: CRÍTICA**

### 1.1 Migrar JWT para Cookie HttpOnly
- **Status:** ✅ Completo (Hardening finalizado - token removido do body)
- **Melhoria aplicada:** Token em cookie `httpOnly` + instrumentação de logs para detecção de uso legado.
- **Arquivos consolidados:** `auth.controller.ts`, `auth.middleware.ts`, `apiClient.ts`, `AdminLogin.tsx`

### 1.2 Implementar CSRF Protection
- **Status:** ✅ Completo (Double Submit Cookie ativo)
- **Implementação:** Middleware `csrf.middleware.ts` protegendo todas as rotas mutantes `/api`.
- **Validação:** Header `X-CSRF-Token` obrigatório para POST/PUT/PATCH/DELETE.

### 1.3 Upload Seguro
- **Status:** ✅ Completo (Multer + Magic Numbers + Cloudinary)
- **Melhorias consolidadas:**
  - Limite de tamanho (5 MB) e MIME validation.
  - Validação de Magic Numbers (Sniffing binário) contra extensões fakes.
  - Integração com **Cloudinary** (CDN) com fallback local seguro.

### 1.4 Rate Limit por Endpoint
- **Status:** ✅ Completo
- **Implementação:** `loginLimiter` específico para tentativas de login e CSRF (5 req/15min).

---

## 🟡 FASE 2 — Arquitetura Profissional `[PLANEJADO]`

### 2.1 Camadas de Domínio DDD
- **Status:** ⬜ Planejado
- **Objetivo:** Separar lógica de negócio dos controllers
- **Nova estrutura:**
```
modules/
  orders/
    order.controller.ts    ← HTTP Request/Response apenas
    order.service.ts       ← Orquestração de Use Cases
    order.domain.ts        ← Regras de negócio puras
    order.repository.ts    ← Acesso ao Prisma
```
> O `modules/executive/` já segue este padrão. Expandir para `orders/`, `products/`, `inventory/`.

### 2.2 Centralizar Regras de Negócio
- **Problema atual:** Lógica de estoque e auditoria dispersa nos controllers
- **Solução:**
```typescript
// Fluxo ideal em OrderService
OrderService.createOrder()
  → StockService.reserveStock()
  → PaymentService.initiate()
  → AuditService.log()
```

---

## ⚡ FASE 3 — Performance e Escalabilidade `[PLANEJADO]`

### 3.1 Cache Redis
- **TTLs recomendados:**

| Recurso | Cache TTL |
|---|---|
| Produtos (listagem) | 5 minutos |
| Categorias | 1 hora |
| Analytics Snapshot | 30 minutos |

- **Stack:** Redis (Upstash para Render, gratuito) + `ioredis`

### 3.2 CDN para Imagens
- **Hoje:** URLs diretas (links externos ou sem storage)
- **Migrar para:** Cloudinary (tier gratuito generoso)
  - Compressão automática
  - Conversão para WebP
  - Thumbnails on-demand
  - Transformações via URL

### 3.3 Índices MongoDB
- Adicionar/verificar índices críticos:
```prisma
@@index([sku])
@@index([slug])
@@index([categoryId, active])
@@index([createdAt, status])  // Order
```

---

## 💼 FASE 4 — Fluxo Comercial Profissional `[PLANEJADO]`

### 4.1 Estados Formais de Pedido
- **Hoje:** `PENDING → PAID → SHIPPED → DELIVERED → CANCELED`
- **Melhor:**
```
CREATED → PAYMENT_PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
                                              ↘ CANCELED → REFUNDED
```

### 4.2 Reserva de Estoque no Checkout
- **Problema:** 2 usuários podem comprar o mesmo último item
- **Solução:**
  - Campo `stockReserved` no `Product`
  - Reservar ao iniciar checkout, liberar se não finalizar em X minutos
  - Confirmar reserva ao pagar

### 4.3 Integração de Pagamento
- **Opções:** MercadoPago (mais popular no Brasil), PagSeguro, Stripe
- **Fluxo:**
```
Checkout → Criar Pagamento → Webhook do Gateway → Confirmar Pedido → Notificar por Email
```

---

## 📊 FASE 5 — Observabilidade `[PLANEJADO]`

### 5.1 Logs Estruturados
- Substituir `console.log` por `pino` (mais performático) ou `winston`
- Formato JSON para integração com ferramentas de log

### 5.2 Error Tracking
- **Ferramenta:** Sentry (tier gratuito para projetos pequenos)
- Captura automática de erros no frontend e backend
- Stack traces com contexto de usuário

### 5.3 Monitoramento
- **Simples:** UptimeRobot (grátis) para alertas de downtime
- **Completo:** Grafana + Prometheus (self-hosted) ou Datadog

---

## 🧪 FASE 6 — Testes Automatizados `[PLANEJADO]`

### 6.1 Backend
- **Framework:** Vitest + Supertest
- **Cobrir:**
  - `auth.controller.ts` — Login, token, roles
  - `product.service.ts` — Validações de preço mínimo
  - `order` flow — Criação, estoque, status

### 6.2 Frontend
- **Framework:** React Testing Library + Vitest
- **Cobrir:**
  - Formulário de checkout
  - Lógica do carrinho e variantes
  - Fluxo de login admin

---

## 📦 FASE 7 — DevOps Profissional `[FUTURO]`

### 7.1 CI/CD com GitHub Actions
```yaml
# .github/workflows/deploy.yml
jobs:
  lint → test → build → deploy
```

### 7.2 Dockerização
```
Dockerfile (backend)
Dockerfile (frontend)
docker-compose.yml (dev local)
```

### 7.3 Separação de Ambientes
- `dev` — Local com hot-reload
- `staging` — Ambiente de homologação (Render free tier)
- `production` — Render com variáveis de produção

---

## 🧭 Melhorias UX Adicionais

| Melhoria | Ferramenta | Impacto |
|---|---|---|
| Busca avançada | Algolia / Meilisearch | Alto |
| "Quem comprou também comprou" | Lógica custom ou ML | Médio |
| Carrinho persistente no backend | Tabela `Cart` no Prisma | Alto |

---

## Sequência de Execução Recomendada

```
Fase 1 (Segurança)     ← AGORA — Cookie HttpOnly, CSRF, Upload, Rate Limit
Fase 4 (Comercial)     ← PRÓXIMO — Pagamento, Estoque Reservado
Fase 3 (Performance)   ← DEPOIS — Redis, CDN, Índices
Fase 2 (Arquitetura)   ← MÉDIO PRAZO — Refatoração DDD
Fase 5 (Observabilidade)
Fase 6 (Testes)
Fase 7 (DevOps)        ← LONGO PRAZO
```

---

_Mantenha este documento atualizado marcando os itens conforme forem concluídos._
