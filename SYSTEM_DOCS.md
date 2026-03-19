# Documentação do Sistema Eletrostart

Este documento fornece uma visão geral técnica e funcional do sistema Eletrostart.

## 1. Visão Geral

O projeto é uma aplicação web completa (Full Stack) para a Eletrostart, uma empresa de materiais elétricos e energia solar. O sistema consiste em:

- **Frontend Público**: Site institucional e catálogo de produtos.
- **Painel Administrativo**: Gestão de produtos, pedidos e mensagens de contato.
- **Backend API**: Servidor Node.js que gerencia dados e regras de negócio.

## 2. Stack Tecnológico

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Estilização**: Tailwind CSS 3
- **Roteamento**: React Router DOM 6+
- **Gerenciamento de Estado/Dados**: React Query (TanStack Query) + Context API
- **Formulários**: React Hook Form + Zod (validação)
- **HTTP Client**: Axios (com Interceptors para Auth/CSRF)
- **Ícones**: Lucide React

### Backend (`/server`)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: MongoDB (via Prisma ORM)
- **Autenticação**: JWT (JSON Web Tokens) com suporte a Cookies httpOnly e CSRF Protection
- **Segurança**: Helmet, CORS, Rate Limit, BcryptJS
- **Geração de Arquivos**: PDFKit (Relatórios), ExcelJS

## 3. Arquitetura do Frontend

O frontend está organizado para separar responsabilidades de UI, lógica de negócios e integração com API.

### Estrutura de Pastas Detalhada (`src/`)

- **`components/`**: Componentes visuais reutilizáveis.
  - `ui/`: Componentes base (Button, Input, Select) sem lógica de negócio.
  - `Navigation/`: Menus e navegação (MegaMenu).
- **`pages/`**: Telas da aplicação.
  - `admin/`: Todas as telas do painel administrativo (Dashboard, Produtos, Pedidos).
  - `Public`: Home, Products, Services, Contact, etc.
- **`context/`**: Gerenciamento de estado global.
  - `AuthContext`: Gerencia sessão do usuário (login/logout/checkAuth).
  - `CartContext`: Gerencia o carrinho de compras do cliente.
- **`services/`**: Camada de integração com o Backend.
  - `apiClient.ts`: Instância do Axios configurada com `baseURL`, interceptors para injetar Token (Bearer) e tratamento global de erros (401/403).
  - `authService.ts`: Métodos de login, logout e recuperação de perfil.
  - `productService.ts`: Métodos para buscar produtos (público e admin).
- **`layout/`**: Estruturas de página (Header + Content + Footer).

### Fluxo de Autenticação

O sistema utiliza uma abordagem híbrida/moderna para segurança:

1. **Login**: O usuário envia credenciais. O servidor retorna um JWT (via Cookie httpOnly ou Body).
2. **Persistência**: O `AuthContext` verifica a sessão ao carregar (`/auth/me`).
3. **Proteção**: Rotas administrativas (`/admin/*`) são protegidas por `ProtectedRoute`, que redireciona para login se não autenticado.
4. **CSRF**: O `apiClient` injeta automaticamente tokens CSRF em requisições mutantes (POST/PUT/DELETE) lendo cookies de segurança.

## 4. Banco de Dados (Prisma Models)

O banco de dados utiliza MongoDB e está estruturado nos seguintes modelos principais (definidos em `prisma/schema.prisma`):

### Gestão de Conteúdo

- **Category**: Categorias de produtos (com slug e imagem).
- **Product**: Produtos com suporte a variantes, especificações técnicas (JSON) e múltiplas imagens.
- **ProductVariant**: Variações de SKU, preço e estoque para um produto.
- **ProductImage**: Galeria de imagens do produto.

### Comercial

- **Order**: Pedidos realizados (status, cliente, totais, pagamento).
- **OrderItem**: Itens individuais de um pedido.
- **OrderStatusHistory**: Histórico de mudanças de status do pedido.
- **StockMovement**: Registro de movimentações de estoque (entrada/saída).

### Administrativo

- **ContactMessage**: Mensagens recebidas pelo formulário de contato.
- **AdminUser**: Usuários com acesso ao painel administrativo.
- **Tag**: Etiquetas para classificar mensagens/pedidos.
- **AuditLog**: Logs de ações realizadas no sistema (segurança/auditoria).

## 5. Configuração e Instalação

### Pré-requisitos

- Node.js (v18+)
- MongoDB (URL de conexão)

### Variáveis de Ambiente (.env)

Crie um arquivo `.env` na raiz do `server/` com:

```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="sua_chave_secreta"
PORT=3000
# Outras configurações específicas
```

### Comandos Principais

No diretório raiz:

- **Instalar dependências (Frontend)**:

  ```bash
  npm install
  ```

- **Rodar Frontend (Dev)**:
  ```bash
  npm run dev
  ```

No diretório `server/`:

- **Instalar dependências (Backend)**:

  ```bash
  npm install
  ```

- **Rodar Backend (Dev)**:

  ```bash
  npm run dev
  ```

- **Sincronizar Banco de Dados**:
  ```bash
  npx prisma db push
  ```

## 6. Scripts Úteis

O `package.json` na raiz possui atalhos para manutenção:

- `npm run server:setup`: Instala dependências do server, sincroniza o banco e roda os seeds.
- `npm run audit:all`: Executa scripts de auditoria de imagens e produtos.
