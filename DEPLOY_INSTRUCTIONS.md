# Guia de Deploy - Eletrostart

Atualmente, seu projeto está dividido em duas partes:
1. **Frontend (Site/Visual)**: Pasta `src` (React/Vite).
2. **Backend (API/Servidor)**: Pasta `server` (Node.js/Express/Prisma).

O erro que você está vendo (`net::ERR_FAILED` tentando acessar `localhost:3001`) acontece porque:
- Você hospedou o **Frontend** (provavelmente no Netlify ou Vercel).
- Mas o **Backend** ainda está rodando apenas no seu computador (`localhost`).
- O site "online" não consegue acessar o seu computador pessoal.

Para resolver, você precisa hospedar o Backend na internet e conectar os dois.

---

## Passo 1: Hospedar o Backend (Gratuito no Render.com)

O Netlify **não** roda servidores Node.js persistentes (como o seu backend). Recomendamos o **Render**.

1. Crie uma conta no [Render.com](https://render.com).
2. Clique em **"New +"** e selecione **"Web Service"**.
3. Conecte seu repositório do GitHub.
4. Configure o serviço:
   - **Name**: `eletrostart-api` (exemplo)
   - **Root Directory**: `server` (MUITO IMPORTANTE: isso diz pro Render olhar a pasta do servidor)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run seed` (Instala dependências e prepara o banco)
   - **Start Command**: `node src/index.js`
5. Adicione as **Environment Variables** (Variáveis de Ambiente):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (Invente uma senha segura)
   - `DISCORD_BOT_TOKEN`: (Seu token do bot)
   - `DISCORD_CLIENT_ID`: (ID do cliente)
   - `DISCORD_CHANNEL_ID`: (ID do canal)
   - `DATABASE_URL`: (Para SQLite no Render, você precisará de um disco persistente OU usar um banco externo como Postgres. *Para teste rápido, o SQLite funciona mas reseta a cada deploy*).

6. Clique em **Create Web Service**.
7. Aguarde o deploy. O Render vai te dar uma URL (ex: `https://eletrostart-api.onrender.com`). Copie essa URL.

---

## Passo 2: Configurar o Frontend (Netlify)

Agora que o backend existe na internet, precisamos avisar o site onde ele está.

1. Vá no painel do **Netlify** onde seu site está hospedado.
2. Vá em **Site configuration** > **Environment variables**.
3. Adicione uma nova variável:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://eletrostart-api.onrender.com/api` (Cole a URL do passo 1 e adicione `/api` no final).
4. Vá na aba **Deploys** e clique em **Trigger deploy** (ou faça um novo push no git) para reconstruir o site com a nova configuração.

---

## Resumo da Arquitetura

| Ambiente | Frontend (Onde está o usuário) | Backend (Onde estão os dados) | Status |
|----------|--------------------------------|-------------------------------|--------|
| **Local**| `localhost:5173`               | `localhost:3001`              | ✅ Funciona |
| **Online**| `seusite.netlify.app`         | `localhost:3001`              | ❌ ERRO (O erro atual) |
| **Correto**| `seusite.netlify.app`        | `eletrostart-api.onrender.com`| ✅ Funcionará |
