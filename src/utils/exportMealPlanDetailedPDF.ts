import jsPDF from 'jspdf';

export interface DetailedMealPlanForPDF {
  userName?: string;
  dateLabel: string;
  targetCaloriesKcal?: number;
  guaranteed: boolean;
  days: Array<{
    day: number;
    dayName: string;
    meals: Array<{
      meal_type: string;
      recipe_name: string;
      recipe_description: string;
      prep_time: string;
      cook_time: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      ingredients: string;
      instructions: string;
      recipe_id: string;
    }>;
    dailyTotals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  }>;
}

export async function exportDetailedMealPlanToPDF(plan: DetailedMealPlanForPDF) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredSpace: number, currentY: number) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      return margin;
    }
    return currentY;
  };

  // Header com logo e título
  pdf.setFillColor(16, 185, 129); // emerald
  pdf.rect(0, 0, pageWidth, 25, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Sofia Nutricional — Cardápio Detalhado', margin, 16);
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  const headerSubtitle = plan.guaranteed ? 'Garantido ✓ metas atendidas' : 'Sugestão de IA — não substitui avaliação profissional';
  pdf.text(headerSubtitle, pageWidth - margin, 16, { align: 'right' });

  // Informações gerais
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Usuário: ${plan.userName || '—'}`, margin, 35);
  pdf.text(`Data: ${plan.dateLabel}`, margin, 42);
  if (plan.targetCaloriesKcal) {
    pdf.text(`Meta calórica: ${plan.targetCaloriesKcal} kcal`, margin, 49);
  }

  let y = 60;

  // Para cada dia
  plan.days.forEach((day, dayIndex) => {
    y = checkPageBreak(150, y); // Espaço necessário para um dia

    // Título do dia
    pdf.setFillColor(243, 244, 246);
    pdf.rect(0, y - 5, pageWidth, 12, 'F');
    pdf.setTextColor(16, 185, 129);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${day.dayName} - Dia ${day.day}`, margin, y);
    
    // Totais do dia
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total: ${day.dailyTotals.calories} kcal | P: ${Math.round(day.dailyTotals.protein)}g | C: ${Math.round(day.dailyTotals.carbs)}g | G: ${Math.round(day.dailyTotals.fat)}g`, margin, y + 6);
    
    y += 15;

    // Para cada refeição do dia
    day.meals.forEach((meal, mealIndex) => {
      y = checkPageBreak(120, y); // Espaço necessário para uma refeição

      // Título da refeição
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(meal.meal_type.toUpperCase(), margin, y);
      
      // Nome da receita
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(meal.recipe_name, margin, y + 8);
      
      // Informações nutricionais
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text(`${meal.calories} kcal | P: ${meal.protein}g | C: ${meal.carbs}g | G: ${meal.fat}g | Fibras: ${meal.fiber}g`, margin, y + 12);
      
      // Tempo de preparo
      pdf.text(`⏱️ Tempo: ${meal.prep_time} | 🍳 Cozimento: ${meal.cook_time}`, margin, y + 16);
      
      y += 22;

      // Ingredientes
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('📋 INGREDIENTES:', margin, y);
      
      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      const ingredients = pdf.splitTextToSize(meal.ingredients, pageWidth - 2 * margin);
      ingredients.forEach((line: string) => {
        pdf.text(`• ${line}`, margin + 5, y + 5);
        y += 4;
      });
      
      y += 8;

      // Modo de preparo
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('👨‍🍳 MODO DE PREPARO:', margin, y);
      
      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      const instructions = pdf.splitTextToSize(meal.instructions, pageWidth - 2 * margin);
      instructions.forEach((line: string) => {
        pdf.text(line, margin + 5, y + 5);
        y += 4;
      });
      
      y += 10;

      // Separador entre refeições
      if (mealIndex < day.meals.length - 1) {
        pdf.setDrawColor(229, 231, 235);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 5;
      }
    });

    // Separador entre dias
    if (dayIndex < plan.days.length - 1) {
      y += 10;
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(2);
      pdf.line(margin, y, pageWidth - margin, y);
      pdf.setLineWidth(1);
      y += 15;
    }
  });

  // Aviso legal
  y = checkPageBreak(20, y);
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(8);
  pdf.text('Aviso: material educativo gerado por IA. Não substitui avaliação individualizada de nutricionista/médico.', margin, y);

  // Salvar PDF
  pdf.save(`cardapio_detalhado_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Função para converter dados do formato atual para formato detalhado
export function convertMealieToDetailedFormat(mealPlan: any[]): DetailedMealPlanForPDF {
  const days = mealPlan.map((dayData: any) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = dayNames[dayData.day - 1] || `Dia ${dayData.day}`;
    
    // Converter refeições do formato atual para formato detalhado
    const meals = [];
    
    if (dayData.meals.breakfast) {
      meals.push({
        meal_type: 'Café da Manhã',
        recipe_name: dayData.meals.breakfast.title,
        recipe_description: dayData.meals.breakfast.description,
        prep_time: '15 minutos',
        cook_time: '10 minutos',
        calories: dayData.meals.breakfast.macros.calories,
        protein: dayData.meals.breakfast.macros.protein,
        carbs: dayData.meals.breakfast.macros.carbs,
        fat: dayData.meals.breakfast.macros.fat,
        fiber: dayData.meals.breakfast.macros.fiber || 0,
        ingredients: dayData.meals.breakfast.ingredients.join(', '),
        instructions: dayData.meals.breakfast.description,
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.lunch) {
      meals.push({
        meal_type: 'Almoço',
        recipe_name: dayData.meals.lunch.title,
        recipe_description: dayData.meals.lunch.description,
        prep_time: '20 minutos',
        cook_time: '30 minutos',
        calories: dayData.meals.lunch.macros.calories,
        protein: dayData.meals.lunch.macros.protein,
        carbs: dayData.meals.lunch.macros.carbs,
        fat: dayData.meals.lunch.macros.fat,
        fiber: dayData.meals.lunch.macros.fiber || 0,
        ingredients: dayData.meals.lunch.ingredients.join(', '),
        instructions: dayData.meals.lunch.description,
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.snack) {
      meals.push({
        meal_type: 'Lanche',
        recipe_name: dayData.meals.snack.title,
        recipe_description: dayData.meals.snack.description,
        prep_time: '10 minutos',
        cook_time: '5 minutos',
        calories: dayData.meals.snack.macros.calories,
        protein: dayData.meals.snack.macros.protein,
        carbs: dayData.meals.snack.macros.carbs,
        fat: dayData.meals.snack.macros.fat,
        fiber: dayData.meals.snack.macros.fiber || 0,
        ingredients: dayData.meals.snack.ingredients.join(', '),
        instructions: dayData.meals.snack.description,
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.dinner) {
      meals.push({
        meal_type: 'Jantar',
        recipe_name: dayData.meals.dinner.title,
        recipe_description: dayData.meals.dinner.description,
        prep_time: '15 minutos',
        cook_time: '25 minutos',
        calories: dayData.meals.dinner.macros.calories,
        protein: dayData.meals.dinner.macros.protein,
        carbs: dayData.meals.dinner.macros.carbs,
        fat: dayData.meals.dinner.macros.fat,
        fiber: dayData.meals.dinner.macros.fiber || 0,
        ingredients: dayData.meals.dinner.ingredients.join(', '),
        instructions: dayData.meals.dinner.description,
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.supper) {
      meals.push({
        meal_type: 'Ceia',
        recipe_name: dayData.meals.supper.title,
        recipe_description: dayData.meals.supper.description,
        prep_time: '5 minutos',
        cook_time: '0 minutos',
        calories: dayData.meals.supper.macros.calories,
        protein: dayData.meals.supper.macros.protein,
        carbs: dayData.meals.supper.macros.carbs,
        fat: dayData.meals.supper.macros.fat,
        fiber: dayData.meals.supper.macros.fiber || 0,
        ingredients: dayData.meals.supper.ingredients.join(', '),
        instructions: dayData.meals.supper.description,
        recipe_id: 'taco-recipe'
      });
    }
    
    return {
      day: dayData.day,
      dayName,
      meals,
      dailyTotals: dayData.dailyTotals || {
        calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
        carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
        fat: meals.reduce((sum, meal) => sum + meal.fat, 0),
        fiber: meals.reduce((sum, meal) => sum + meal.fiber, 0)
      }
    };
  });

  return {
    userName: 'Usuário',
    dateLabel: `Cardápio Detalhado - ${new Date().toLocaleDateString('pt-BR')}`,
    targetCaloriesKcal: 2000,
    guaranteed: false,
    days
  };
}
