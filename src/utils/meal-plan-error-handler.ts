// Sistema de Tratamento de Erros Robusto para Cardápios
// Gerencia erros, fallbacks e recuperação automática

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NUTRITION_ERROR = 'NUTRITION_ERROR',
  TACO_ERROR = 'TACO_ERROR',
  GPT_ERROR = 'GPT_ERROR',
  STRUCTURE_ERROR = 'STRUCTURE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface MealPlanError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  fallbackAvailable: boolean;
}

export interface ErrorRecoveryStrategy {
  maxRetries: number;
  retryDelay: number; // ms
  fallbackGenerators: string[];
  timeout: number; // ms
}

export class MealPlanErrorHandler {
  private errorHistory: MealPlanError[] = [];
  private recoveryStrategy: ErrorRecoveryStrategy;

  constructor(strategy?: Partial<ErrorRecoveryStrategy>) {
    this.recoveryStrategy = {
      maxRetries: 3,
      retryDelay: 2000,
      fallbackGenerators: ['mealie-real', 'generate-meal-plan-ultra-safe', 'generate-meal-plan-gpt4'],
      timeout: 30000,
      ...strategy
    };
  }

  // Captura e classifica erros
  captureError(error: any, context?: string): MealPlanError {
    const errorInfo: MealPlanError = {
      type: this.classifyError(error),
      message: this.extractErrorMessage(error),
      details: error,
      timestamp: new Date(),
      recoverable: this.isRecoverable(error),
      fallbackAvailable: this.hasFallback(error)
    };

    this.errorHistory.push(errorInfo);
    console.error(`🍽️ Erro capturado [${errorInfo.type}]:`, errorInfo.message, context);
    
    return errorInfo;
  }

  // Classifica o tipo de erro
  private classifyError(error: any): ErrorType {
    if (error?.status === 504 || error?.message?.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    
    if (error?.status === 500 || error?.message?.includes('mealie')) {
      return ErrorType.TACO_ERROR;
    }
    
    if (error?.message?.includes('gpt') || error?.message?.includes('openai')) {
      return ErrorType.GPT_ERROR;
    }
    
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    if (error?.message?.includes('nutrition') || error?.message?.includes('calories')) {
      return ErrorType.NUTRITION_ERROR;
    }
    
    if (error?.message?.includes('network') || error?.status >= 400) {
      return ErrorType.NETWORK_ERROR;
    }
    
    if (error?.message?.includes('structure') || error?.message?.includes('format')) {
      return ErrorType.STRUCTURE_ERROR;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }

  // Extrai mensagem de erro limpa
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error) {
      return error.error;
    }
    
    return 'Erro desconhecido';
  }

  // Verifica se o erro é recuperável
  private isRecoverable(error: any): boolean {
    const type = this.classifyError(error);
    
    switch (type) {
      case ErrorType.TIMEOUT_ERROR:
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TACO_ERROR:
        return true;
      case ErrorType.VALIDATION_ERROR:
      case ErrorType.STRUCTURE_ERROR:
        return false;
      default:
        return true;
    }
  }

  // Verifica se há fallback disponível
  private hasFallback(error: any): boolean {
    const type = this.classifyError(error);
    
    switch (type) {
      case ErrorType.TACO_ERROR:
      case ErrorType.GPT_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return true;
      default:
        return false;
    }
  }

  // Estratégia de recuperação automática
  async attemptRecovery(
    originalFunction: () => Promise<any>,
    context: string = 'meal-plan-generation'
  ): Promise<{ success: boolean; data?: any; error?: MealPlanError }> {
    
    let lastError: MealPlanError | null = null;
    
    for (let attempt = 1; attempt <= this.recoveryStrategy.maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${this.recoveryStrategy.maxRetries} - ${context}`);
        
        const result = await Promise.race([
          originalFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), this.recoveryStrategy.timeout)
          )
        ]);
        
        if (result) {
          console.log(`✅ Recuperação bem-sucedida na tentativa ${attempt}`);
          return { success: true, data: result };
        }
        
      } catch (error) {
        lastError = this.captureError(error, `${context} - tentativa ${attempt}`);
        
        if (!lastError.recoverable) {
          console.log(`❌ Erro não recuperável: ${lastError.message}`);
          break;
        }
        
        if (attempt < this.recoveryStrategy.maxRetries) {
          console.log(`⏳ Aguardando ${this.recoveryStrategy.retryDelay}ms antes da próxima tentativa...`);
          await this.delay(this.recoveryStrategy.retryDelay);
        }
      }
    }
    
    console.log(`❌ Falha na recuperação após ${this.recoveryStrategy.maxRetries} tentativas`);
    return { success: false, error: lastError! };
  }

  // Gera fallback automático
  async generateFallback(
    params: any,
    supabase: any,
    context: string = 'fallback-generation'
  ): Promise<{ success: boolean; data?: any; error?: MealPlanError }> {
    
    for (const fallbackGenerator of this.recoveryStrategy.fallbackGenerators) {
      try {
        console.log(`🔄 Tentando fallback: ${fallbackGenerator}`);
        
        const { data, error } = await supabase.functions.invoke(fallbackGenerator, {
          body: params
        });
        
        if (error) {
          throw error;
        }
        
        if (data && data.success) {
          console.log(`✅ Fallback bem-sucedido com ${fallbackGenerator}`);
          return { success: true, data };
        }
        
      } catch (error) {
        const errorInfo = this.captureError(error, `${context} - ${fallbackGenerator}`);
        console.log(`⚠️ Fallback ${fallbackGenerator} falhou: ${errorInfo.message}`);
        continue;
      }
    }
    
    const finalError: MealPlanError = {
      type: ErrorType.UNKNOWN_ERROR,
      message: 'Todos os fallbacks falharam',
      timestamp: new Date(),
      recoverable: false,
      fallbackAvailable: false
    };
    
    return { success: false, error: finalError };
  }

  // Validação com tratamento de erro
  async safeValidate(
    mealPlan: any,
    validator: any,
    context: string = 'validation'
  ): Promise<{ isValid: boolean; result?: any; error?: MealPlanError }> {
    
    try {
      const result = validator.validateMealPlan(mealPlan);
      return { isValid: result.isValid, result };
      
    } catch (error) {
      const errorInfo = this.captureError(error, context);
      return { isValid: false, error: errorInfo };
    }
  }

  // Geração segura de cardápio
  async safeGenerateMealPlan(
    generator: () => Promise<any>,
    validator: any,
    params: any,
    supabase: any,
    context: string = 'meal-plan-generation'
  ): Promise<{ success: boolean; data?: any; error?: MealPlanError; validation?: any }> {
    
    // Tentativa principal
    const recovery = await this.attemptRecovery(generator, context);
    
    if (recovery.success) {
      // Verificar se são dados do sistema TACO
      const tacoData = recovery.data?.cardapio || recovery.data?.mealPlan;
      const hasTacoData = recovery.data?.source === 'taco' || 
                         recovery.data?.metadata?.nutrition_source === 'taco';
      
      if (hasTacoData) {
        console.log('✅ Dados TACO detectados - aceitando sem validação rigorosa!');
        return { success: true, data: recovery.data };
      }
      
      // Validar resultado
      const validation = await this.safeValidate(recovery.data, validator, 'post-generation');
      
      if (validation.isValid) {
        return { success: true, data: recovery.data, validation: validation.result };
      } else {
        console.log('⚠️ Cardápio gerado mas falhou na validação, tentando fallback...');
      }
    }
    
    // Fallback se necessário
    const fallback = await this.generateFallback(params, supabase, 'fallback-generation');
    
    if (fallback.success) {
      const validation = await this.safeValidate(fallback.data, validator, 'fallback-validation');
      return { success: true, data: fallback.data, validation: validation.result };
    }
    
    return { success: false, error: fallback.error! };
  }

  // Utilitário de delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Relatório de erros
  getErrorReport(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    recentErrors: MealPlanError[];
    recoveryRate: number;
  } {
    const errorsByType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<ErrorType, number>);
    
    this.errorHistory.forEach(error => {
      errorsByType[error.type]++;
    });
    
    const recentErrors = this.errorHistory
      .filter(error => 
        Date.now() - error.timestamp.getTime() < 24 * 60 * 60 * 1000 // Últimas 24h
      )
      .slice(-10); // Últimos 10 erros
    
    const recoverableErrors = this.errorHistory.filter(error => error.recoverable).length;
    const recoveryRate = this.errorHistory.length > 0 
      ? (recoverableErrors / this.errorHistory.length) * 100 
      : 100;
    
    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      recentErrors,
      recoveryRate
    };
  }

  // Limpar histórico de erros
  clearErrorHistory(): void {
    this.errorHistory = [];
    console.log('🧹 Histórico de erros limpo');
  }
}

// Instância global do handler
export const mealPlanErrorHandler = new MealPlanErrorHandler();

// Função utilitária para tratamento rápido de erros
export function handleMealPlanError(error: any, context?: string): MealPlanError {
  return mealPlanErrorHandler.captureError(error, context);
}
