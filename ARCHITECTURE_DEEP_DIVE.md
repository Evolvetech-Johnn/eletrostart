# Relatório de Análise Profunda de Arquitetura - Eletrostart

**Data:** 11/02/2026
**Autor:** Assistente de IA (Gemini-3-Pro-Preview)
**Contexto:** Análise solicitada da base de código Frontend (React/Vite) e Backend (Node/Express/Prisma/MongoDB).

---

## 1. Resumo Executivo

O projeto encontra-se em um estado de **transição ativa**. A arquitetura base é sólida (MERN Stack com TypeScript no Backend), mas sofre de fragmentação devido a migrações parciais (JS para TS) e duplicidade de padrões (Fetch vs Axios).

A infraestrutura de e-commerce (Produtos, Pedidos) está funcional, mas depende fortemente de scripts manuais para manutenção de dados, sugerindo que o painel administrativo ainda não cobre todas as necessidades operacionais.

---

## 2. Análise Frontend (React / Vite)

### 2.1. Estrutura e Organização

- **Hibridismo JS/TS:** O projeto mistura arquivos `.js`, `.jsx`, `.ts` e `.tsx`.
  - `src/pages/admin/*`: Predominantemente **TypeScript/TSX**. (Moderno)
  - `src/pages/*` (Público): Predominantemente **JavaScript/JSX**. (Legado)
  - **Risco:** Inconsistência na tipagem de dados compartilhados (ex: interfaces de Produto) entre o Admin e a Loja Pública.

### 2.2. Camada de Serviço (Redundância Crítica)

Detectamos duas implementações paralelas de clientes HTTP:

1.  **`src/services/api.js`**: Implementação legada baseada em `fetch`. Contém lógica manual de interceptação e uma "God Object" exportando todos os métodos.
2.  **`src/services/apiClient.ts`**: Implementação moderna baseada em `axios`. Utiliza interceptors para tratamento de erros e tipagem.

- **Problema:** Manter ambos cria débito técnico e risco de bugs onde uma correção (ex: renovação de token) é aplicada em um e esquecida no outro.

### 2.3. Gerenciamento de Estado

- **Context API:** Utilizado para `AuthContext` (TS) e `CartContext` (JS).
- **Persistência:** O carrinho e o token de autenticação dependem inteiramente do `localStorage`.
- **Segurança:** O armazenamento de JWT no `localStorage` expõe a aplicação a ataques XSS.

---

## 3. Análise Backend (Node.js / Express / Prisma)

### 3.1. Arquitetura

- **Padrão Controller-Service:** Bem implementado. A separação de responsabilidades é clara.
- **Middleware:** `auth.middleware.ts` valida roles.
  - **Ponto de Atenção:** A verificação `req.user.role !== "ADMIN"` é _case-sensitive_. Se o sistema de criação de usuários (ou scripts manuais) inserir "admin" (minúsculo), o acesso será negado, gerando falhas silenciosas de permissão.

### 3.2. Banco de Dados (Prisma & MongoDB)

- **Schema Híbrido:** O `schema.prisma` define modelos rígidos (`Product`, `Category`) mas recorre a campos `Json` (`variants`, `features`) para flexibilidade.
  - **Prós:** Permite evolução rápida de features de produtos sem migrations complexas.
  - **Contras:** Perda de validação de tipo no nível do banco. A integridade dos dados depende inteiramente da validação da aplicação (Zod/Joi, se houver).

### 3.3. Scripts e Manutenção

- A pasta `server/src/scripts` contém muitos scripts de "fix" (`fixZeroPrices.ts`, `syncImages.ts`, `debugCategories.ts`).
- **Diagnóstico:** A presença frequente desses scripts sugere que o sistema não possui validações fortes na entrada de dados ou que a importação inicial de dados foi problemática. O banco de dados parece exigir "curadoria" constante via código.

---

## 4. Recomendações e Roadmap

### Prioridade Alta (Imediato)

1.  **Consolidar Cliente API:**
    - Deprecar `src/services/api.js`.
    - Migrar todas as chamadas para usar `src/services/apiClient.ts`.
    - Mover métodos soltos do `api.js` para serviços específicos (ex: `productService.ts`, `authService.ts`).
2.  **Padronização de Roles:**
    - Verificar e normalizar todos os usuários no banco para `role: "ADMIN"`.
    - Garantir que o `auth.controller.ts` force `.toUpperCase()` na criação/login.

### Prioridade Média (Curto Prazo)

3.  **Migração CartContext:** Converter `CartContext.jsx` para `.tsx` para compartilhar as interfaces de `Product` e `CartItem` com o Backend.
4.  **Code Splitting:** Implementar `React.lazy` nas rotas administrativas para reduzir o bundle inicial da loja pública.

### Prioridade Baixa (Longo Prazo)

5.  **Segurança de Token:** Migrar de `localStorage` para Cookies `httpOnly` + `Secure`.
6.  **Painel de Controle de Dados:** Transformar os scripts de manutenção (`server/src/scripts`) em funcionalidades do painel administrativo, permitindo que administradores não-técnicos corrijam preços/estoque em massa.

---

_Fim do Relatório_
