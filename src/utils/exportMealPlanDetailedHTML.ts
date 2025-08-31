export interface DetailedMealPlanForHTML {
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
      total_time?: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      ingredients: string;
      instructions: string;
      tags?: string;
      difficulty?: string;
      servings?: string;
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

export function generateDetailedMealPlanHTML(plan: DetailedMealPlanForHTML): string {
  const escapeHtml = (text: string) => {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    // Fallback para ambiente sem DOM
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const getMealTypeClass = (mealType: string) => {
    const type = mealType.toLowerCase();
    if (type.includes('café') || type.includes('cafe')) return 'breakfast';
    if (type.includes('almoço') || type.includes('almoco')) return 'lunch';
    if (type.includes('lanche')) return 'snack';
    if (type.includes('jantar')) return 'dinner';
    if (type.includes('ceia')) return 'supper';
    return 'breakfast';
  };

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${plan.dateLabel}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a202c;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 15px;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        
        .header .subtitle {
            font-size: 1.3em;
            opacity: 0.95;
            font-weight: 400;
        }
        
        .daily-totals {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 40px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .daily-totals h2 {
            font-size: 1.8em;
            color: #2d3748;
            margin-bottom: 30px;
            font-weight: 600;
        }
        
        .totals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 25px;
            margin-top: 20px;
        }
        
        .total-item {
            background: white;
            padding: 30px 20px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            border: 2px solid transparent;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .total-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .total-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.12);
            border-color: #667eea;
        }
        
        .total-value {
            font-size: 2.5em;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .total-label {
            color: #718096;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 500;
        }
        
        .days-container {
            padding: 50px 40px;
        }
        
        .day-section {
            margin-bottom: 60px;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        
        .day-header {
            background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
            color: white;
            padding: 30px 40px;
            font-size: 1.6em;
            font-weight: 600;
            position: relative;
        }
        
        .day-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .meals-container {
            padding: 40px;
        }
        
        .meal-card {
            margin-bottom: 40px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            transition: all 0.4s ease;
            border: 1px solid #e2e8f0;
        }
        
        .meal-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        
        .meal-header {
            padding: 25px 30px;
            color: white;
            font-size: 1.4em;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .meal-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        
        .meal-card:hover .meal-header::before {
            transform: translateX(100%);
        }
        
        .meal-header.breakfast { 
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        }
        .meal-header.lunch { 
            background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
            box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
        }
        .meal-header.snack { 
            background: linear-gradient(135deg, #FFE66D 0%, #FFA726 100%);
            box-shadow: 0 5px 15px rgba(255, 230, 109, 0.3);
        }
        .meal-header.dinner { 
            background: linear-gradient(135deg, #A8E6CF 0%, #7FB069 100%);
            box-shadow: 0 5px 15px rgba(168, 230, 207, 0.3);
        }
        .meal-header.supper { 
            background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%);
            box-shadow: 0 5px 15px rgba(155, 89, 182, 0.3);
        }
        
        .meal-content {
            padding: 35px;
            background: white;
        }
        
        .recipe-title {
            font-size: 2.2em;
            color: #1a202c;
            margin-bottom: 15px;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1.2;
        }
        
        .recipe-description {
            color: #718096;
            font-style: italic;
            margin-bottom: 25px;
            font-size: 1.1em;
            line-height: 1.6;
        }
        
        .recipe-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .meta-item {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .meta-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        
        .meta-label {
            font-size: 0.85em;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .meta-value {
            font-size: 1.3em;
            font-weight: 700;
            color: #2d3748;
        }
        
        .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 20px;
            margin-bottom: 35px;
        }
        
        .nutrition-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 15px;
            border-radius: 15px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .nutrition-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }
        
        .nutrition-item:hover::before {
            transform: translateX(100%);
        }
        
        .nutrition-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .nutrition-value {
            font-size: 1.6em;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .nutrition-label {
            font-size: 0.8em;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
            position: relative;
            z-index: 1;
        }
        
        .ingredients-section, .instructions-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 1.4em;
            color: #1a202c;
            margin-bottom: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
        
        .ingredients-list {
            background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #48bb78;
            line-height: 1.8;
            font-size: 1.05em;
            color: #2d3748;
            box-shadow: 0 5px 15px rgba(72, 187, 120, 0.1);
        }
        
        .instructions-text {
            background: linear-gradient(135deg, #fffaf0 0%, #fef5e7 100%);
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #ed8936;
            line-height: 1.8;
            font-size: 1.05em;
            color: #2d3748;
            box-shadow: 0 5px 15px rgba(237, 137, 54, 0.1);
        }
        
        .footer {
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            color: white;
            text-align: center;
            padding: 40px;
            margin-top: 50px;
            position: relative;
            overflow: hidden;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain2" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.05"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.05"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain2)"/></svg>');
        }
        
        .footer-content {
            position: relative;
            z-index: 1;
        }
        
        .footer h3 {
            margin-bottom: 15px;
            font-size: 1.8em;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .footer p {
            opacity: 0.8;
            font-size: 1em;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 2.2em;
            }
            
            .daily-totals {
                padding: 30px 20px;
            }
            
            .totals-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .nutrition-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .recipe-meta {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .days-container {
                padding: 30px 20px;
            }
            
            .meals-container {
                padding: 25px;
            }
            
            .meal-content {
                padding: 25px;
            }
            
            .recipe-title {
                font-size: 1.8em;
            }
        }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .meal-card:hover {
                transform: none;
            }
            
            .total-item:hover,
            .meta-item:hover,
            .nutrition-item:hover {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>${plan.dateLabel}</h1>
                <div class="subtitle">Cardápio Personalizado - ${plan.userName}</div>
            </div>
        </div>
        
        <div class="daily-totals">
            <h2>Resumo Nutricional Diário</h2>
            <div class="totals-grid">
                <div class="total-item">
                    <div class="total-value">${plan.targetCaloriesKcal}</div>
                    <div class="total-label">Calorias (kcal)</div>
                </div>
                <div class="total-item">
                    <div class="total-value">${plan.days[0]?.dailyTotals.protein || 0}</div>
                    <div class="total-label">Proteínas (g)</div>
                </div>
                <div class="total-item">
                    <div class="total-value">${plan.days[0]?.dailyTotals.carbs || 0}</div>
                    <div class="total-label">Carboidratos (g)</div>
                </div>
                <div class="total-item">
                    <div class="total-value">${plan.days[0]?.dailyTotals.fat || 0}</div>
                    <div class="total-label">Gorduras (g)</div>
                </div>
                <div class="total-item">
                    <div class="total-value">${plan.days[0]?.dailyTotals.fiber || 0}</div>
                    <div class="total-label">Fibras (g)</div>
                </div>
            </div>
        </div>
        
        <div class="days-container">
            ${plan.days.map(day => `
                <div class="day-section">
                    <div class="day-header">
                        ${day.dayName} - Dia ${day.day}
                    </div>
                    <div class="meals-container">
                        ${day.meals.map(meal => `
                            <div class="meal-card">
                                <div class="meal-header ${getMealTypeClass(meal.meal_type)}">
                                    <span>${meal.meal_type.toUpperCase()}</span>
                                    <span>${meal.calories} kcal</span>
                                </div>
                                <div class="meal-content">
                                    <div class="recipe-title">${meal.recipe_name}</div>
                                    <div class="recipe-meta">
                                        <div class="meta-item">
                                            <div class="meta-label">Preparo</div>
                                            <div class="meta-value">${meal.prep_time}</div>
                                        </div>
                                        <div class="meta-item">
                                            <div class="meta-label">Cozimento</div>
                                            <div class="meta-value">${meal.cook_time}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="nutrition-grid">
                                        <div class="nutrition-item">
                                            <div class="nutrition-value">${meal.protein}g</div>
                                            <div class="nutrition-label">Proteínas</div>
                                        </div>
                                        <div class="nutrition-item">
                                            <div class="nutrition-value">${meal.carbs}g</div>
                                            <div class="nutrition-label">Carboidratos</div>
                                        </div>
                                        <div class="nutrition-item">
                                            <div class="nutrition-value">${meal.fat}g</div>
                                            <div class="nutrition-label">Gorduras</div>
                                        </div>
                                        <div class="nutrition-item">
                                            <div class="nutrition-value">${meal.fiber}g</div>
                                            <div class="nutrition-label">Fibras</div>
                                        </div>
                                    </div>
                                    
                                    <div class="ingredients-section">
                                        <div class="section-title">Ingredientes</div>
                                        <div class="ingredients-list">
                                            ${meal.ingredients}
                                        </div>
                                    </div>
                                    
                                    <div class="instructions-section">
                                        <div class="section-title">Modo de Preparo</div>
                                        <div class="instructions-text">
                                            ${meal.instructions}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <h3>Sofia Nutricional</h3>
                <p>Instituto dos Sonhos - Documento educativo • Consulte sempre um nutricionista</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
}

export function openDetailedMealPlanHTML(plan: DetailedMealPlanForHTML) {
  try {
    const html = generateDetailedMealPlanHTML(plan);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      // Fallback: abrir em nova aba
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();
    }
  } catch (error) {
    console.error('Erro ao abrir HTML detalhado:', error);
    // Fallback: mostrar erro
    alert('Erro ao abrir cardápio detalhado. Tente novamente.');
  }
}

export function downloadDetailedMealPlanHTML(plan: DetailedMealPlanForHTML) {
  const html = generateDetailedMealPlanHTML(plan);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cardapio_detalhado_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Função para converter dados do formato atual para formato detalhado
export function convertMealieToDetailedFormat(mealPlan: any[]): DetailedMealPlanForHTML {
  const days = mealPlan.map((dayData: any) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = dayNames[dayData.day - 1] || `Dia ${dayData.day}`;
    
    // Se o formato já for do Mealie (com meals array), usar diretamente
    if (Array.isArray(dayData.meals)) {
      return {
        day: dayData.day,
        dayName,
        meals: dayData.meals.map((meal: any) => ({
          meal_type: meal.meal_type,
          recipe_name: meal.recipe_name,
          recipe_description: meal.recipe_description,
          prep_time: meal.prep_time,
          cook_time: meal.cook_time,
          total_time: meal.total_time,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          tags: meal.tags,
          difficulty: meal.difficulty,
          servings: meal.servings,
          recipe_id: meal.recipe_id
        })),
        dailyTotals: dayData.daily_totals || {
          calories: dayData.meals.reduce((sum: number, meal: any) => sum + meal.calories, 0),
          protein: dayData.meals.reduce((sum: number, meal: any) => sum + meal.protein, 0),
          carbs: dayData.meals.reduce((sum: number, meal: any) => sum + meal.carbs, 0),
          fat: dayData.meals.reduce((sum: number, meal: any) => sum + meal.fat, 0),
          fiber: dayData.meals.reduce((sum: number, meal: any) => sum + meal.fiber, 0)
        }
      };
    }
    
    // Converter refeições do formato antigo para formato detalhado
    const meals = [];
    
    if (dayData.meals.breakfast) {
      meals.push({
        meal_type: 'Café da Manhã',
        recipe_name: dayData.meals.breakfast.title,
        recipe_description: '',
        prep_time: '15 minutos',
        cook_time: '10 minutos',
        total_time: '25 minutos',
        calories: dayData.meals.breakfast.macros.calories,
        protein: dayData.meals.breakfast.macros.protein,
        carbs: dayData.meals.breakfast.macros.carbs,
        fat: dayData.meals.breakfast.macros.fat,
        fiber: dayData.meals.breakfast.macros.fiber || 0,
        ingredients: dayData.meals.breakfast.ingredients.join(', '),
        instructions: dayData.meals.breakfast.description,
        tags: '',
        difficulty: 'Médio',
        servings: '1 porção',
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.lunch) {
      meals.push({
        meal_type: 'Almoço',
        recipe_name: dayData.meals.lunch.title,
        recipe_description: '',
        prep_time: '20 minutos',
        cook_time: '30 minutos',
        total_time: '50 minutos',
        calories: dayData.meals.lunch.macros.calories,
        protein: dayData.meals.lunch.macros.protein,
        carbs: dayData.meals.lunch.macros.carbs,
        fat: dayData.meals.lunch.macros.fat,
        fiber: dayData.meals.lunch.macros.fiber || 0,
        ingredients: dayData.meals.lunch.ingredients.join(', '),
        instructions: dayData.meals.lunch.description,
        tags: '',
        difficulty: 'Médio',
        servings: '1 porção',
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.snack) {
      meals.push({
        meal_type: 'Lanche',
        recipe_name: dayData.meals.snack.title,
        recipe_description: '',
        prep_time: '10 minutos',
        cook_time: '5 minutos',
        total_time: '15 minutos',
        calories: dayData.meals.snack.macros.calories,
        protein: dayData.meals.snack.macros.protein,
        carbs: dayData.meals.snack.macros.carbs,
        fat: dayData.meals.snack.macros.fat,
        fiber: dayData.meals.snack.macros.fiber || 0,
        ingredients: dayData.meals.snack.ingredients.join(', '),
        instructions: dayData.meals.snack.description,
        tags: '',
        difficulty: 'Fácil',
        servings: '1 porção',
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.dinner) {
      meals.push({
        meal_type: 'Jantar',
        recipe_name: dayData.meals.dinner.title,
        recipe_description: '',
        prep_time: '15 minutos',
        cook_time: '25 minutos',
        total_time: '40 minutos',
        calories: dayData.meals.dinner.macros.calories,
        protein: dayData.meals.dinner.macros.protein,
        carbs: dayData.meals.dinner.macros.carbs,
        fat: dayData.meals.dinner.macros.fat,
        fiber: dayData.meals.dinner.macros.fiber || 0,
        ingredients: dayData.meals.dinner.ingredients.join(', '),
        instructions: dayData.meals.dinner.description,
        tags: '',
        difficulty: 'Médio',
        servings: '1 porção',
        recipe_id: 'taco-recipe'
      });
    }
    
    if (dayData.meals.supper) {
      meals.push({
        meal_type: 'Ceia',
        recipe_name: dayData.meals.supper.title,
        recipe_description: '',
        prep_time: '5 minutos',
        cook_time: '0 minutos',
        total_time: '5 minutos',
        calories: dayData.meals.supper.macros.calories,
        protein: dayData.meals.supper.macros.protein,
        carbs: dayData.meals.supper.macros.carbs,
        fat: dayData.meals.supper.macros.fat,
        fiber: dayData.meals.supper.macros.fiber || 0,
        ingredients: dayData.meals.supper.ingredients.join(', '),
        instructions: dayData.meals.supper.description,
        tags: '',
        difficulty: 'Fácil',
        servings: '1 porção',
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
    dateLabel: `Cardápio ${mealPlan.length} dias - ${new Date().toLocaleDateString('pt-BR')}`,
    guaranteed: true,
    days
  };
}
