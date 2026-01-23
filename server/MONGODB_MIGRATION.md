# Guia de Migração para MongoDB Atlas

## Visão Geral

Este guia documenta a migração do projeto Eletrostart de SQLite para MongoDB Atlas. O MongoDB Atlas é um serviço de banco de dados em nuvem totalmente gerenciado que oferece escalabilidade, segurança e alta disponibilidade.

## Por que MongoDB Atlas?

- **Escalabilidade**: Cresce com seu negócio sem necessidade de reconfiguração
- **Nuvem Nativa**: Totalmente gerenciado, sem necessidade de manutenção de servidor
- **JSON Nativo**: Suporte nativo para dados JSON (produtos, variantes, especificações)
- **Free Tier**: 512MB gratuitos para desenvolvimento e pequenos projetos
- **Backup Automático**: Backups automáticos e recuperação de desastres
- **Global**: Clusters distribuídos globalmente para melhor performance

## Principais Mudanças

### 1. Schema do Prisma

#### IDs (ObjectId vs UUID)
**Antes (SQLite):**
```prisma
model Product {
  id String @id @default(uuid())
}
```

**Depois (MongoDB):**
```prisma
model Product {
  id String @id @default(auto()) @map("_id") @db.ObjectId
}
```

#### Campos JSON
**Antes (SQLite - JSON como String):**
```prisma
model Product {
  variants String? // JSON stringificado
}
```

**Depois (MongoDB - JSON Nativo):**
```prisma
model Product {
  variants Json? // Tipo nativo
}
```

#### Tipos Decimais
**Antes (SQLite):**
```prisma
model Product {
  price Decimal @default(0.0)
}
```

**Depois (MongoDB):**
```prisma
model Product {
  price Float @default(0.0)
}
```

#### Relações Many-to-Many
**Antes (SQLite - Implícito):**
```prisma
model Tag {
  messages ContactMessage[]
}
```

**Depois (MongoDB - Explícito):**
```prisma
model Tag {
  messageIds String[] @db.ObjectId
  messages   ContactMessage[] @relation(fields: [messageIds], references: [id])
}
```

### 2. String de Conexão

**SQLite:**
```
DATABASE_URL="file:./dev.db"
```

**MongoDB Atlas:**
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/eletrostart?retryWrites=true&w=majority"
```

## Configuração do MongoDB Atlas

### Passo 1: Criar Conta

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Clique em "Try Free"
3. Crie sua conta (pode usar Google/GitHub)

### Passo 2: Criar Cluster

1. Após login, clique em "Build a Database"
2. Escolha **M0 (Free)** para desenvolvimento
3. Selecione o provedor de nuvem (AWS, Google Cloud, ou Azure)
4. Escolha a região mais próxima (ex: São Paulo para Brasil)
5. Nomeie seu cluster (ex: "eletrostart-cluster")
6. Clique em "Create"

### Passo 3: Configurar Acesso

#### 3.1 Criar Usuário do Banco de Dados

1. No menu lateral, clique em "Database Access"
2. Clique em "Add New Database User"
3. Escolha "Password" como método de autenticação
4. Defina username e password
   - **IMPORTANTE**: Anote estas credenciais!
   - Evite caracteres especiais na senha (ou use URL encoding)
5. Em "Database User Privileges", selecione "Read and write to any database"
6. Clique em "Add User"

#### 3.2 Configurar IP Whitelist

1. No menu lateral, clique em "Network Access"
2. Clique em "Add IP Address"
3. Para desenvolvimento:
   - Clique em "Allow Access from Anywhere" (0.0.0.0/0)
   - **ATENÇÃO**: Para produção, use IPs específicos!
4. Clique em "Confirm"

### Passo 4: Obter String de Conexão

1. Volte para "Database" no menu lateral
2. No seu cluster, clique em "Connect"
3. Escolha "Connect your application"
4. Selecione "Node.js" como driver
5. Copie a connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. Substitua:
   - `<username>` pelo usuário criado
   - `<password>` pela senha
   - Adicione o nome do banco após `.net/`: `/eletrostart`

**Exemplo final:**
```
mongodb+srv://eletrouser:MinhaSenh@123@cluster0.abc123.mongodb.net/eletrostart?retryWrites=true&w=majority
```

**Se a senha tiver caracteres especiais, faça URL encoding:**
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`

## Configuração do Projeto

### 1. Atualizar .env

Edite o arquivo `server/.env`:

```bash
# Substitua a linha DATABASE_URL existente por:
DATABASE_URL="mongodb+srv://seu-usuario:sua-senha@seu-cluster.mongodb.net/eletrostart?retryWrites=true&w=majority"
```

### 2. Gerar Prisma Client

```bash
cd server
npx prisma generate
```

### 3. Criar Coleções no MongoDB

```bash
npx prisma db push
```

Este comando:
- Conecta ao MongoDB Atlas
- Cria as coleções baseadas no schema
- Não cria arquivos de migração (MongoDB não usa migrações SQL)

### 4. Popular com Dados Iniciais

```bash
npm run seed
```

Isso criará:
- Usuário admin padrão
- Usuário Henrique
- Mensagens de exemplo

### 5. Verificar no MongoDB Atlas

1. Acesse MongoDB Atlas Dashboard
2. Clique em "Browse Collections"
3. Selecione o database "eletrostart"
4. Você deve ver as coleções:
   - `admin_users`
   - `contact_messages`
   - `tags`
   - `audit_logs`
   - `integration_logs`
   - `categories`
   - `products`
   - `orders`
   - `order_items`

## Migração de Dados (Se Necessário)

Se você tem dados existentes no SQLite que precisa migrar:

### Opção 1: Export/Import Manual via Prisma Studio

1. **Exportar do SQLite:**
   ```bash
   # Com SQLite configurado
   npx prisma studio
   ```
   - Copie os dados manualmente

2. **Importar no MongoDB:**
   ```bash
   # Com MongoDB configurado
   npx prisma studio
   ```
   - Cole os dados

### Opção 2: Script de Migração (Para grandes volumes)

Crie um script `migrate-data.js`:

```javascript
import { PrismaClient } from '@prisma/client';

// Cliente SQLite
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// Cliente MongoDB
const mongoClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URL
    }
  }
});

async function migrate() {
  // Migrar usuários admin
  const users = await sqliteClient.adminUser.findMany();
  for (const user of users) {
    await mongoClient.adminUser.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        active: user.active,
        lastLogin: user.lastLogin,
      }
    });
  }
  
  // Migrar mensagens
  const messages = await sqliteClient.contactMessage.findMany();
  for (const msg of messages) {
    await mongoClient.contactMessage.create({
      data: {
        source: msg.source,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        subject: msg.subject,
        message: msg.message,
        status: msg.status,
        priority: msg.priority,
        discordSent: msg.discordSent,
        // ... outros campos
      }
    });
  }
  
  console.log('Migração concluída!');
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await sqliteClient.$disconnect();
    await mongoClient.$disconnect();
  });
```

## Comandos Úteis

### Desenvolvimento

```bash
# Validar schema
npx prisma validate

# Gerar cliente
npx prisma generate

# Sincronizar schema com banco
npx prisma db push

# Abrir Prisma Studio
npx prisma studio

# Popular banco
npm run seed

# Iniciar servidor
npm run dev
```

### Produção

```bash
# Gerar cliente otimizado
npx prisma generate

# Sincronizar schema
npx prisma db push

# Popular dados iniciais
npm run seed

# Iniciar servidor
npm start
```

## Diferenças Importantes

### 1. Não há Migrações SQL

MongoDB não usa arquivos de migração SQL. Use `prisma db push` em vez de `prisma migrate dev`.

### 2. IDs são ObjectId

- MongoDB usa ObjectId (24 caracteres hex)
- SQLite usava UUID (36 caracteres com hífens)
- Ao fazer queries, use strings normalmente

### 3. JSON é Nativo

```javascript
// Antes (SQLite)
const product = await prisma.product.create({
  data: {
    variants: JSON.stringify([{ name: '3000K' }])
  }
});
const variants = JSON.parse(product.variants);

// Depois (MongoDB)
const product = await prisma.product.create({
  data: {
    variants: [{ name: '3000K' }]
  }
});
const variants = product.variants; // Já é objeto
```

### 4. Float vs Decimal

MongoDB usa Float (menos precisão que Decimal). Para valores monetários:
- Armazene em centavos (Int) se precisar de precisão exata
- Ou use bibliotecas como `decimal.js` no código

## Troubleshooting

### Erro: "Authentication failed"

- Verifique username e password na connection string
- Certifique-se de fazer URL encoding de caracteres especiais
- Verifique se o usuário foi criado no MongoDB Atlas

### Erro: "IP not whitelisted"

- Adicione seu IP em Network Access no MongoDB Atlas
- Para desenvolvimento, pode usar 0.0.0.0/0 (qualquer IP)

### Erro: "Cannot connect to database"

- Verifique se o cluster está ativo (pode demorar alguns minutos após criação)
- Teste a connection string no MongoDB Compass
- Verifique sua conexão com a internet

### Erro: "Database does not exist"

- MongoDB cria o database automaticamente na primeira inserção
- Execute `npx prisma db push` e depois `npm run seed`

### Performance Lenta

- Free tier (M0) tem limitações de performance
- Considere upgrade para M2/M5 em produção
- Verifique se escolheu a região mais próxima

## Recursos Adicionais

- [Documentação Prisma + MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Cursos gratuitos
- [Prisma Studio](https://www.prisma.io/studio) - Interface visual para dados

## Suporte

Para problemas específicos:
1. Verifique os logs do servidor
2. Use `npx prisma validate` para verificar o schema
3. Teste a conexão com MongoDB Compass
4. Consulte a documentação do Prisma

## Conclusão

A migração para MongoDB Atlas oferece:
- ✅ Melhor escalabilidade
- ✅ Suporte nativo a JSON
- ✅ Backup automático
- ✅ Infraestrutura gerenciada
- ✅ Free tier generoso para desenvolvimento

O projeto está pronto para crescer com MongoDB Atlas! 🚀
