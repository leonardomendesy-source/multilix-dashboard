# Multilix Dashboard

## Visão Geral
Dashboard de vendas da Multilix. Arquivo principal: `index.html` (alias de `dashboard_multilix_v25.html`).

## Estrutura
- `index.html` — cópia idêntica ao dashboard_multilix_v25.html (para GitHub Pages)
- `dashboard_multilix_v25.html` — versão atual (v25)

## Módulos implementados
- ATT (Atendimento)
- Locação
- Agregados
- E-mails Comercial (lê da tabela `emails_comercial` no Supabase, alimentada pelo workflow n8n `gZgBvKDtCjHjBYJf`)

## Git
- Branch principal: `main`
- Remote: GitHub
- Convenção de commits: `"v{numero} - {descrição dos módulos}"`

## Propostas — estado atual
Os 3 módulos usam o **layout/subsistema "v2" do commit v25 `1449d98`** (transplantado para o dashboard v26):
- **Locação**: modal Residencial/Completa + Cadastros Padrão. Funções `showPropModal`, `gerarProposta`, `gerarPDFLocacao`. Histórico em `localStorage` `mlx_prop_loc_v2` (compartilhado, filtra por `tipo`).
- **Agregados**: `showPropAgregado` / `gerarPDFAgregado`. Histórico no mesmo `mlx_prop_loc_v2`, `tipo:'agregado'`.
- **ATT**: `showPropATT` / `gerarPropATTPDF` / `showATTConfig`. Histórico em `mlx_att_hist`; cadastros em `mlx_att_cad`.
- **Cadastros**: `showPropCadastro` (`mlx_prop_cad`) — pgto, prazo, responsáveis, itens padrão.
- **PDFs** usam papel-timbrado real via `const MARCA_DAGUA_B64` (imagem A4) + `_pdfBackground()`. `MARCA_DAGUA_B64` e `MULTILIX_LOGO_B64` são consts globais (escopo compartilhado entre os `<script>` clássicos).

## Histórico relevante
- v25 (`1449d98`): subsistema de propostas v2 (ATT, Locação, Agregados) completo, com modais e PDFs timbrados.
- v26 (redesign `83d578b`): regressão — quebrou a tag `<script src=xlsx>` (engoliu o JS de propostas), simplificou Locação e reverteu ATT/Agregados para placeholder "em construção".
- Correção (atual): transplantado o bloco de propostas v2 do v25 (`<style>`+`<script>` + páginas + modais) para o v26, e injetado `MARCA_DAGUA_B64` no bloco (estava em outro `<script>` não trazido). Removido modal `prop-modal-overlay` duplicado/legado. Resultado: os 3 módulos com o layout original e PDFs timbrados.
