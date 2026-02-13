# Guia do Painel Administrativo - Eletrostart

Este guia descreve as novas funcionalidades implementadas no Painel Administrativo para gestão avançada de produtos e preços.

## 1. Gestão de Produtos

### 1.1 Edição Rápida (Inline Editing)
Na tabela de produtos, você pode editar **Preço** e **Estoque** diretamente, sem abrir a página de edição do produto.
- Clique no valor que deseja alterar.
- Digite o novo valor.
- Clique fora ou pressione Enter.
- O sistema salvará automaticamente (uma notificação de sucesso aparecerá).

### 1.2 Ações em Massa (Bulk Actions)
Para aplicar ações a vários produtos de uma vez:
1. Selecione os produtos usando as caixas de seleção na primeira coluna.
2. Uma barra de ações aparecerá na parte inferior da tela.
3. Escolha uma ação:
   - **Excluir Selecionados**: Remove permanentemente (ou desativa se tiverem pedidos) os produtos selecionados.
   - **Atualizar Preço**: Aumente ou diminua o preço de todos os selecionados por uma porcentagem (ex: +10% ou -5%).

## 2. Importação e Exportação

### 2.1 Exportar Base
Para fazer um backup ou editar no Excel:
1. Clique no botão **"Exportar Base"** no topo da tela.
2. O sistema baixará um arquivo `produtos-eletrostart.xlsx` com todos os produtos.

### 2.2 Importar Produtos
Para adicionar novos produtos ou atualizar existentes em massa:
1. Clique no botão **"Importar CSV/Excel"**.
2. Baixe o modelo se necessário (use o arquivo exportado como base).
3. Selecione seu arquivo `.xlsx` ou `.csv`.
4. O sistema processará o arquivo:
   - **SKU existente**: Atualiza preço, estoque, status, etc.
   - **Novo SKU**: Cria um novo produto.

**Colunas Obrigatórias**: `SKU` (ou `Código`).
**Outras Colunas**: `Nome`, `Preço`, `Estoque`, `Ativo` (Sim/Não), `Imagem` (Link), `Categoria` (Nome), `Descrição`.

## 3. Sincronização Google Sheets

Para sincronizar preços automaticamente de uma planilha pública do Google:
1. Clique em **"Sincronizar Planilha"**.
2. Insira a URL pública da sua planilha do Google Sheets.
   - A planilha deve seguir o layout padrão (colunas SKU, Preço, etc.).
   - Para publicar: No Google Sheets, vá em *Arquivo > Compartilhar > Publicar na Web* e escolha formato *CSV*.
3. Clique em Confirmar.

## 4. Auditoria (Audit Logs)

Todas as ações críticas são registradas para segurança:
- Quem alterou (Usuário/Email).
- O que foi alterado (Criação, Edição, Exclusão, Importação).
- Quando ocorreu.
- Detalhes (Valores antigos e novos).

*Os logs podem ser consultados pela equipe técnica no banco de dados para rastreabilidade.*
