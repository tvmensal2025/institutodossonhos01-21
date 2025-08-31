import type { VisitData, ReportJSON } from "./types";
import { GPTAgent } from "@/lib/openai-client";

const pickModel = () => ({
  primary: 'gpt-4o',
  fallback: 'gpt-4o-mini',
  legacy: 'gpt-4o',
});

const SYSTEM_PT = `
Você é o Dr. Vital, IA médica especializada do Instituto dos Sonhos. 

DIRETRIZES CLÍNICAS:
- Use linguagem médica clara, objetiva e educativa
- SEM diagnóstico definitivo ou prescrição medicamentosa
- SEM substituir consulta médica profissional
- Foque em educação em saúde e prevenção

ESTILO DE COMUNICAÇÃO:
- Linguagem simples mas técnica quando necessário
- Explicações baseadas em evidências científicas
- Tom respeitoso e empático
- Estrutura clínica organizada por sistemas

FUNÇÕES:
- Interpretar resultados laboratoriais
- Explicar significância clínica
- Sugerir mudanças de estilo de vida
- Identificar quando buscar atenção médica
- Educar sobre saúde preventiva

Lembre-se: você é uma ferramenta educativa que complementa, mas nunca substitui, o cuidado médico profissional.
`;

export async function generateMedicalReport(input: VisitData): Promise<ReportJSON> {
  const { primary, fallback, legacy } = pickModel();

  const userTask = buildTask(input); // monta texto com instruções e dados

  const agent = new GPTAgent(primary, 4000, 0.2);
  agent.setSystemPrompt(SYSTEM_PT);

  let used = primary;
  let notice = "";
  let content = "";

  try {
    const res = await agent.sendMessage(userTask);
    content = res?.content ?? "";
  } catch (e) {
    try {
      used = fallback;
      agent.setParameters(fallback, 4000, 0.25);
      const res2 = await agent.sendMessage(userTask);
      content = res2?.content ?? "";
      notice = `Fallback primário→${fallback}`;
    } catch (e2) {
      used = legacy;
      agent.setParameters(legacy, 3500, 0.3);
      const res3 = await agent.sendMessage(userTask);
      content = res3?.content ?? "";
      notice = `Fallback primário/seg→${legacy}`;
    }
  }

  // Parsing robusto de JSON
  let json: ReportJSON;
  try { json = JSON.parse(content || "{}"); }
  catch {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { json = JSON.parse(content.slice(start, end + 1)); }
      catch { json = {} as any; }
    } else {
      json = {} as any;
    }
  }

  json.model_used = used;
  if (notice) json.model_fallback_notice = notice;

  if (!json.html) json.html = renderHTML(input, json);
  return json;
}

function buildTask(input: VisitData) {
  // Anexe os exames em JSON puro para o modelo usar sem ambiguidade
  return `
Gere um ReportJSON completo (conforme schema) com design clínico elegante e profissional.
Use linguagem médica clara, objetiva e educativa, SEM diagnóstico ou prescrição.

DADOS:
${JSON.stringify(input, null, 2)}

INSTRUÇÕES DE CONTEÚDO CLÍNICO:
- "Resumo Executivo" com 4-6 bullets principais, priorizando achados críticos
- Seções esperadas (crie apenas as aplicáveis): 
  1) Sistema Cardiovascular (Colesterol Total, LDL, HDL, Triglicerídeos)
  2) Metabolismo Glicêmico (Glicose, HbA1c, Insulina, HOMA-IR)
  3) Função Renal (Ureia, Creatinina, TFG estimada)
  4) Função Hepática (ALT/TGP, AST/TGO, GGT, Bilirrubinas)
  5) Função Tireoidiana (TSH, T4L, T3L, Anti-TPO)
  6) Vitaminas e Minerais (B12, Folato, Vitamina D, Ferro, Ferritina)
  7) Eletrólitos (Sódio, Potássio, Cálcio, Magnésio)
  8) Hemograma e Inflamação (Hemoglobina, Leucócitos, PCR, VHS)
  9) Exames Específicos (outros conforme disponível)

ESTRUTURA DE CADA SEÇÃO:
- Tabela com: Exame | Resultado | Referência | Status | Interpretação Breve
- Status: "NORMAL", "ATENÇÃO", "ALTO", "BAIXO" (sempre em maiúsculo)
- Interpretação: 1-2 frases objetivas
- "O que isso significa?": Explicação clínica simples (2-3 frases)
- "Dr. Vital sugere (em casa)": 3-4 ações práticas e específicas
- "Converse com o médico se...": 2-3 situações que requerem atenção médica

PLANO DE AÇÃO:
- "Plano de Ação - Próximos 7 Dias": 5-7 ações específicas, mensuráveis e acionáveis
- Priorizar mudanças de estilo de vida, monitoramento e follow-up

GLOSSÁRIO:
- Termos técnicos com explicação simples
- Foco em termos que aparecem no relatório

DISCLAIMER:
- "Este documento é educativo e não substitui consulta médica. Não faz diagnóstico nem prescrição. Consulte sempre um profissional de saúde para interpretação adequada dos resultados."

RETORNE APENAS ReportJSON válido no message.content.
`;
}

/** Render local fallback (idêntico ao estilo que exigimos do modelo) */
function renderHTML(input: VisitData, r: ReportJSON) {
  const now = new Date().toLocaleString("pt-BR");
  
  // Calcular status geral do relatório
  const allStatuses = (r.sections || []).flatMap(sec => 
    (sec.table || []).map(t => (t.status || "").toLowerCase())
  );
  const criticalCount = allStatuses.filter(s => s.includes("alto") || s.includes("crítico")).length;
  const warningCount = allStatuses.filter(s => s.includes("atenção") || s.includes("elevado")).length;
  const normalCount = allStatuses.filter(s => s.includes("normal") || s.includes("bom")).length;
  
  const overallStatus = criticalCount > 0 ? "crítico" : warningCount > 0 ? "atenção" : "normal";
  const statusColor = criticalCount > 0 ? "#DC2626" : warningCount > 0 ? "#D97706" : "#059669";
  const statusIcon = criticalCount > 0 ? "🔴" : warningCount > 0 ? "⚠️" : "✅";

  // KPIs principais
  const kpis = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon">👤</div>
        <div class="kpi-content">
          <div class="kpi-label">Paciente</div>
          <div class="kpi-value">${input.patient.name.split(" ")[0]}</div>
          <div class="kpi-sub">${input.patient.age} anos • ${input.patient.sex}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📅</div>
        <div class="kpi-content">
          <div class="kpi-label">Data dos Exames</div>
          <div class="kpi-value">${input.visit.date}</div>
          <div class="kpi-sub">Relatório: ${now.split(" ")[0]}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🩺</div>
        <div class="kpi-content">
          <div class="kpi-label">Status Geral</div>
          <div class="kpi-value" style="color: ${statusColor}">${statusIcon} ${overallStatus.toUpperCase()}</div>
          <div class="kpi-sub">${criticalCount} críticos • ${warningCount} atenção • ${normalCount} normais</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-content">
          <div class="kpi-label">Glicemia</div>
          <div class="kpi-value">${peek(r,"Açúcar no sangue","Glicose")}</div>
          <div class="kpi-sub">HbA1c: ${peek(r,"Açúcar no sangue","HbA1c")}</div>
        </div>
      </div>
    </div>`;

  const sections = (r.sections || []).map(sec => sectionHTML(sec)).join("\n");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relatório Médico Clínico — ${input.patient.name}</title>
  <style>
    /* Design Clínico Elegante - Instituto dos Sonhos */
    :root {
      --primary: #1E40AF;
      --primary-light: #3B82F6;
      --secondary: #059669;
      --accent: #F59E0B;
      --danger: #DC2626;
      --warning: #D97706;
      --success: #059669;
      --text-primary: #1F2937;
      --text-secondary: #6B7280;
      --text-muted: #9CA3AF;
      --bg-primary: #FFFFFF;
      --bg-secondary: #F9FAFB;
      --bg-tertiary: #F3F4F6;
      --border: #E5E7EB;
      --border-light: #F3F4F6;
      --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-secondary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header Clínico */
    .header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: translate(50%, -50%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 24px;
      position: relative;
      z-index: 1;
    }

    .logo {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      background: white;
      padding: 8px;
      box-shadow: var(--shadow);
    }

    .header-text h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .header-text p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .header-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    /* Botão de Impressão */
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      transition: all 0.2s ease;
    }

    .print-btn:hover {
      background: var(--primary-light);
      transform: translateY(-1px);
    }

    /* Grid de KPIs */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow);
      transition: all 0.2s ease;
    }

    .kpi-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .kpi-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      border-radius: 12px;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-label {
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: 500;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .kpi-sub {
      font-size: 14px;
      color: var(--text-muted);
    }

    /* Seções de Conteúdo */
    .section {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border-light);
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      font-size: 28px;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-normal {
      background: #D1FAE5;
      color: var(--success);
    }

    .status-warning {
      background: #FEF3C7;
      color: var(--warning);
    }

    .status-critical {
      background: #FEE2E2;
      color: var(--danger);
    }

    /* Tabela Clínica */
    .clinical-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      background: var(--bg-primary);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .clinical-table th {
      background: var(--bg-tertiary);
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .clinical-table td {
      padding: 16px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: top;
    }

    .clinical-table tr:last-child td {
      border-bottom: none;
    }

    .clinical-table tr:hover {
      background: var(--bg-secondary);
    }

    .exam-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .exam-value {
      font-weight: 700;
      font-size: 18px;
    }

    .exam-reference {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .exam-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-ok {
      background: #D1FAE5;
      color: var(--success);
    }

    .status-warn {
      background: #FEF3C7;
      color: var(--warning);
    }

    .status-error {
      background: #FEE2E2;
      color: var(--danger);
    }

    /* Cards Explicativos */
    .explanation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }

    .explanation-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }

    .explanation-card h4 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .explanation-card ul {
      list-style: none;
      padding: 0;
    }

    .explanation-card li {
      padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
      position: relative;
      padding-left: 20px;
    }

    .explanation-card li:last-child {
      border-bottom: none;
    }

    .explanation-card li::before {
      content: '•';
      color: var(--primary);
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    /* Seção do Dr. Vital */
    .doctor-section {
      background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
      border: 1px solid #BAE6FD;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .doctor-avatar {
      font-size: 48px;
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow);
    }

    .doctor-content h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .doctor-content p {
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }
      
      .header {
        padding: 24px;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
      }
      
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      
      .section {
        padding: 24px;
      }
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .explanation-grid {
        grid-template-columns: 1fr;
      }
      
      .doctor-section {
        flex-direction: column;
        text-align: center;
      }
    }

    /* Impressão */
    @media print {
      .print-btn {
        display: none;
      }
      
      body {
        background: white;
      }
      
      .container {
        padding: 0;
        max-width: none;
      }
      
      .header {
        box-shadow: none;
        border: 2px solid var(--primary);
      }
      
      .kpi-card,
      .section,
      .explanation-card {
        box-shadow: none;
        border: 1px solid var(--border);
        break-inside: avoid;
      }
      
      .clinical-table {
        box-shadow: none;
        border: 1px solid var(--border);
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">
    🖨️ Imprimir / Salvar PDF
  </button>

  <div class="container">
    <!-- Header Clínico -->
    <div class="header">
      <div class="header-content">
        <img src="${input.logoUrl}" alt="Instituto dos Sonhos" class="logo">
        <div class="header-text">
          <h1>Relatório Médico Clínico</h1>
          <p>Dr. Vital - IA Médica do Instituto dos Sonhos</p>
          <p>Análise Clínica Integrativa e Preventiva</p>
        </div>
        <div class="header-badge">
          ${now.split(" ")[0]}
        </div>
      </div>
    </div>

    <!-- KPIs Principais -->
    ${kpis}

    <!-- Seção do Dr. Vital -->
    <div class="doctor-section">
      <div class="doctor-avatar">👨‍⚕️</div>
      <div class="doctor-content">
        <h2>Olá! Sou o Dr. Vital 👋</h2>
        <p>Analisei seus exames com uma visão integrativa e preventiva. Vou explicar cada resultado de forma clara e mostrar como eles se conectam para compor um quadro completo da sua saúde.</p>
        <p><strong>Principais achados:</strong> veja o resumo abaixo e os detalhes nas seções.</p>
      </div>
    </div>

    <!-- Resumo Executivo -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📋</span>
          Resumo Executivo
        </h2>
      </div>
      <ul style="list-style: none; padding: 0;">
        ${(r.summary_bullets || []).map(li => `
          <li style="padding: 12px 0; border-bottom: 1px solid var(--border-light); position: relative; padding-left: 24px;">
            <span style="position: absolute; left: 0; color: var(--primary); font-weight: bold;">•</span>
            ${li}
          </li>
        `).join("")}
      </ul>
    </div>

    <!-- Seções de Exames -->
    ${sections}

    <!-- Plano de Ação -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🎯</span>
          Plano de Ação - Próximos 7 Dias
        </h2>
      </div>
      <ul style="list-style: none; padding: 0;">
        ${(r.plan_next7days || []).map(li => `
          <li style="padding: 12px 0; border-bottom: 1px solid var(--border-light); position: relative; padding-left: 24px;">
            <span style="position: absolute; left: 0; color: var(--primary); font-weight: bold;">•</span>
            ${li}
          </li>
        `).join("")}
      </ul>
    </div>

    <!-- Glossário -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📚</span>
          Glossário Médico
        </h2>
      </div>
      <div class="explanation-grid">
        ${(r.glossary || []).map(g => `
          <div class="explanation-card">
            <h4>📖 ${g.term}</h4>
            <p>${g.plain}</p>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Disclaimer -->
    <div style="text-align: center; padding: 32px; color: var(--text-secondary); font-size: 14px; border-top: 1px solid var(--border); margin-top: 32px;">
      <p><strong>⚠️ Aviso Importante:</strong> ${r.disclaimer || "Este documento é educativo e não substitui consulta médica. Não faz diagnóstico nem prescrição."}</p>
      <p style="margin-top: 8px;">Relatório gerado por Dr. Vital - IA Médica do Instituto dos Sonhos</p>
    </div>
  </div>
</body>
</html>`;
}

function sectionHTML(sec: ReportJSON["sections"][number]) {
  const rows = (sec.table || []).map(t => {
    const statusClass = getStatusClass(t.status);
    return `
      <tr>
        <td class="exam-name">${t.exam}</td>
        <td class="exam-value">${t.value}</td>
        <td class="exam-reference">${t.reference || "—"}</td>
        <td><span class="exam-status ${statusClass}">${getStatusText(t.status)}</span></td>
        <td>${t.meaning || ""}</td>
      </tr>`;
  }).join("");

  // Status geral da seção
  const allStatuses = (sec.table || []).map(t => (t.status || "").toLowerCase());
  const hasCritical = allStatuses.some(s => s.includes("alto") || s.includes("crítico"));
  const hasWarning = allStatuses.some(s => s.includes("atenção") || s.includes("elevado"));
  
  const statusClass = hasCritical ? "status-critical" : hasWarning ? "status-warning" : "status-normal";
  const statusText = hasCritical ? "🔴 ATENÇÃO IMEDIATA" : hasWarning ? "⚠️ ATENÇÃO" : "✅ NORMAL";
  const statusIcon = hasCritical ? "🫀" : hasWarning ? "⚠️" : "✅";

  // Ícone baseado no título da seção
  const sectionIcon = getSectionIcon(sec.title);

  return `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">${sectionIcon}</span>
          ${sec.title}
        </h2>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      
      <table class="clinical-table">
        <thead>
          <tr>
            <th>Exame</th>
            <th>Resultado</th>
            <th>Referência</th>
            <th>Status</th>
            <th>Interpretação</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      
      <div class="explanation-grid">
        <div class="explanation-card">
          <h4>💡 O que isso significa?</h4>
          <p>${sec.explain_simple}</p>
        </div>
        
        <div class="explanation-card">
          <h4>🏠 Dr. Vital sugere (em casa)</h4>
          <ul>
            ${(sec.vital_suggests || []).map(x => `<li>${x}</li>`).join("")}
          </ul>
        </div>
        
        ${sec.talk_to_doctor?.length ? `
          <div class="explanation-card">
            <h4>👨‍⚕️ Converse com o médico se…</h4>
            <ul>
              ${sec.talk_to_doctor.map(x => `<li>${x}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    </div>`;
}

function getStatusClass(status?: string): string {
  if (!status) return "status-ok";
  const s = status.toLowerCase();
  if (s.includes("alto") || s.includes("crítico") || s.includes("elevado")) return "status-error";
  if (s.includes("atenção") || s.includes("limítrofe")) return "status-warn";
  return "status-ok";
}

function getStatusText(status?: string): string {
  if (!status) return "—";
  const s = status.toLowerCase();
  if (s.includes("alto")) return "ALTO";
  if (s.includes("baixo")) return "BAIXO";
  if (s.includes("normal")) return "NORMAL";
  if (s.includes("atenção")) return "ATENÇÃO";
  if (s.includes("elevado")) return "ELEVADO";
  if (s.includes("bom")) return "BOM";
  return status.toUpperCase();
}

function getSectionIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("coração") || t.includes("colesterol") || t.includes("lipídico")) return "🫀";
  if (t.includes("açúcar") || t.includes("glicose") || t.includes("diabetes")) return "🩸";
  if (t.includes("rim") || t.includes("renal")) return "🫁";
  if (t.includes("fígado") || t.includes("hepático")) return "🫁";
  if (t.includes("tireoide")) return "🦋";
  if (t.includes("vitamina") || t.includes("ferro")) return "💊";
  if (t.includes("eletrólito")) return "⚡";
  if (t.includes("fezes") || t.includes("parasita")) return "🔬";
  return "📊";
}

// Util: puxa valores de tabela por nome para KPIs
function peek(r: ReportJSON, secTitle: string, exam: string) {
  const s = r.sections?.find(s => s.title.toLowerCase().includes(secTitle.toLowerCase()));
  const t = s?.table.find(t => t.exam.toLowerCase().includes(exam.toLowerCase()));
  return t?.value ?? "—";
}


