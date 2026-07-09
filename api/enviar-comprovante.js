// Envio do Comprovante de Descarte de Resíduo por e-mail.
// Vercel e Supabase bloqueiam SMTP de saída, então o envio real é delegado
// a um workflow do n8n (webhook -> Email Send via SMTP KingHost).
// Requer env N8N_WEBHOOK_URL no Vercel.
const SUPA_URL = 'https://nbotdfkeiwqwgbesgkve.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ib3RkZmtlaXdxd2diZXNna3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NDYyMDksImV4cCI6MjA5NjEyMjIwOX0.GmobP5xGzZtxUPwNrZIhMaevJdLz5Db2zEL_o6YtSqg';
const H = { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json' };

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

const LOGO_URL = 'https://multilix-dashboard.vercel.app/assets/logo-25-anos.jpg';

function esc(s){ return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtVol(v){ return Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2}); }
function fmtMoeda(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

function htmlComprovante(vale, itens){
  const dataHora = new Date(vale.data_hora).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'});
  const row = (label,value)=>`<tr><td style="padding:7px 4px;border-bottom:1px dashed #c9ced8;color:#555;font-size:13px;width:38%">${label}:</td><td style="padding:7px 4px;border-bottom:1px dashed #c9ced8;font-size:13px;font-weight:600;color:#1a2f5e;text-align:right">${value}</td></tr>`;
  const linhas = [
    row('Data / Hora', esc(dataHora)),
    row('Cliente', esc(vale.parceiro_nome_snapshot)),
    vale.parceiro_doc_snapshot ? row('CPF/CNPJ', esc(vale.parceiro_doc_snapshot)) : '',
    vale.gerador_nome_snapshot ? row('Gerador', esc(vale.gerador_nome_snapshot)) : '',
    vale.placa ? row('Placa', esc(vale.placa)) : '',
    vale.motorista ? row('Motorista', esc(vale.motorista)) : '',
    row('Descargas', String(itens.length)),
    row('Volume Total', `${fmtVol(vale.volume_total_m3)} m³`),
    vale.preco_total != null ? row('Valor Total', fmtMoeda(vale.preco_total)) : '',
  ].join('');
  const td = 'padding:6px 5px;border:1px solid #d8dce4;font-size:12px';
  const th = 'padding:6px 5px;border:1px solid #d8dce4;background:#eef1f6;font-size:11px;color:#1a2f5e';
  const itensRows = itens.map((it,i)=>`<tr>
    <td style="${td};text-align:center">${i+1}</td>
    <td style="${td}">${esc(it.ctr_mtr||'—')}</td>
    <td style="${td};text-align:center">${esc(it.numero_cacamba||'—')}</td>
    <td style="${td}">${esc(it.equipamento_nome_snapshot||'—')}</td>
    <td style="${td};text-align:center">${fmtVol(it.volume_m3)}</td>
    <td style="${td}">${esc(it.residuo_nome_snapshot||'—')}</td>
  </tr>`).join('');
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f2f4f7;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:0 auto;padding:24px 12px">
  <div style="background:#fff;border:1px solid #dde1e8;border-radius:8px;padding:28px 26px">
    <div style="text-align:center">
      <img src="${LOGO_URL}" alt="Multilix 25 anos" style="max-width:170px;height:auto"/>
      <h1 style="font-size:17px;color:#1a2f5e;margin:16px 0 2px;letter-spacing:.3px">COMPROVANTE DE DESCARTE DE RESÍDUO ${esc(vale.numero_vale)}</h1>
      <p style="font-size:12px;color:#777;margin:0 0 4px">Multilix — Gestão de Resíduos da Construção Civil</p>
      <p style="font-size:11px;color:#999;margin:0">ATT — Área de Transbordo e Triagem · Rod. Fernão Dias km 88,7 — Guarulhos/SP · (11) 2241-0006</p>
    </div>
    <div style="border-top:2px solid #1a2f5e;margin:18px 0 6px"></div>
    <table style="width:100%;border-collapse:collapse">${linhas}</table>
    <h2 style="font-size:13px;color:#1a2f5e;margin:20px 0 8px;text-transform:uppercase">Descargas Recebidas</h2>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th style="${th}">#</th><th style="${th}">CTR/MTR</th><th style="${th}">Caçamba</th><th style="${th}">Equipamento</th><th style="${th}">Vol. m³</th><th style="${th}">Resíduo</th></tr></thead>
      <tbody>${itensRows}</tbody>
    </table>
    ${vale.observacoes_gerais ? `<p style="font-size:12px;color:#555;background:#fffbea;border:1px solid #f0e0a0;border-radius:6px;padding:10px;margin:16px 0 0"><strong>Observações:</strong> ${esc(vale.observacoes_gerais)}</p>` : ''}
    <div style="border-top:1px dashed #c9ced8;margin:24px 0 0;padding-top:14px;text-align:center">
      <p style="font-size:11px;color:#999;margin:0">Este é um comprovante eletrônico de descarte de resíduo emitido pela Multilix.</p>
      <p style="font-size:11px;color:#999;margin:4px 0 0">Dúvidas: comercial@multilix.com.br · (11) 2241-0006</p>
    </div>
  </div>
  <p style="text-align:center;font-size:10px;color:#aab;margin:14px 0 0">Sistema de Gestão de Resíduos — Multilix</p>
</div>
</body></html>`;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const { vale_id, force } = req.body || {};
  if (!vale_id) return res.status(400).json({ error: 'vale_id_obrigatorio' });
  if (!N8N_WEBHOOK_URL) return res.status(500).json({ status: 'erro', detail: 'N8N_WEBHOOK_URL nao configurado no Vercel' });

  const rVale = await fetch(`${SUPA_URL}/rest/v1/vales_descarga?id=eq.${encodeURIComponent(vale_id)}&select=*,vale_descarga_itens(*),parceiros_att(email,enviar_comprovante_email,nome_fantasia)`, { headers: H });
  if (!rVale.ok) return res.status(500).json({ error: 'erro_busca_vale', detail: await rVale.text() });
  const [vale] = await rVale.json();
  if (!vale) return res.status(404).json({ error: 'vale_nao_encontrado' });

  const parceiro = vale.parceiros_att;
  const email = (parceiro && parceiro.email || '').trim();
  if (!email) return res.status(200).json({ status: 'sem_email' });
  if (!(parceiro && parceiro.enviar_comprovante_email) && !force) return res.status(200).json({ status: 'optout' });
  if (vale.email_enviado_em && !force) return res.status(200).json({ status: 'ja_enviado', em: vale.email_enviado_em });

  const itens = (vale.vale_descarga_itens || []).sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));

  const logPatch = async (fields) => {
    await fetch(`${SUPA_URL}/rest/v1/vales_descarga?id=eq.${encodeURIComponent(vale_id)}`, {
      method: 'PATCH', headers: H, body: JSON.stringify(fields),
    }).catch(()=>{});
  };

  try {
    const rSend = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Comprovante de Descarte de Resíduo ${vale.numero_vale} — Multilix`,
        text: `Comprovante de Descarte de Resíduo ${vale.numero_vale} — Multilix. Cliente: ${vale.parceiro_nome_snapshot}. Volume total: ${vale.volume_total_m3} m³.`,
        html: htmlComprovante(vale, itens),
      }),
    });
    const rBody = await rSend.json().catch(() => ({}));
    if (!rSend.ok || rBody.status !== 'enviado') {
      throw new Error(rBody.detail || `falha no envio (HTTP ${rSend.status})`);
    }
    await logPatch({ email_enviado_em: new Date().toISOString(), email_destinatario: email, email_erro: null });
    return res.status(200).json({ status: 'enviado', para: email });
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    await logPatch({ email_erro: msg });
    return res.status(500).json({ status: 'erro', detail: msg });
  }
};
