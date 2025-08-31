import jsPDF from 'jspdf';

export interface MealIngredient { name: string; quantity: number; unit: string }
export interface MealEntry { name: string; calories_kcal?: number; ingredients?: MealIngredient[]; notes?: string; homemade_measure?: string }

export interface MealPlanForPDF {
  userName?: string;
  dateLabel: string;
  targetCaloriesKcal?: number;
  guaranteed?: boolean;
  meals: {
    breakfast?: MealEntry;
    lunch?: MealEntry;
    afternoon_snack?: MealEntry;
    dinner?: MealEntry;
    supper?: MealEntry;
  }
}

export async function exportMealPlanToPDF(plan: MealPlanForPDF) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;

  // Header com logo e selo
  pdf.setFillColor(16, 185, 129); // emerald
  pdf.rect(0, 0, pageWidth, 22, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('Sofia Nutricional — Sugestão de Cardápio', margin, 14);
  pdf.setFontSize(10);
  const headerSubtitle = plan.guaranteed ? 'Garantido ✓ metas atendidas' : 'Sugestão de IA — não substitui avaliação profissional';
  pdf.text(headerSubtitle, pageWidth - margin, 14, { align: 'right' });

  // Info
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(12);
  pdf.text(`Usuário: ${plan.userName || '—'}`, margin, 34);
  pdf.text(`Data: ${plan.dateLabel}`, margin, 40);
  if (plan.targetCaloriesKcal) {
    pdf.text(`Meta calórica: ${plan.targetCaloriesKcal} kcal`, margin, 46);
  }

  // Funções de estimativa de macros
  type Nutrients = { kcal: number; protein_g: number; fat_g: number; carbs_g: number; fiber_g: number; sodium_mg: number };
  const perGram = (name: string): Nutrients => {
    const n = name.toLowerCase();
    if (n.includes('arroz')) return { kcal: 1.3, protein_g: 0.027, fat_g: 0.003, carbs_g: 0.28, fiber_g: 0.004, sodium_mg: 0.01 };
    if (n.includes('frango')) return { kcal: 1.1, protein_g: 0.206, fat_g: 0.036, carbs_g: 0, fiber_g: 0, sodium_mg: 0.74 };
    if (n.includes('peixe')) return { kcal: 1.0, protein_g: 0.22, fat_g: 0.02, carbs_g: 0, fiber_g: 0, sodium_mg: 0.6 };
    if (n.includes('atum')) return { kcal: 1.32, protein_g: 0.29, fat_g: 0.01, carbs_g: 0, fiber_g: 0, sodium_mg: 0.37 };
    if (n.includes('ovo')) return { kcal: 1.56, protein_g: 0.126, fat_g: 0.106, carbs_g: 0.012, fiber_g: 0, sodium_mg: 1.24 };
    if (n.includes('aveia')) return { kcal: 3.89, protein_g: 0.17, fat_g: 0.07, carbs_g: 0.66, fiber_g: 0.11, sodium_mg: 0.02 };
    if (n.includes('pão') || n.includes('pao')) return { kcal: 2.6, protein_g: 0.08, fat_g: 0.03, carbs_g: 0.49, fiber_g: 0.025, sodium_mg: 5 };
    if (n.includes('banana')) return { kcal: 0.89, protein_g: 0.011, fat_g: 0.003, carbs_g: 0.23, fiber_g: 0.026, sodium_mg: 0.001 };
    if (n.includes('maç') || n.includes('maca')) return { kcal: 0.52, protein_g: 0.003, fat_g: 0.002, carbs_g: 0.14, fiber_g: 0.024, sodium_mg: 0.001 };
    if (n.includes('iogurte')) return { kcal: 0.63, protein_g: 0.035, fat_g: 0.033, carbs_g: 0.049, fiber_g: 0, sodium_mg: 0.5 };
    if (n.includes('leite')) return { kcal: 0.64, protein_g: 0.033, fat_g: 0.036, carbs_g: 0.05, fiber_g: 0, sodium_mg: 0.44 };
    if (n.includes('queijo')) return { kcal: 4, protein_g: 0.25, fat_g: 0.33, carbs_g: 0.013, fiber_g: 0, sodium_mg: 6 };
    if (n.includes('batata doce')) return { kcal: 0.86, protein_g: 0.016, fat_g: 0.001, carbs_g: 0.20, fiber_g: 0.03, sodium_mg: 0.055 };
    if (n.includes('batata')) return { kcal: 0.77, protein_g: 0.02, fat_g: 0.001, carbs_g: 0.17, fiber_g: 0.026, sodium_mg: 0.005 };
    if (n.includes('salada') || n.includes('legume')) return { kcal: 0.25, protein_g: 0.012, fat_g: 0.003, carbs_g: 0.04, fiber_g: 0.02, sodium_mg: 0.01 };
    if (n.includes('azeite')) return { kcal: 8.84, protein_g: 0, fat_g: 1.0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
    if (n.includes('molho')) return { kcal: 0.29, protein_g: 0.015, fat_g: 0.002, carbs_g: 0.05, fiber_g: 0.015, sodium_mg: 4 };
    return { kcal: 1.0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
  };
  const computeMeal = (m?: MealEntry): Nutrients => {
    if (!m) return { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };
    const base = (m.ingredients || []).reduce<Nutrients>((acc, ing) => {
      const p = perGram(ing.name);
      const g = Number(ing.quantity || 0);
      acc.kcal += p.kcal * g;
      acc.protein_g += p.protein_g * g;
      acc.fat_g += p.fat_g * g;
      acc.carbs_g += p.carbs_g * g;
      acc.fiber_g += p.fiber_g * g;
      acc.sodium_mg += p.sodium_mg * g;
      return acc;
    }, { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 });
    if (m.calories_kcal && base.kcal === 0) base.kcal = m.calories_kcal;
    return base;
  };

  // Cabeçalho da tabela
  let y = 56;
  pdf.setFontSize(11);
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, y - 6, pageWidth - margin * 2, 8, 'F');
  pdf.setFont(undefined, 'bold');
  const colW = [36, 52, 60, 16, pageWidth - margin * 2 - (36 + 52 + 60 + 16)];
  let x = margin + 2;
  ['Refeição', 'Alimento', 'Medida caseira', 'kcal', 'Observações'].forEach((t, i) => { pdf.text(t, x, y); x += colW[i]; });
  y += 10;
  pdf.setFont(undefined, 'normal');

  const drawMeal = (label: string, entry?: MealEntry) => {
    if (!entry) return;
    const measureRaw = entry.homemade_measure || (entry.ingredients?.map(i => `${i.name} ${Math.round(i.quantity)}${i.unit}`).join(', ') || '—');
    const measure = pdf.splitTextToSize(measureRaw, colW[2] - 4);
    const food = pdf.splitTextToSize(entry.name || '—', colW[1] - 4);
    const notes = pdf.splitTextToSize(entry.notes || '—', colW[4] - 4);
    const rowH = Math.max(measure.length, food.length, notes.length) * 6;
    // Texto principal
    let cx = margin + 2;
    pdf.text(label, cx, y); cx += colW[0];
    pdf.text(food, cx, y); cx += colW[1];
    pdf.text(measure, cx, y); cx += colW[2];
    pdf.text(String(Math.round(entry.calories_kcal || computeMeal(entry).kcal || 0)), cx, y); cx += colW[3];
    pdf.text(notes, cx, y);
    // Linha de macros abaixo
    const n = computeMeal(entry);
    const macroText = `Prot ${Math.round(n.protein_g)} g • Carb ${Math.round(n.carbs_g)} g • Gord ${Math.round(n.fat_g)} g • Fibra ${Math.round(n.fiber_g)} g`;
    pdf.setTextColor(107,114,128);
    pdf.setFontSize(9);
    pdf.text(macroText, margin + colW[0] + 2, y + rowH - 2);
    pdf.setTextColor(31,41,55);
    pdf.setFontSize(11);
    y += rowH + 4;
  };

  drawMeal('Café da manhã', plan.meals.breakfast);
  drawMeal('Almoço', plan.meals.lunch);
  drawMeal('Café da tarde', plan.meals.afternoon_snack);
  drawMeal('Jantar', plan.meals.dinner);
  drawMeal('Ceia', plan.meals.supper);

  // Totais
  const b = computeMeal(plan.meals.breakfast);
  const l = computeMeal(plan.meals.lunch);
  const s = computeMeal(plan.meals.afternoon_snack);
  const d = computeMeal(plan.meals.dinner);
  const sp = computeMeal(plan.meals.supper);
  const total: Nutrients = {
    kcal: b.kcal + l.kcal + s.kcal + d.kcal + sp.kcal,
    protein_g: b.protein_g + l.protein_g + s.protein_g + d.protein_g + sp.protein_g,
    fat_g: b.fat_g + l.fat_g + s.fat_g + d.fat_g + sp.fat_g,
    carbs_g: b.carbs_g + l.carbs_g + s.carbs_g + d.carbs_g + sp.carbs_g,
    fiber_g: b.fiber_g + l.fiber_g + s.fiber_g + d.fiber_g + sp.fiber_g,
    sodium_mg: b.sodium_mg + l.sodium_mg + s.sodium_mg + d.sodium_mg + sp.sodium_mg,
  };

  pdf.setFont(undefined, 'bold');
  pdf.text(`Total diário: ${Math.round(total.kcal)} kcal${plan.targetCaloriesKcal ? ` (meta: ${plan.targetCaloriesKcal} kcal)` : ''}`, margin, y + 4);
  y += 10;

  // Cards de resumo de macros
  const cardW = (pageWidth - margin * 2 - 8) / 4; // 4 cards por linha
  const cardH = 18;
  const drawCard = (ix: number, title: string, value: string) => {
    const cx = margin + (cardW + 8) * ix;
    pdf.setFillColor(243, 244, 246);
    pdf.roundedRect(cx, y, cardW, cardH, 3, 3, 'F');
    pdf.setTextColor(107,114,128);
    pdf.setFontSize(9);
    pdf.text(title, cx + 4, y + 6);
    pdf.setTextColor(31,41,55);
    pdf.setFontSize(12);
    pdf.text(value, cx + 4, y + 13);
  };
  drawCard(0, 'Proteínas', `${Math.round(total.protein_g)} g`);
  drawCard(1, 'Carboidratos', `${Math.round(total.carbs_g)} g`);
  drawCard(2, 'Gorduras', `${Math.round(total.fat_g)} g`);
  drawCard(3, 'Fibras', `${Math.round(total.fiber_g)} g`);
  y += cardH + 10;

  // QR para reabrir plano (tolerante a ambientes sem a lib instalada)
  try {
    const spec = 'qrcode';
    // Evita falha de análise do Vite em ambientes onde 'qrcode' não está instalado
    // @ts-ignore
    const mod: any = await import(/* @vite-ignore */ spec).catch(() => null);
    if (mod) {
      const QR = mod.default ?? mod;
      const dataUrl = await QR.toDataURL(window.location.href, { margin: 1, scale: 4 });
      pdf.addImage(dataUrl, 'PNG', pageWidth - margin - 32, y, 28, 28);
      pdf.setFontSize(9);
      pdf.text('Reabra este plano', pageWidth - margin - 32, y + 32);
    } else {
      pdf.setFontSize(9);
      pdf.text(`Acesse: ${window.location.href}`, margin, y + 6);
    }
  } catch {
    pdf.setFontSize(9);
    pdf.text(`Acesse: ${window.location.href}`, margin, y + 6);
  }

  // Aviso legal
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Aviso: material educativo gerado por IA. Não substitui avaliação individualizada de nutricionista/médico.', margin, 286);

  pdf.save(`cardapio_${new Date().toISOString().split('T')[0]}.pdf`);
}


