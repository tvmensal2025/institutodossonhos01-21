// Entrada
export type Exam = {
  name: string;
  value: number | string;
  unit?: string;
  reference?: { low?: number; high?: number; note?: string };
  date?: string; // ISO
};

export type VisitData = {
  logoUrl: string; // ex: http://45.67.221.216:8086/logoids.png
  patient: { name: string; sex: "Feminino" | "Masculino" | "Outro"; birth: string /* DD/MM/AAAA */; age: number };
  visit: { date: string /* DD/MM/AAAA */ };
  vitals?: { weightKg?: number; heightCm?: number; bmi?: number; sbp?: number; dbp?: number; hr?: number; tempC?: number; spo2?: number };
  examsCurrent: Exam[];
  examsPrevious?: Exam[]; // opcional, para deltas
};

// Saída
export type ReportJSON = {
  model_used: string;
  model_fallback_notice?: string;
  summary_bullets: string[];
  risk_flags: { level: "alto" | "moderado" | "baixo"; notes: string[] };
  sections: Array<{
    title: string; // ex: "Coração e circulação — Colesterol"
    table: Array<{ exam: string; value: string; reference?: string; status?: "bom" | "normal" | "atenção" | "alto"; meaning?: string }>;
    explain_simple: string; // O que isso significa?
    vital_suggests: string[]; // Dr. Vital sugere
    talk_to_doctor?: string[]; // Converse com o médico se...
  }>;
  plan_next7days: string[]; // plano simples
  glossary: Array<{ term: string; plain: string }>;
  disclaimer: string;
  html: string; // HTML completo (com botão Imprimir)
};


