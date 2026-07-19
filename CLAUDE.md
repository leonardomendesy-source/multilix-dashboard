# Multilix Dashboard

## Visão Geral
Dashboard de gestão da Multilix (deploy Vercel a partir do main). Arquivo principal e único do app: `index.html`.

## Estrutura
- `index.html` — dashboard completo (login Supabase Auth; todos os módulos)
- `entrada-terceiros.html` — webapp do apontador ATT: lançar vale/O.S. (`vales_descarga` + itens), histórico, edição, comprovante
- `vale.html` — webapp do apontador de Destinação (frete) e Recicláveis
- `api/enviar-comprovante.js` — função Vercel: envia comprovante por e-mail via webhook n8n (env `N8N_WEBHOOK_URL`)
- `dashboard_multilix_v25.html` foi REMOVIDO no v56 (snapshot legado parado no v28; recuperável no histórico git)

## Módulos implementados
- ATT (Atendimento)
- Locação
- Agregados
- E-mails Comercial (lê da tabela `emails_comercial` no Supabase, alimentada pelo workflow n8n `gZgBvKDtCjHjBYJf`)
- Destinação (frete MIX/Rachão): webapp `/vale` (apontador), Conferência, Freteiros, Pagamentos
- **Recicláveis (v37-v40)**: venda de resíduos triados (madeira, papel, plásticos, gesso, metal) para destinos/compradores.
  - Tabelas Supabase: `tipos_residuo_reciclavel`, `destinos_reciclaveis`, `destinos_reciclaveis_precos` (unidade kg/ton/carga/m3), `vales_reciclaveis` (OS `REC-####` via trigger `trg_os_numero_rec` + sequence `vales_rec_os_seq`; `valor_final` = generated coalesce(valor_recebido, valor_calculado))
  - `/vale`: tela de seleção Frete × Recicláveis; fluxo rec = destino → resíduo precificado → m³ + 2 fotos (bucket `destinacao-fotos/reciclaveis/`); funções JS prefixo `rec`/`onRec`
  - index.html: páginas `page-reciclaveis` (dashboard c/ projeção por dias úteis via `calcularProjecaoSegmentada`), `page-rec-destinos` (cadastros), `page-rec-conferencia` (baixa por peso do ticket, `recCalcValor`, valor manual prevalece). JS no bloco 2, antes de `// ── SIDEBAR TOGGLE ──`
  - RLS: vales com INSERT/UPDATE anon (apontador sem login); cadastros só authenticated. Obs: em `vales_destinacao` (frete) o UPDATE é só authenticated — editar/cancelar no /vale falha silenciosamente (bug latente antigo, não corrigido de propósito)

## Controle de acesso por módulo (v82)
- `profiles.permissoes` (jsonb): `null` = acesso total; array de ids de páginas = só essas. Admin sempre ignora restrições; página Usuários é sempre só admin.
- Edge function `manage-users`: ação `updatePermissions` ({id, permissoes}); `list` devolve `permissoes`.
- index.html: `PERM_MODULES` (registro módulo→páginas), `podeAcessar(id)`, `applyPermissions()` (esconde nav-items/grupos/seções sem permissão; extrai o id da página do `onclick` para `data-page`), guarda no `showPage`, `_navFirstAllowed()` redireciona pós-login se a página ativa for bloqueada. "Lançar Vale" tem `data-page="lancar-vale"` manual (abre /entrada-terceiros).
- UI admin: página Usuários → coluna Acesso + botão Permissões → modal `perm-modal-overlay` (checkbox "Acesso total" ou árvore por grupo). Mudanças valem no próximo login/reload do usuário.
- Enforcement é só de UI/navegação (dados continuam acessíveis via REST com anon key p/ quem souber a API).

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
