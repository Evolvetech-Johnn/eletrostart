# Guia do Painel Administrativo — Eletrostart

## Acesso e Perfis de Usuário

| Role | O que pode fazer |
|---|---|
| `SUPER_ADMIN` | Acesso total, incluindo Módulo Executivo e gestão de usuários |
| `ADMIN` | Produtos, Pedidos, Mensagens, Categorias, Estoque, Analytics |
| `VIEWER` | Somente leitura |

---

## 1. Produtos

### 1.1 Edição Rápida (Inline)
Na tabela de produtos, você pode editar **Preço** e **Estoque** diretamente:
1. Clique no campo numérico desejado.
2. Digite o novo valor.
3. Pressione **Enter** ou clique fora do campo.
4. O sistema salva automaticamente e exibe uma notificação.

### 1.2 Ações em Massa (Bulk Actions)
1. Marque os produtos com as caixas de seleção.
2. Uma barra de ações aparece no topo da listagem.
3. Opções disponíveis:
   - **Reajuste de Preço (%)** — ex: +10% ou -5% sobre o preço atual
   - **Ativar / Desativar em Massa**
   - **Excluir Selecionados** (produtos com pedidos são desativados, não deletados)

### 1.3 Exportar Catálogo
1. Clique em **"Exportar"** no topo da tela.
2. Um arquivo `.xlsx` é baixado com todos os produtos ativos.

### 1.4 Importar Produtos
1. Clique em **"Importar"**.
2. Selecione um arquivo `.xlsx` ou `.csv`.
3. Colunas suportadas: `SKU`, `Nome`, `Preço`, `Estoque`, `Ativo` (Sim/Não), `Imagem`, `Descrição`.
4. Comportamento:
   - **SKU existente** → Atualiza preço, estoque, status e descrição.
   - **SKU novo** → Cria o produto.

### 1.5 Sincronizar via Google Sheets
1. Clique em **"Sync"**.
2. Informe a URL pública da planilha (Google Sheets → *Arquivo > Publicar na Web > CSV*).
3. O sistema sincroniza dados de preço e estoque automaticamente.

### 1.6 Estoque Crítico
Um painel lateral na tela de Produtos exibe todos os produtos abaixo do limite configurável de estoque. O limite padrão é **5 unidades** e pode ser ajustado no campo "Limite" do painel.

---

## 2. Pedidos

- Visualize e atualize o status: `PENDING → PAID → SHIPPED → DELIVERED / CANCELED`
- Cada mudança de status fica registrada no histórico do pedido (com responsável e notas)
- Crie pedidos manuais em **Pedidos > Novo Pedido**

---

## 3. Mensagens de Contato

- Mensagens chegam com status `NOVO`
- É possível atribuir uma mensagem a um administrador, adicionar **tags**, escrever **notas internas** e alterar prioridade
- O histórico de quem visualizou é registrado automaticamente

---

## 4. Categorias

CRUD completo com nome, slug (URL amigável) e imagem de capa. O slug é usado nos filtros da loja pública.

---

## 5. Analytics (Dashboard Operacional)

Gráficos de desempenho com:
- Receita por período
- Número de pedidos
- Ticket médio
- Produtos mais vendidos

> Acessa via menu **Analytics** no painel.

---

## 6. Movimentações de Estoque

Histórico auditável de todas as entradas e saídas de estoque com:
- Data e hora
- Produto
- Tipo (entrada manual, saída por venda, ajuste)
- Motivo
- Responsável pelo ajuste

---

## 7. Logs de Auditoria

Todas as ações críticas são registradas:
- Quem realizou (usuário/email)
- O que foi feito (criação, atualização, exclusão, import, login)
- Quando (data/hora)
- Detalhes da mudança

---

## 8. Módulo Executivo (`SUPER_ADMIN`)

> Disponível apenas para usuários com role **SUPER_ADMIN**.  
> Acesse pelo menu lateral em **Executivo**.

### 8.1 Overview Executivo
Painel de KPIs em tempo real:
- Receita total acumulada
- Volume de pedidos
- Ticket médio de venda
- Margem bruta estimada

### 8.2 Análise Financeira
- Evolução temporal de receita e lucro
- Comparativo entre períodos (mês atual vs. anterior)
- Gráficos de linha e barra

### 8.3 Análise de Inventário
- Valor total do estoque em R$
- Produtos sem estoque ou estoque crítico
- Giro de produto (velocidade de saída)
- Distribuição de valor por categoria

### 8.4 Análise de Clientes
- Total de clientes únicos
- LTV médio (Lifetime Value)
- Frequência de recompra
- Perfil de compra (produtos mais pedidos por segmento)

### 8.5 Lucratividade
- Margem bruta por categoria
- Ranking de produtos mais rentáveis
- Produtos com margem negativa ou baixa (sinalizados em vermelho)

> **Nota Técnica:** Os dados do Módulo Executivo são gerados a partir de `AnalyticsSnapshot`, criados automaticamente por um **cron job** diário/mensal para garantir que consultas complexas não afetem a performance da loja.

---

## 9. Gestão de Usuários

> Apenas ADMIN e SUPER_ADMIN podem criar/editar usuários.

- Criar novo usuário com email, senha e role
- Desativar acesso sem deletar o histórico
- Roles disponíveis: `SUPER_ADMIN`, `ADMIN`, `VIEWER`

---

_Para documentação técnica completa, consulte `SYSTEM_DOCS.md`._
