# Configuração do MySQL - Eletrostart

Guia completo para configurar o banco de dados MySQL no projeto Eletrostart.

## Pré-requisitos

| Requisito | Versão Mínima | Link |
|-----------|---------------|------|
| Python | 3.8+ | [python.org](https://python.org) |
| MySQL Server | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/) |
| pip | (incluído no Python) | - |

---

## Instalação Rápida

```powershell
cd d:\Evolvetech\Webdesign\Projetos\eletrostart
python setup_mysql.py
```

O script irá:
1. ✅ Instalar dependências Python automaticamente
2. ✅ Verificar conexão com MySQL
3. ✅ Criar banco de dados `eletrostart_db`
4. ✅ Criar todas as 10 tabelas necessárias
5. ✅ Criar usuário admin padrão (opcional)
6. ✅ Atualizar `server/.env` com as credenciais

---

## Configuração Manual

### 1. Instalar Dependências

```powershell
pip install -r requirements.txt
```

### 2. Executar o Script

```powershell
python setup_mysql.py
```

### 3. Configurar Prisma para MySQL

Edite `server/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 4. Regenerar Prisma Client

```powershell
cd server
npx prisma generate
```

---

## Credenciais Padrão

| Parâmetro | Valor |
|-----------|-------|
| Host | localhost |
| Porta | 3306 |
| Usuário | root |
| Banco | eletrostart_db |

### Admin Padrão

| Campo | Valor |
|-------|-------|
| Email | admin@eletrostart.com.br |
| Senha | Admin@123 |

---

## Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| admin_users | Usuários administrativos |
| tags | Tags de classificação |
| contact_messages | Mensagens de contato |
| contact_messages_tags | Relação mensagens ↔ tags |
| audit_logs | Log de auditoria |
| integration_logs | Log de integração Discord |
| categories | Categorias de produtos |
| products | Produtos |
| orders | Pedidos |
| order_items | Itens do pedido |

---

## Verificação Manual

### Via MySQL Workbench ou Terminal

```sql
USE eletrostart_db;
SHOW TABLES;
DESCRIBE admin_users;
SELECT * FROM admin_users;
```

---

## Troubleshooting

### Erro de Conexão

```
Erro ao conectar ao MySQL: Access denied for user 'root'@'localhost'
```

**Solução:** Verifique a senha do MySQL ou crie um novo usuário.

### MySQL não está rodando

**Windows:**
1. Pressione `Win + R`
2. Digite `services.msc`
3. Encontre "MySQL80" ou "MySQL"
4. Clique com botão direito → Iniciar

### Prisma não reconhece MySQL

```powershell
cd server
npx prisma generate
```

---

## Estrutura de Arquivos

```
eletrostart/
├── setup_mysql.py       # Script de automação
├── requirements.txt     # Dependências Python
├── docs/
│   └── SETUP_MYSQL.md   # Este arquivo
└── server/
    ├── .env             # Credenciais (atualizado automaticamente)
    └── prisma/
        └── schema.prisma # Schema do banco
```
