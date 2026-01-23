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
- MongoDB Atlas (conta gratuita)
- npm ou yarn

### 1. Instalar dependências
```bash
cd server
npm install
```

### 2. Configurar MongoDB Atlas
Siga o guia em `MONGODB_MIGRATION.md` para:
- Criar conta no MongoDB Atlas
- Criar cluster (M0 free tier)
- Configurar acesso (usuário e IP whitelist)
- Obter string de conexão

### 3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/eletrostart?retryWrites=true&w=majority"
JWT_SECRET="sua-chave-secreta-aqui"
DISCORD_WEBHOOK_URL="sua-url-do-webhook"
ADMIN_EMAIL="admin@seusite.com"
ADMIN_PASSWORD="SuaSenhaForte123"
```

### 4. Gerar Prisma Client e criar collections
```bash
npx prisma generate
npx prisma db push
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
npm run dev               # Inicia servidor em modo desenvolvimento
npm start                 # Inicia servidor em produção
npm run prisma:generate   # Gera cliente Prisma
npm run prisma:studio     # Abre Prisma Studio (GUI)
npm run seed              # Popula banco com dados iniciais
npx prisma db push        # Sincroniza schema com MongoDB
npx prisma validate       # Valida o schema
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

### Erro de conexão com MongoDB Atlas
- Verifique se a connection string está correta no `.env`
- Confirme que seu IP está na whitelist do MongoDB Atlas
- Teste a conexão com MongoDB Compass

### Erro de schema
```bash
npx prisma validate       # Valida o schema
npx prisma generate       # Regenera o cliente
npx prisma db push        # Sincroniza com MongoDB
```

### Erro de autenticação
- Verifique se o token está sendo enviado corretamente
- Confirme que o usuário existe e está ativo
- Verifique se o JWT_SECRET está configurado

### Discord não está funcionando
- Verifique se DISCORD_BOT_TOKEN está configurado corretamente
- O erro de TokenInvalid não afeta as funcionalidades principais do backend
- Configure as credenciais do Discord apenas se quiser usar a integração

