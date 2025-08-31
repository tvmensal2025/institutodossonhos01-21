// Sistema de Testes Automatizados para Cardápios
// Testa validação, geração, erros e integridade

import { MealPlanValidator, createDefaultValidator } from './meal-plan-validator';
import { MealPlanErrorHandler, ErrorType } from './meal-plan-error-handler';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  results: TestResult[];
  summary: {
    validationTests: number;
    errorHandlingTests: number;
    integrationTests: number;
    performanceTests: number;
  };
}

export class MealPlanTestSuite {
  private validator: MealPlanValidator;
  private errorHandler: MealPlanErrorHandler;

  constructor() {
    this.validator = createDefaultValidator(2000);
    this.errorHandler = new MealPlanErrorHandler();
  }

  // Executa todos os testes
  async runAllTests(supabase?: any): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    console.log('🧪 INICIANDO SUITE DE TESTES AUTOMATIZADOS');
    console.log('==========================================');

    // Testes de validação
    results.push(...await this.runValidationTests());
    
    // Testes de tratamento de erros
    results.push(...await this.runErrorHandlingTests());
    
    // Testes de integração (se supabase fornecido)
    if (supabase) {
      results.push(...await this.runIntegrationTests(supabase));
    }
    
    // Testes de performance
    results.push(...await this.runPerformanceTests());

    const totalDuration = Date.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;

    const summary = {
      validationTests: results.filter(r => r.testName.includes('Validation')).length,
      errorHandlingTests: results.filter(r => r.testName.includes('Error')).length,
      integrationTests: results.filter(r => r.testName.includes('Integration')).length,
      performanceTests: results.filter(r => r.testName.includes('Performance')).length
    };

    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log(`✅ Testes aprovados: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    console.log(`⏱️ Tempo total: ${totalDuration}ms`);
    console.log(`📈 Taxa de sucesso: ${((passedTests / results.length) * 100).toFixed(1)}%`);

    return {
      totalTests: results.length,
      passedTests,
      failedTests,
      totalDuration,
      results,
      summary
    };
  }

  // Testes de validação
  private async runValidationTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Teste 1: Validação de estrutura válida
    results.push(await this.runTest('Validation-Structure-Valid', async () => {
      const validMealPlan = this.createValidMealPlan();
      const result = this.validator.validateMealPlan(validMealPlan);
      return result.isValid;
    }));

    // Teste 2: Validação de estrutura inválida
    results.push(await this.runTest('Validation-Structure-Invalid', async () => {
      const invalidMealPlan = null;
      const result = this.validator.validateMealPlan(invalidMealPlan);
      return !result.isValid;
    }));

    // Teste 3: Validação de ordem das refeições
    results.push(await this.runTest('Validation-Meal-Order', async () => {
      const mealPlan = this.createValidMealPlan();
      const result = this.validator.validateMealPlan(mealPlan);
      return result.details.mealOrder;
    }));

    // Teste 4: Validação de dados nutricionais
    results.push(await this.runTest('Validation-Nutrition-Data', async () => {
      const mealPlan = this.createValidMealPlan();
      const result = this.validator.validateMealPlan(mealPlan);
      return result.details.nutritionData;
    }));

    // Teste 5: Validação de precisão calórica
    results.push(await this.runTest('Validation-Calorie-Accuracy', async () => {
      const mealPlan = this.createValidMealPlan();
      const result = this.validator.validateMealPlan(mealPlan);
      return result.details.calorieAccuracy;
    }));

    // Teste 6: Validação de restrições
    results.push(await this.runTest('Validation-Restrictions', async () => {
      const mealPlan = this.createValidMealPlan();
      const validator = new MealPlanValidator({
        requiredMeals: ['café da manhã', 'almoço', 'lanche', 'jantar', 'ceia'],
        targetCalories: 2000,
        calorieTolerance: 10,
        restrictions: ['lactose']
      });
      const result = validator.validateMealPlan(mealPlan);
      return result.details.restrictionsRespected;
    }));

    return results;
  }

  // Testes de tratamento de erros
  private async runErrorHandlingTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Teste 1: Captura de erro de rede
    results.push(await this.runTest('Error-Network-Error', async () => {
      const error = { status: 404, message: 'Not Found' };
      const errorInfo = this.errorHandler.captureError(error);
      return errorInfo.type === ErrorType.NETWORK_ERROR;
    }));

    // Teste 2: Captura de erro de timeout
    results.push(await this.runTest('Error-Timeout-Error', async () => {
      const error = { status: 504, message: 'Gateway Timeout' };
      const errorInfo = this.errorHandler.captureError(error);
      return errorInfo.type === ErrorType.TIMEOUT_ERROR && errorInfo.recoverable;
    }));

    // Teste 3: Captura de erro do Mealie
    results.push(await this.runTest('Error-Mealie-Error', async () => {
      const error = { message: 'mealie integration failed' };
      const errorInfo = this.errorHandler.captureError(error);
      return errorInfo.type === ErrorType.TACO_ERROR && errorInfo.fallbackAvailable;
    }));

    // Teste 4: Recuperação de erro
    results.push(await this.runTest('Error-Recovery', async () => {
      let attemptCount = 0;
      const failingFunction = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return { success: true };
      };

      const result = await this.errorHandler.attemptRecovery(failingFunction);
      return result.success && attemptCount === 3;
    }));

    return results;
  }

  // Testes de integração
  private async runIntegrationTests(supabase: any): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Teste 1: Geração de cardápio com Mealie
    results.push(await this.runTest('Integration-Mealie-Generation', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-meal-plan-taco', {
          body: {
            action: 'generate_sofia_meal_plan',
            dias: 1,
            objetivo: 'perder peso',
            restricoes: [],
            preferencias: [],
            calorias: 2000,
            userId: '00000000-0000-0000-0000-000000000000'
          }
        });

        return !error && data && data.success;
      } catch {
        return false;
      }
    }));

    // Teste 2: Validação de dados retornados
    results.push(await this.runTest('Integration-Data-Validation', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-meal-plan-taco', {
          body: {
            action: 'generate_sofia_meal_plan',
            dias: 1,
            objetivo: 'perder peso',
            restricoes: [],
            preferencias: [],
            calorias: 2000,
            userId: '00000000-0000-0000-0000-000000000000'
          }
        });

        if (error || !data || !data.success) {
          return false;
        }

        const result = this.validator.validateMealPlan(data.mealPlan);
        return result.isValid;
      } catch {
        return false;
      }
    }));

    // Teste 3: Teste de fallback
    results.push(await this.runTest('Integration-Fallback-Test', async () => {
      try {
        const result = await this.errorHandler.generateFallback({
          dias: 1,
          objetivo: 'perder peso',
          calorias: 2000
        }, supabase);

        return result.success;
      } catch {
        return false;
      }
    }));

    return results;
  }

  // Testes de performance
  private async runPerformanceTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Teste 1: Performance de validação
    results.push(await this.runTest('Performance-Validation-Speed', async () => {
      const mealPlan = this.createValidMealPlan();
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        this.validator.validateMealPlan(mealPlan);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;
      
      return avgTime < 10; // Menos de 10ms por validação
    }));

    // Teste 2: Performance de tratamento de erro
    results.push(await this.runTest('Performance-Error-Handling', async () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        this.errorHandler.captureError(new Error(`Test error ${i}`));
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 50;
      
      return avgTime < 5; // Menos de 5ms por captura de erro
    }));

    // Teste 3: Performance de memória
    results.push(await this.runTest('Performance-Memory-Usage', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Criar muitos cardápios
      const mealPlans = [];
      for (let i = 0; i < 1000; i++) {
        mealPlans.push(this.createValidMealPlan());
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Limpar referências
      mealPlans.length = 0;
      
      return memoryIncrease < 50 * 1024 * 1024; // Menos de 50MB de aumento
    }));

    return results;
  }

  // Executa um teste individual
  private async runTest(testName: string, testFunction: () => Promise<boolean>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Executando: ${testName}`);
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      if (result) {
        console.log(`✅ ${testName} - APROVADO (${duration}ms)`);
      } else {
        console.log(`❌ ${testName} - FALHOU (${duration}ms)`);
      }
      
      return {
        testName,
        passed: result,
        duration,
        details: { duration }
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${testName} - ERRO (${duration}ms): ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      return {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Cria um cardápio válido para testes
  private createValidMealPlan(): any {
    return [
      {
        day: 1,
        date: '2025-08-16',
        meals: [
          {
            meal_type: 'café da manhã',
            recipe_name: 'Aveia com banana',
            calories: 400,
            protein: 12,
            carbs: 60,
            fat: 8,
            fiber: 8
          },
          {
            meal_type: 'almoço',
            recipe_name: 'Frango grelhado com arroz',
            calories: 600,
            protein: 45,
            carbs: 70,
            fat: 15,
            fiber: 5
          },
          {
            meal_type: 'lanche',
            recipe_name: 'Iogurte com granola',
            calories: 300,
            protein: 15,
            carbs: 40,
            fat: 10,
            fiber: 3
          },
          {
            meal_type: 'jantar',
            recipe_name: 'Sopa de legumes',
            calories: 400,
            protein: 20,
            carbs: 50,
            fat: 12,
            fiber: 8
          },
          {
            meal_type: 'ceia',
            recipe_name: 'Chá com biscoito',
            calories: 100,
            protein: 3,
            carbs: 15,
            fat: 4,
            fiber: 1
          }
        ]
      }
    ];
  }
}

// Função utilitária para executar testes
export async function runMealPlanTests(supabase?: any): Promise<TestSuiteResult> {
  const testSuite = new MealPlanTestSuite();
  return await testSuite.runAllTests(supabase);
}
