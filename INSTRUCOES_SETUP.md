# 🚀 Guia de Configuração Express - Eletrostart

O sistema backend foi configurado para usar **SQLite** para facilitar o desenvolvimento imediato, removendo a necessidade de instalações complexas de banco de dados.

## 1. Instalação e Configuração Automática

Execute apenas UM comando no seu terminal raiz:

```bash
npm run server:setup
```

Isso irá instalar tudo, criar o banco de dados (arquivo `dev.db`) e criar os usuários.

## 2. Iniciar o Sistema (Modo Desenvolvimento)

Você precisará de **dois terminais** abertos:

**Terminal 1 (Frontend - Visual):**
```bash
npm run dev
```

**Terminal 2 (Backend - API):**
```bash
npm run server:dev
```

## 3. Acessar

- Painel Admin: http://localhost:5173/admin/login
- Login: `admin@eletrostart.com.br`
- Senha: `Admin@123`

---
*Nota: Para mudar para PostgreSQL em produção, basta alterar o arquivo `server/.env` e `server/prisma/schema.prisma`.*
