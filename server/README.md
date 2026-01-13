# Sistema de Mensagens de Contato - Backend

## 📋 Visão Geral

Backend Node.js/Express para gerenciamento de mensagens de contato do site Eletrostart.

### Funcionalidades:
- ✅ Recebimento e persistência de mensagens do formulário de contato
- ✅ Envio automático para Discord (webhook)
- ✅ API administrativa protegida por JWT
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de status das mensagens

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Instalar dependências
```bash
cd server
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/eletrostart"
JWT_SECRET="sua-chave-secreta-aqui"
DISCORD_WEBHOOK_URL="sua-url-do-webhook"
ADMIN_EMAIL="admin@seusite.com"
ADMIN_PASSWORD="SuaSenhaForte123"
```

### 3. Criar banco de dados
```bash
# No PostgreSQL
createdb eletrostart
```

### 4. Executar migrações do Prisma
```bash
npm run prisma:migrate
```

### 5. Executar seed (criar admin e dados de exemplo)
```bash
npm run seed
```

### 6. Iniciar servidor
```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

## 📡 Endpoints da API

### Públicos (sem autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/messages` | Criar nova mensagem de contato |
| GET | `/api/messages` | Estatísticas públicas |
| GET | `/api/health` | Health check |

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login administrativo |
| GET | `/api/auth/me` | Verificar token (requer auth) |

### Administrativos (requer JWT)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/dashboard` | Estatísticas do dashboard |
| GET | `/api/admin/messages` | Listar mensagens (paginado) |
| GET | `/api/admin/messages/:id` | Detalhes de uma mensagem |
| PATCH | `/api/admin/messages/:id` | Atualizar status |
| DELETE | `/api/admin/messages/:id` | Arquivar mensagem |

## 🔐 Autenticação

Todas as rotas administrativas requerem token JWT no header:
```
Authorization: Bearer <token>
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eletrostart.com.br","password":"Admin@123"}'
```

## 📊 Modelo de Dados

### ContactMessage
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| source | String | Origem (contact_form) |
| name | String? | Nome do remetente |
| email | String? | E-mail |
| phone | String? | Telefone |
| subject | String? | Assunto |
| message | String | Mensagem (obrigatório) |
| discordSent | Boolean | Enviado para Discord |
| discordMessageId | String? | ID da mensagem no Discord |
| status | Enum | NEW, READ, REPLIED, ARCHIVED |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Última atualização |

### AdminUser
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| email | String | E-mail (único) |
| password | String | Senha (hash bcrypt) |
| name | String? | Nome |
| role | String | Função (admin) |
| active | Boolean | Ativo |
| lastLogin | DateTime? | Último acesso |

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm start            # Inicia servidor em produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrações
npm run prisma:studio    # Abre Prisma Studio (GUI)
npm run seed             # Popula banco com dados iniciais
```

## 📁 Estrutura do Projeto

```
server/
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.js          # Script de seed
├── src/
│   ├── controllers/     # Lógica dos endpoints
│   ├── middlewares/     # Autenticação, etc.
│   ├── routes/          # Definição de rotas
│   ├── services/        # Serviços externos (Discord)
│   └── index.js         # Ponto de entrada
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de configuração
└── package.json
```

## 🔧 Troubleshooting

### Erro de conexão com PostgreSQL
Verifique se o PostgreSQL está rodando e as credenciais estão corretas no `.env`

### Erro de migração
```bash
npx prisma migrate reset  # Reset completo (CUIDADO: apaga dados)
npx prisma migrate dev    # Nova migração
```

### Erro de autenticação
- Verifique se o token está sendo enviado corretamente
- Confirme que o usuário existe e está ativo
- Verifique se o JWT_SECRET está configurado
