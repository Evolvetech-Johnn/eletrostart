# 🚀 Guia de Configuração Express - Eletrostart

O sistema backend foi configurado para usar **MongoDB Atlas**.

## 1. Instalação e Configuração Automática

Execute apenas UM comando no seu terminal raiz:

```bash
npm run server:setup
```

*Nota: Se ocorrerem erros de conexão, verifique se seu IP está liberado no MongoDB Atlas.*

## 2. Iniciar o Sistema (Modo Desenvolvimento)

Você precisará de **dois terminais** abertos:

**Terminal 1 (Frontend - Visual):**
```bash
npm run dev
```
(Acessar em http://localhost:5174)

**Terminal 2 (Backend - API):**
```bash
npm run server:dev
```

## 3. Acessar

- Painel Admin: http://localhost:5173/admin/login
- Login: `admin@eletrostart.com.br`
- Senha: `Admin@123`

---
*Nota: A conexão com MongoDB requer string válida no arquivo `server/.env`.*
