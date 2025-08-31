import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase envs");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Minimal reference ranges (expand as needed)
const REF_BR: Record<string, { unit: string; min?: number; max?: number }> = {
  glicose: { unit: "mg/dL", min: 70, max: 99 },
  hba1c: { unit: "%", min: 4.0, max: 5.6 },
  insulina: { unit: "µU/mL", min: 2, max: 25 },
  ldl: { unit: "mg/dL", max: 130 },
  hdl: { unit: "mg/dL", min: 40 },
  triglicerideos: { unit: "mg/dL", max: 150 },
  creatinina: { unit: "mg/dL", min: 0.6, max: 1.3 },
  ureia: { unit: "mg/dL", min: 15, max: 45 },
  alt: { unit: "U/L", max: 41 },
  ast: { unit: "U/L", max: 40 },
};

const UNITS_MAP: Record<string, { canonical: string; factor: number }> = {
  // to canonical mg/dL for glucose
  "mmol/L:glicose": { canonical: "mg/dL", factor: 18.0 },
  "mg/dL:glicose": { canonical: "mg/dL", factor: 1.0 },
};

function normalizeName(name: string) {
  const t = name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}+/gu, "");
  const m: Record<string, string> = {
    glicose: "glicose",
    glucose: "glicose",
    "glucose fasting": "glicose",
    hba1c: "hba1c",
    "hemoglobina glicada": "hba1c",
    insulina: "insulina",
    insulin: "insulina",
    ldl: "ldl",
    "ldl-c": "ldl",
    hdl: "hdl",
    triglicerideos: "triglicerideos",
    triglycerides: "triglicerideos",
    creatinina: "creatinina",
    creatinine: "creatinina",
    ureia: "ureia",
    urea: "ureia",
    alt: "alt",
    tgp: "alt",
    ast: "ast",
    tgo: "ast",
  };
  const k = Object.keys(m).find((k) => t.includes(k));
  return k ? m[k] : t;
}

function toCanonical(name: string, value: number, unit?: string) {
  const key = `${unit}:${name}`;
  const map = UNITS_MAP[key];
  if (!unit || !map) return { value, unit };
  return { value: value * map.factor, unit: map.canonical };
}

function derivedMetrics(items: any[]) {
  const get = (n: string) => items.find((x) => x.name === n && x.value != null);
  const out: Record<string, any> = {};
  const g = get("glicose");
  const ins = get("insulina");
  if (g && ins) {
    const glu = g.unit === "mmol/L" ? g.value * 18 : g.value;
    out.homa_ir = +(ins.value * glu / 405).toFixed(2);
  }
  const alt = get("alt");
  const ast = get("ast");
  if (alt && ast && alt.value) out.ast_alt_ratio = +(ast.value / alt.value).toFixed(2);
  const ldl = get("ldl");
  const hdl = get("hdl");
  const tg = get("triglicerideos");
  if (ldl && hdl && tg) out.non_hdl = +(ldl.value + tg.value/5 - hdl.value).toFixed(2);
  return out;
}

function statusFor(name: string, value?: number) {
  const ref = REF_BR[name];
  if (!ref || value == null) return { status: "info" };
  if (ref.min != null && value < ref.min) return { status: "altered" };
  if (ref.max != null && value > ref.max) return { status: "altered" };
  return { status: "normal" };
}

async function signUrl(bucket: string, path: string, expires = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expires);
  if (error) throw error;
  return data.signedUrl as string;
}

async function callOpenAIExtraction(images: string[]) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const body = {
    model: "gpt-4.1-2025-04-14",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "Você extrai exames de laboratório para JSON estrito. Nunca invente dados; se incerto, deixe null e marque flag_raw=uncertain.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extraia JSON com: patient, exam_meta, biomarkers[{name, alias_raw, value, unit, ref_interval_raw, confidence}]" },
          ...images.map((u) => ({ type: "input_image", image_url: u })),
        ],
      },
    ],
    response_format: { type: "json_object" },
  } as any;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

function buildHTML(payload: { patient: any; sections: any[]; date: string }) {
  const title = "Relatório Médico Integrativo";
  const rows = (sec: any) => sec.items.map((it: any) => `
    <tr>
      <td>${it.label}</td><td>${it.value ?? "—"}</td><td>${it.unit ?? ""}</td>
      <td>${it.br_ref ?? "—"}</td><td>${it.us_ref ?? "—"}</td>
      <td class="${it.status}">${it.status}</td>
    </tr>`).join("");
  const sections = payload.sections.map((s) => `
    <section><h2>${s.icon} ${s.title}</h2>
      <table><thead><tr><th>Resultado</th><th>Valor</th><th>Unidade</th><th>BR Ref</th><th>US Ref</th><th>Status</th></tr></thead>
      <tbody>${rows(s)}</tbody></table>
      <article><h3>O que isso significa</h3><p>${s.meaning}</p></article>
      <article><h3>Dr. Vital sugere</h3><p>${s.suggest}</p></article>
    </section>`).join("");
  return `<!doctype html><html lang="pt-BR"><head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body{font-family:Inter,system-ui; color:#1E2233; background:#F6F7FC;}
      .page{max-width:980px;margin:0 auto;padding:20px}
      header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
      h1{margin:0;font-size:24px}
      section{background:#fff;border:1px solid #E7EAF3;border-radius:12px;padding:16px;margin:16px 0}
      h2{margin:0 0 8px 0}
      table{width:100%;border-collapse:collapse}
      th,td{border-bottom:1px solid #E7EAF3;padding:8px;text-align:left}
      td.normal{color:#167C3B} td.altered{color:#B26A00} td.critical{color:#B11C1C}
      @media print{section{box-shadow:none;border-color:#ccc}}
    </style>
  </head><body><div class="page">
    <header><div>
      <h1>Relatório Médico Integrativo</h1>
      <div>${payload.patient?.name ?? "Paciente"} • ${payload.date}</div>
    </div><button onclick="window.print()">Imprimir / Salvar PDF</button></header>
    ${sections}
    <footer><small>Instituto dos Sonhos • Documento educativo • ${payload.date}</small></footer>
  </div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { user_id, files, report_id } = await req.json();
    if (!user_id || !Array.isArray(files) || files.length === 0)
      return new Response(JSON.stringify({ error: "user_id e files são obrigatórios" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Create report row if needed
    let reportId = report_id;
    if (!reportId) {
      const { data, error } = await supabase.from("premium_medical_reports").insert({ user_id, title: "Relatório Médico", status: "running", source_files: files }).select("id").single();
      if (error) throw error;
      reportId = data.id;
    }

    const log = async (stage: string, status: string, message: string, meta?: any) => {
      await supabase.from("premium_report_events").insert({ report_id: reportId, user_id, stage, status, message, meta });
    };

    await log("extraction", "running", "Gerando URLs assinadas e preparando extração");

    // Signed URLs for private files
    const signedUrls = await Promise.all(files.map((f: any) => signUrl(f.bucket, f.path)));

    await log("extraction", "running", "Chamando OpenAI para extração JSON");

    // Stage A — Extraction
    const extracted = await callOpenAIExtraction(signedUrls);
    await log("extraction", "success", "Extração concluída", { count: extracted?.biomarkers?.length || 0 });

    // Normalize
    const biomarkers = (extracted?.biomarkers || []).map((b: any) => {
      const name = normalizeName(b.name || b.alias_raw || "");
      let value = typeof b.value === "number" ? b.value : null;
      let unit = (b.unit || "").trim();
      if (value != null) ({ value, unit } = toCanonical(name, value, unit));
      const st = statusFor(name, value || undefined);
      return { name, label: b.name || name, value, unit, br_ref: REF_BR[name]?.min != null || REF_BR[name]?.max != null ? `${REF_BR[name]?.min ?? ''}-${REF_BR[name]?.max ?? ''}` : undefined, status: st.status };
    });

    // Derived metrics (Stage B)
    const derived = derivedMetrics(biomarkers);

    // Build dynamic sections (only if at least one item exists)
    const sections: any[] = [];
    const hasAny = (...keys: string[]) => keys.some((k) => biomarkers.find((b) => b.name === k));

    if (hasAny("ldl", "hdl", "triglicerideos")) {
      sections.push({
        title: "Cardiovascular",
        icon: "❤️",
        items: biomarkers.filter((b) => ["ldl", "hdl", "triglicerideos"].includes(b.name)),
        meaning: "Seu perfil lipídico foi resumido. Valores fora de faixa sugerem atenção e conversa com o médico.",
        suggest: "Priorize fibras solúveis, sono de qualidade e atividade física. Reavalie em 8–12 semanas.",
      });
    }
    if (hasAny("glicose", "hba1c", "insulina") || derived.homa_ir != null) {
      sections.push({
        title: "Açúcar no sangue",
        icon: "🩸",
        items: [
          ...biomarkers.filter((b) => ["glicose", "hba1c", "insulina"].includes(b.name)),
          derived.homa_ir != null ? { label: "HOMA-IR", value: derived.homa_ir, unit: "", status: derived.homa_ir > 2.5 ? "altered" : "normal" } : null,
        ].filter(Boolean),
        meaning: "Marcadores de glicemia e sensibilidade à insulina.",
        suggest: "Foque em refeições com proteínas e fibras, janelas de movimento após comer e sono consistente.",
      });
    }
    if (hasAny("creatinina", "ureia")) {
      sections.push({ title: "Rins", icon: "🧪", items: biomarkers.filter((b) => ["creatinina", "ureia"].includes(b.name)), meaning: "Função renal básica.", suggest: "Hidratação adequada e acompanhamento médico se alterado." });
    }
    if (hasAny("alt", "ast")) {
      sections.push({ title: "Fígado", icon: "🫀", items: [
        ...biomarkers.filter((b) => ["alt", "ast"].includes(b.name)),
        derived.ast_alt_ratio != null ? { label: "AST/ALT", value: derived.ast_alt_ratio, unit: "", status: derived.ast_alt_ratio > 2 ? "altered" : "normal" } : null,
      ].filter(Boolean), meaning: "Enzimas hepáticas.", suggest: "Evite álcool excessivo, monitore medicamentos e reavalie se persistir." });
    }

    const today = new Date().toISOString();
    const html = buildHTML({ patient: extracted?.patient || {}, sections, date: today });

    // Persist artifacts
    const base = `${user_id}/${reportId}`;
    const saveText = async (path: string, content: string) => {
      const { error } = await supabase.storage.from("medical-reports").upload(path, new Blob([content], { type: "text/plain" }), { upsert: true });
      if (error) throw error;
      return path;
    };

    const extractedPath = await saveText(`${base}/exams_extracted.json`, JSON.stringify({ extracted, biomarkers }, null, 2));
    const derivedPath = await saveText(`${base}/derived_metrics.json`, JSON.stringify(derived, null, 2));
    const htmlPath = await saveText(`${base}/report.html`, html);

    await supabase.from("premium_medical_reports").update({ status: "ready", extracted_json_path: extractedPath, derived_json_path: derivedPath, html_path: htmlPath }).eq("id", reportId);
    await log("render", "success", "Relatório pronto", { htmlPath });

    return new Response(JSON.stringify({ success: true, report_id: reportId, html_path: htmlPath }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("premium-medical-report error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
