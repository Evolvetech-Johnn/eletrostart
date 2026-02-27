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
- **Gerenciamento de Estado/Dados**: React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod (validação)
- **Ícones**: Lucide React
- **HTTP Client**: Axios

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: MongoDB (via Prisma ORM)
- **Autenticação**: JWT (JSON Web Tokens)
- **Uploads**: Multer
- **Geração de Arquivos**: PDFKit / ExcelJS
- **Segurança**: Helmet, CORS, Rate Limit, BcryptJS

### Infraestrutura & Ferramentas
- **Linguagem**: TypeScript (Frontend e Backend)
- **ORM**: Prisma
- **Linting**: ESLint

## 3. Estrutura de Pastas

```
eletrostart/
├── src/                    # Código fonte do Frontend
│   ├── components/         # Componentes reutilizáveis (UI, Layout)
│   ├── pages/              # Páginas da aplicação (Rotas)
│   ├── layout/             # Estruturas de layout (Admin, Public)
│   ├── hooks/              # Custom Hooks
│   ├── contexts/           # Contextos React (Auth, Cart, etc.)
│   ├── services/           # Serviços de API (Axios instances)
│   ├── utils/              # Funções utilitárias
│   └── lib/                # Configurações de bibliotecas
├── server/                 # Código fonte do Backend
│   ├── src/
│   │   ├── controllers/    # Lógica dos endpoints
│   │   ├── routes/         # Definição de rotas da API
│   │   ├── middlewares/    # Autenticação, validação, logs
│   │   └── services/       # Regras de negócio complexas
│   └── prisma/             # Schema do banco de dados e seeds
├── public/                 # Arquivos estáticos (imagens, favicon)
└── scripts/                # Scripts de manutenção/auditoria
```

## 4. Banco de Dados (Prisma Models)

O banco de dados utiliza MongoDB e está estruturado nos seguintes modelos principais:

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
- **IntegrationLog**: Logs de integrações externas.

## 5. Funcionalidades Principais

### Pública
- **Catálogo Dinâmico**: Listagem de produtos por categoria, busca e filtros.
- **Carrinho de Orçamento**: Adição de itens e finalização via WhatsApp ou sistema interno.
- **Páginas Institucionais**: Sobre, Serviços, Trabalhe Conosco (com upload de CV), etc.

### Administrativa (`/admin`)
- **Dashboard**: Visão geral de métricas.
- **Produtos**: CRUD completo de produtos, gestão de estoque e imagens.
- **Pedidos**: Visualização e atualização de status de pedidos.
- **Mensagens**: Caixa de entrada de contatos do site.
- **Configurações**: Gestão de usuários admin.

## 6. Configuração e Instalação

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

- **Build Frontend**:
  ```bash
  npm run build
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

## 7. Scripts Úteis

O `package.json` na raiz possui atalhos para manutenção:

- `npm run server:setup`: Instala dependências do server, sincroniza o banco e roda os seeds.
- `npm run audit:all`: Executa scripts de auditoria de imagens e produtos.
