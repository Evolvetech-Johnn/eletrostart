# Documentação do Backend - Eletrostart

Este documento detalha a estrutura, tecnologias e API do backend do projeto Eletrostart.

## 🛠 Tecnologias Utilizadas

- **Runtime**: Node.js
- **Framework Web**: Express.js
- **Banco de Dados**: SQLite
- **ORM**: Prisma
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: bcryptjs (hashing de senhas), cors
- **Integração**: Discord Webhook (para notificações de mensagens)

## 📂 Estrutura de Pastas

```
server/
├── prisma/                 # Arquivos do banco de dados e ORM
│   ├── dev.db              # Banco de dados SQLite
│   ├── schema.prisma       # Esquema do banco de dados
│   └── seed.js             # Script para popular banco inicial
├── src/                    # Código fonte
│   ├── controllers/        # Lógica de controle das requisições
│   ├── middlewares/        # Middlewares (auth, validação)
│   ├── routes/             # Definição das rotas da API
│   ├── services/           # Serviços externos (ex: Discord)
│   └── index.js            # Ponto de entrada da aplicação
├── .env                    # Variáveis de ambiente
└── package.json            # Dependências e scripts
```

## 🗄️ Banco de Dados (Prisma Schema)

O banco de dados possui duas tabelas principais:

### 1. `ContactMessage` (contact_messages)
Armazena as mensagens enviadas pelo formulário de contato.
- **id**: UUID
- **source**: Origem (default: "contact_form")
- **name, email, phone**: Dados do remetente
- **subject, message**: Conteúdo da mensagem
- **discordSent**: Status de envio para o Discord
- **status**: Status da mensagem (NEW, READ, ARCHIVED)
- **timestamps**: createdAt, updatedAt

### 2. `AdminUser` (admin_users)
Armazena os usuários administrativos do sistema.
- **id**: UUID
- **email**: E-mail (único)
- **password**: Hash da senha
- **role**: Função (default: "ADMIN")
- **active**: Status da conta
- **lastLogin**: Timestamp do último acesso

## 🚀 API Endpoints

### Autenticação (`/api/auth`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/login` | Login de administrador | Não |
| GET | `/me` | Verificar token e dados do usuário | Sim |
| POST | `/register` | Criar novo admin | Sim |

### Mensagens Públicas (`/api/messages`)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/` | Enviar nova mensagem de contato | Não |
| GET | `/` | Estatísticas públicas | Não |

### Administração (`/api/admin`)
*Requer Header `Authorization: Bearer <token>`*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dashboard` | Estatísticas gerais do dashboard |
| GET | `/messages` | Listar mensagens (com paginação/filtros) |
| GET | `/messages/:id` | Detalhes de uma mensagem específica |
| PATCH | `/messages/:id` | Atualizar status da mensagem |
| DELETE | `/messages/:id` | Arquivar/Deletar mensagem |

## ⚙️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento (nodemon).
- `npm start`: Inicia o servidor em modo de produção.
- `npm run prisma:generate`: Gera os tipos do Prisma Client.
- `npm run prisma:migrate`: Executa migrações do banco de dados.
- `npm run prisma:studio`: Abre interface visual para gerenciar o banco.
- `npm run seed`: Popula o banco com dados iniciais.
