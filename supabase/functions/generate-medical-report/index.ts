import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tipos (replicados para o ambiente de Edge Function)
type Exam = {
  name: string;
  value: number | string;
  unit?: string;
  reference?: { low?: number; high?: number; note?: string };
  date?: string; // ISO
};

type VisitData = {
  logoUrl: string;
  patient: { name: string; sex: "Feminino" | "Masculino" | "Outro"; birth: string; age: number };
  visit: { date: string };
  vitals?: { weightKg?: number; heightCm?: number; bmi?: number; sbp?: number; dbp?: number; hr?: number; tempC?: number; spo2?: number };
  examsCurrent: Exam[];
  examsPrevious?: Exam[];
};

type ReportJSON = {
  model_used: string;
  model_fallback_notice?: string;
  summary_bullets: string[];
  risk_flags: { level: "alto" | "moderado" | "baixo"; notes: string[] };
  sections: Array<{
    title: string;
    table: Array<{ exam: string; value: string; reference?: string; status?: "bom" | "normal" | "atenção" | "alto"; meaning?: string }>;
    explain_simple: string;
    vital_suggests: string[];
    talk_to_doctor?: string[];
  }>;
  plan_next7days: string[];
  glossary: Array<{ term: string; plain: string }>;
  disclaimer: string;
  html: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const pickModel = () => ({
  primary: Deno.env.get("OPENAI_MODEL_PRIMARY") || "gpt-4o",
  fallback: Deno.env.get("OPENAI_MODEL_FALLBACK") || "gpt-4o-mini",
  legacy: Deno.env.get("OPENAI_MODEL_LEGACY") || "gpt-4o",
});

const SYSTEM_PT = `
Você é o Dr. Vital (IA) do Instituto dos Sonhos. Fale em português do Brasil,
linguagem simples e respeitosa, SEM diagnóstico ou prescrição.
Explique cada bloco de exames para leigos. Mantenha estrutura sênior:
após cada tabela, inclua "O que isso significa?", "Dr. Vital sugere (em casa)" e
"Converse com o médico se...". Nunca invente dados; assuma "—" se faltarem.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Use POST", { status: 405, headers: corsHeaders });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const visitData: VisitData = body?.visitData as VisitData;
    const userId: string | undefined = body?.userId;
    const documentId: string | undefined = body?.documentId;
    if (!visitData || !visitData.logoUrl) {
      return new Response(JSON.stringify({ error: "visitData.logoUrl é obrigatório" }), { status: 400, headers: corsHeaders });
    }

    const { primary, fallback, legacy } = pickModel();

    const userTask = buildTask(visitData);

    async function call(model: string) {
      const payload: any = {
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PT },
          { role: "user", content: userTask },
        ],
      };
      if (/(o4|4\.1)/i.test(model)) payload.max_completion_tokens = 4000; else payload.max_tokens = 4000;
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error?.message || "OpenAI error");
      return json;
    }

    let used = primary;
    let notice = "";
    let res: any;
    try { res = await call(primary); }
    catch { try { used = fallback; res = await call(fallback); notice = `Fallback primário→${fallback}`; }
           catch { used = legacy;  res = await call(legacy);  notice = `Fallback primário/seg→${legacy}`; } }

    const content = res.choices?.[0]?.message?.content || "{}";
    let report = {} as ReportJSON;
    try { report = JSON.parse(content); } catch { report = {} as ReportJSON; }
    report.model_used = used;
    if (notice) report.model_fallback_notice = notice;

    if (!report.html) report.html = renderHTML(visitData, report);
    if (!report.disclaimer) report.disclaimer = "Este documento é educativo e não substitui consulta médica. Não faz diagnóstico nem prescrição.";

    // Salvar HTML no Storage
    const path = `${userId || "public"}/${documentId || `report_${Date.now()}`}.html`;
    const enc = new TextEncoder();
    const bytes = enc.encode(report.html);
    await supabase.storage.from("medical-documents-reports").remove([path]).catch(() => {});
    const up = await supabase.storage.from("medical-documents-reports").upload(path, new Blob([bytes], { type: "text/html; charset=utf-8" }), { upsert: true, contentType: "text/html; charset=utf-8" });
    if (up.error) throw up.error;

    // Atualiza medical_documents se enviado um documentId
    if (documentId) {
      await supabase
        .from("medical_documents")
        .update({ analysis_status: "ready", report_path: path })
        .eq("id", documentId)
        .eq("user_id", userId || "");
    }

    // URL assinada
    const signed = await supabase.storage.from("medical-documents-reports").createSignedUrl(path, 3600);

    return new Response(JSON.stringify({ report, report_path: path, signed_url: signed.data?.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-medical-report error", e);
    return new Response(JSON.stringify({ error: e?.message || "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildTask(input: VisitData) {
  return `
Gere um ReportJSON completo (conforme schema) + HTML final elegante, imprimível.
Use as cores: roxo #5A3DF0 (brand), laranja #FF7A18 (accent), texto #1E2233, borda #E7EAF3.
Fonte >=16px, contraste alto, layout aberto (sem accordions).

DADOS:
${JSON.stringify(input, null, 2)}

INSTRUÇÕES DE CONTEÚDO:
- "Resumo em 1 minuto" com 4–6 bullets.
- Seções esperadas (crie apenas as aplicáveis): 
  1) Coração/Colesterol (LDL/HDL),
  2) Açúcar no sangue (Glicose, HbA1c, Insulina, HOMA‑IR),
  3) Rins (Ureia/Creatinina),
  4) Fígado (ALT/TGP, AST/TGO),
  5) Tireoide (ex.: TSH, T4L),
  6) Vitaminas e Estoques de Ferro (B12, Ferritina, Ferro sérico),
  7) Eletrólitos (Sódio, Potássio, Cálcio, Magnésio),
  8) Fezes (Parasitológico, Sangue Oculto).
- Em cada seção, gere: tabela (Exame|Resultado|Referência|Status|Significado curto)
  + blocos: "O que isso significa?", "Dr. Vital sugere (em casa)", "Converse com o médico se..."
- Se houver exames anteriores, exiba DELTAS (antes→agora, Δ) dentro da tabela.
- Acrescente "Plano simples — próximos 7 dias" e "Glossário".
- Feche com um disclaimer claro (documento educativo, sem substituir consulta).

INSTRUÇÕES DO HTML:
- Cabeçalho com logo ${input.logoUrl} e KPIs (nome, idade, sexo, datas, HbA1c, HOMA‑IR).
- Cada seção em <section> com título grande e ícone (emoji).
- Tabelas com linhas alternadas claras, colunas: Exame | Resultado | Referência | Status | Interpretação.
- Em seguida os 3 blocos explicativos em caixas suaves.
- Botão fixo no topo direito: "Imprimir / Salvar PDF" (onclick="window.print()").
- CSS com @media print (ocultar botão, remover sombras, cores sólidas).
- Não use frameworks, apenas CSS inline no <style>.

RETORNE APENAS ReportJSON válido no message.content.
`;
}

function renderHTML(input: VisitData, r: ReportJSON) {
  const now = new Date().toLocaleString("pt-BR");
  const kpi = `
  <div class="kpis">
    <div class="kpi"><div class="l">Paciente</div><div class="v">${input.patient.name.split(" ")[0]} (${input.patient.age} anos)</div><div class="s">${input.patient.sex}</div></div>
    <div class="kpi"><div class="l">Nascimento</div><div class="v">${input.patient.birth}</div><div class="s">Coleta: ${input.visit.date}</div></div>
    <div class="kpi"><div class="l">Açúcar do sangue</div><div class="v">${peek(r,"Açúcar no sangue","Glicose")}</div><div class="s">HbA1c ${peek(r,"Açúcar no sangue","HbA1c")}</div></div>
    <div class="kpi"><div class="l">HOMA‑IR</div><div class="v">${peek(r,"Açúcar no sangue","HOMA‑IR")}</div><div class="s">Estimativa</div></div>
  </div>`.trim();

  const sections = (r.sections || []).map(sec => sectionHTML(sec)).join("\n");

  return `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relatório Clínico — Instituto dos Sonhos</title>
<style>
:root{ --brand:#5A3DF0; --accent:#FF7A18; --ink:#1E2233; --muted:#5E6A81; --bg:#F6F7FC; --card:#FFFFFF; --line:#E7EAF3; --ok:#167C3B; --warn:#B26A00; --bad:#B11C1C;}
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;font-size:16px;line-height:1.65}
.page{max-width:980px;margin:0 auto;padding:20px}
.header{display:flex;gap:14px;align-items:center;background:linear-gradient(135deg,rgba(90,61,240,.08),rgba(255,122,24,.07));border:1px solid var(--line);border-radius:18px;padding:12px 14px}
.header img{height:56px}
h1{margin:0;font-size:28px}
.sub{color:var(--muted)}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.kpi .l{font-size:14px;color:var(--muted)} .kpi .v{font-size:20px;font-weight:800} .kpi .s{font-size:13px;color:var(--muted)}
.btn-print{position:sticky;top:10px;float:right;background:var(--brand);color:#fff;border:none;border-radius:10px;padding:10px 14px;cursor:pointer}
section.block{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:14px}
.stitle{margin:0 0 8px 0;font-size:22px}
table{width:100%;border-collapse:collapse} th,td{padding:10px;border-bottom:1px dashed var(--line);text-align:left}
th{color:var(--muted)} .green{color:var(--ok)} .amber{color:var(--warn)} .red{color:var(--bad)}
.explain{border:1px solid var(--line);background:#FCFEFF;border-radius:12px;padding:12px;margin-top:10px}
.explain h4{margin:0 0 6px 0}
@media print{ .btn-print{display:none} body{background:#fff} .page{padding:0} .header{box-shadow:none} }
</style>
</head>
<body>
<div class="page">
  <button class="btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  <div class="header">
    <img src="${input.logoUrl}" alt="Instituto dos Sonhos">
    <div><h1>Relatório Clínico — linguagem simples</h1><div class="sub">Gerado por Sof.ia & Dr. Vital • ${now}</div></div>
  </div>
  ${kpi}
  <section class="block"><h2 class="stitle">Resumo em 1 minuto</h2><ul>${(r.summary_bullets||[]).map(li=>`<li>${li}</li>`).join("")}</ul></section>
  ${sections}
  <section class="block"><h2 class="stitle">Plano simples — próximos 7 dias</h2><ul>${(r.plan_next7days||[]).map(li=>`<li>${li}</li>`).join("")}</ul></section>
  <section class="block"><h2 class="stitle">Glossário</h2><ul>${(r.glossary||[]).map(g=>`<li><strong>${g.term}:</strong> ${g.plain}</li>`).join("")}</ul></section>
  <p class="sub">${r.disclaimer || "Este documento é educativo e não substitui consulta médica."}</p>
</div>
</body></html>`;
}

function sectionHTML(sec: ReportJSON["sections"][number]) {
  const rows = (sec.table || []).map(t => `
  <tr>
    <td><strong>${t.exam}</strong></td>
    <td><strong>${t.value}</strong></td>
    <td>${t.reference || "—"}</td>
    <td>${statusChip(t.status)}</td>
    <td>${t.meaning || ""}</td>
  </tr>`).join("");

  return `
<section class="block">
  <h2 class="stitle">${sec.title}</h2>
  <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px">
    <div>
      <table>
        <thead><tr><th>Exame</th><th>Resultado</th><th>Referência</th><th>Status</th><th>Interpretação</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div>
      <div class="explain"><h4>O que isso significa?</h4><p>${sec.explain_simple}</p></div>
      <div class="explain"><h4>Dr. Vital sugere (em casa)</h4><ul>${(sec.vital_suggests||[]).map(x=>`<li>${x}</li>`).join("")}</ul></div>
      ${sec.talk_to_doctor?.length ? `<div class="explain"><h4>Converse com o médico se…</h4><ul>${sec.talk_to_doctor.map(x=>`<li>${x}</li>`).join("")}</ul></div>` : ""}
    </div>
  </div>
</section>`;
}

function statusChip(s?: string) {
  if (!s) return "—";
  const map: Record<string,string> = { bom: "🟢 Bom", normal: "🟢 Normal", "atenção": "🟡 Atenção", alto: "🔴 Alto" };
  return map[s] || s;
}

function peek(r: ReportJSON, secTitle: string, exam: string) {
  const s = (r.sections || []).find(s => s.title.toLowerCase().includes(secTitle.toLowerCase()));
  const t = s?.table.find(t => t.exam.toLowerCase().includes(exam.toLowerCase()));
  return t?.value ?? "—";
}


