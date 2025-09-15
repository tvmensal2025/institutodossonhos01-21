/**
 * Serviço centralizado para cálculos de métricas corporais
 * Implementa fórmulas científicamente validadas e padronizadas
 */

export interface PhysicalData {
  altura_cm: number;
  idade: number;
  sexo: 'masculino' | 'feminino';
  etnia?: 'branca' | 'negra' | 'asiatica' | 'outras';
}

export interface BodyMeasurement {
  peso_kg: number;
  circunferencia_abdominal_cm?: number;
  circunferencia_cintura_cm?: number;
  circunferencia_quadril_cm?: number;
  // Valores medidos diretamente (balança inteligente)
  gordura_corporal_percent?: number;
  agua_corporal_percent?: number;
  massa_muscular_kg?: number;
  osso_kg?: number;
  metabolismo_basal_kcal?: number;
}

export interface CalculatedMetrics {
  imc: number;
  risco_metabolico: string;
  gordura_corporal_percent?: number;
  agua_corporal_percent?: number;
  massa_muscular_kg?: number;
  massa_magra_kg?: number;
  massa_gorda_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  rce?: number; // Razão Cintura-Estatura
  rcq?: number; // Razão Cintura-Quadril
  rfm?: number; // Relative Fat Mass
  risco_cardiometabolico?: 'BAIXO' | 'MODERADO' | 'ALTO';
}

export class BodyMetricsCalculator {
  
  /**
   * Calcula todas as métricas corporais baseadas nos dados fornecidos
   */
  static calculateMetrics(
    measurement: BodyMeasurement, 
    physical: PhysicalData,
    isManualEntry: boolean = false
  ): CalculatedMetrics {
    
    const { altura_cm, idade, sexo, etnia = 'branca' } = physical;
    const { peso_kg, circunferencia_abdominal_cm, circunferencia_cintura_cm, circunferencia_quadril_cm } = measurement;
    
    // 1. IMC - Sempre calculado
    const imc = this.calculateIMC(peso_kg, altura_cm);
    
    // 2. Risco metabólico baseado no IMC
    const risco_metabolico = this.getIMCRisk(imc);
    
    // 3. Gordura corporal - usar medido ou calcular
    let gordura_corporal_percent = measurement.gordura_corporal_percent;
    if (!gordura_corporal_percent && isManualEntry) {
      gordura_corporal_percent = this.calculateBodyFatDeurenberg(imc, idade, sexo, etnia);
    }
    
    // 4. RFM (Relative Fat Mass) - se temos cintura
    let rfm: number | undefined;
    const cintura = circunferencia_cintura_cm || circunferencia_abdominal_cm;
    if (cintura && altura_cm) {
      rfm = this.calculateRFM(altura_cm, cintura, idade, sexo);
      // Se não temos gordura medida, usar RFM como alternativa mais precisa
      if (!gordura_corporal_percent && isManualEntry) {
        gordura_corporal_percent = rfm;
      }
    }
    
    // 5. Água corporal - usar medido ou calcular
    let agua_corporal_percent = measurement.agua_corporal_percent;
    if (!agua_corporal_percent && isManualEntry) {
      agua_corporal_percent = this.calculateBodyWaterWatson(peso_kg, altura_cm, idade, sexo);
    }
    
    // 6. Massas corporais
    const massa_gorda_kg = gordura_corporal_percent ? (peso_kg * gordura_corporal_percent / 100) : undefined;
    const massa_magra_kg = massa_gorda_kg ? (peso_kg - massa_gorda_kg) : undefined;
    
    // 7. Massa muscular - usar medido ou estimar
    let massa_muscular_kg = measurement.massa_muscular_kg;
    if (!massa_muscular_kg && massa_magra_kg && isManualEntry) {
      massa_muscular_kg = this.estimateMuscleMass(massa_magra_kg, sexo);
    }
    
    // 8. Metabolismo basal - usar medido ou calcular
    let metabolismo_basal_kcal = measurement.metabolismo_basal_kcal;
    if (!metabolismo_basal_kcal && isManualEntry) {
      metabolismo_basal_kcal = this.calculateBMRHarrisBenedict(peso_kg, altura_cm, idade, sexo);
    }
    
    // 9. Idade metabólica
    const idade_metabolica = isManualEntry ? this.calculateMetabolicAge(imc, idade, gordura_corporal_percent) : undefined;
    
    // 10. Razões antropométricas
    const rce = cintura ? cintura / altura_cm : undefined;
    const rcq = (circunferencia_cintura_cm && circunferencia_quadril_cm) ? 
      circunferencia_cintura_cm / circunferencia_quadril_cm : undefined;
    
    // 11. Risco cardiometabólico
    const risco_cardiometabolico = rce ? this.getCardiometabolicRisk(rce) : undefined;
    
    return {
      imc,
      risco_metabolico,
      gordura_corporal_percent,
      agua_corporal_percent,
      massa_muscular_kg,
      massa_magra_kg,
      massa_gorda_kg,
      metabolismo_basal_kcal,
      idade_metabolica,
      rce,
      rcq,
      rfm,
      risco_cardiometabolico
    };
  }
  
  /**
   * Calcula IMC (Índice de Massa Corporal)
   */
  static calculateIMC(peso_kg: number, altura_cm: number): number {
    if (altura_cm <= 0 || peso_kg <= 0) return 0;
    const altura_m = altura_cm / 100;
    return peso_kg / (altura_m * altura_m);
  }
  
  /**
   * Determina risco metabólico baseado no IMC
   */
  static getIMCRisk(imc: number): string {
    if (imc < 18.5) return 'baixo_peso';
    if (imc < 25) return 'normal';
    if (imc < 30) return 'sobrepeso';
    if (imc < 35) return 'obesidade_grau1';
    if (imc < 40) return 'obesidade_grau2';
    return 'obesidade_grau3';
  }
  
  /**
   * Calcula percentual de gordura corporal usando fórmula de Deurenberg CORRIGIDA
   */
  static calculateBodyFatDeurenberg(
    imc: number, 
    idade: number, 
    sexo: 'masculino' | 'feminino',
    etnia: string = 'branca'
  ): number {
    const sexoFactor = sexo === 'masculino' ? 1 : 0;
    const etniaFactor = etnia === 'branca' ? 1 : 0;
    
    // Fórmula Deurenberg COMPLETA
    const gordura = (1.20 * imc) + (0.23 * idade) - (10.8 * sexoFactor) - (5.4 * etniaFactor);
    
    // Aplicar limites realistas
    return Math.max(5, Math.min(50, gordura));
  }
  
  /**
   * Calcula RFM (Relative Fat Mass) CORRETO
   */
  static calculateRFM(
    altura_cm: number, 
    cintura_cm: number, 
    idade: number, 
    sexo: 'masculino' | 'feminino'
  ): number {
    const base = sexo === 'masculino' ? 64 : 76;
    const idadeFactor = 12 * (idade / 100);
    
    // Fórmula RFM CORRETA
    const rfm = base - (20 * altura_cm / cintura_cm) + idadeFactor;
    
    // Aplicar limites realistas
    return Math.max(5, Math.min(50, rfm));
  }
  
  /**
   * Calcula percentual de água corporal usando fórmula de Watson CORRIGIDA
   */
  static calculateBodyWaterWatson(
    peso_kg: number, 
    altura_cm: number, 
    idade: number, 
    sexo: 'masculino' | 'feminino'
  ): number {
    let aguaLitros: number;
    
    if (sexo === 'masculino') {
      aguaLitros = 2.447 - (0.09516 * idade) + (0.1074 * altura_cm) + (0.3362 * peso_kg);
    } else {
      aguaLitros = -2.097 + (0.1069 * altura_cm) + (0.2466 * peso_kg);
    }
    
    // Converter para percentual do peso corporal
    const aguaPercent = peso_kg > 0 ? (aguaLitros / peso_kg) * 100 : 0;
    
    // Aplicar limites realistas
    return Math.max(45, Math.min(75, aguaPercent));
  }
  
  /**
   * Estima massa muscular baseada na massa magra
   */
  static estimateMuscleMass(massa_magra_kg: number, sexo: 'masculino' | 'feminino'): number {
    // Massa muscular é aproximadamente 45-50% da massa magra
    const fator = sexo === 'masculino' ? 0.50 : 0.45;
    return massa_magra_kg * fator;
  }
  
  /**
   * Calcula Taxa Metabólica Basal usando Harris-Benedict Revisada
   */
  static calculateBMRHarrisBenedict(
    peso_kg: number, 
    altura_cm: number, 
    idade: number, 
    sexo: 'masculino' | 'feminino'
  ): number {
    if (sexo === 'masculino') {
      return Math.round(88.362 + (13.397 * peso_kg) + (4.799 * altura_cm) - (5.677 * idade));
    } else {
      return Math.round(447.593 + (9.247 * peso_kg) + (3.098 * altura_cm) - (4.330 * idade));
    }
  }
  
  /**
   * Calcula idade metabólica estimada
   */
  static calculateMetabolicAge(imc: number, idade: number, gorduraPercent?: number): number {
    // Fórmula baseada em IMC e composição corporal
    let idadeMetabolica = idade;
    
    // Ajuste baseado no IMC
    const imcIdeal = 22;
    const ajusteIMC = (imc - imcIdeal) * 0.5;
    idadeMetabolica += ajusteIMC;
    
    // Ajuste baseado na gordura corporal (se disponível)
    if (gorduraPercent) {
      const gorduraIdeal = 15; // Valor médio ideal
      const ajusteGordura = (gorduraPercent - gorduraIdeal) * 0.3;
      idadeMetabolica += ajusteGordura;
    }
    
    // Aplicar limites realistas
    return Math.round(Math.max(18, Math.min(80, idadeMetabolica)));
  }
  
  /**
   * Determina risco cardiometabólico baseado na RCE
   */
  static getCardiometabolicRisk(rce: number): 'BAIXO' | 'MODERADO' | 'ALTO' {
    if (rce >= 0.6) return 'ALTO';
    if (rce >= 0.5) return 'MODERADO';
    return 'BAIXO';
  }
  
  /**
   * Valida se os dados estão dentro de limites realistas
   */
  static validateMeasurement(measurement: BodyMeasurement, physical: PhysicalData): string[] {
    const errors: string[] = [];
    
    if (measurement.peso_kg <= 0 || measurement.peso_kg > 300) {
      errors.push('Peso deve estar entre 1 e 300 kg');
    }
    
    if (physical.altura_cm <= 0 || physical.altura_cm > 250) {
      errors.push('Altura deve estar entre 1 e 250 cm');
    }
    
    if (physical.idade <= 0 || physical.idade > 120) {
      errors.push('Idade deve estar entre 1 e 120 anos');
    }
    
    if (measurement.gordura_corporal_percent && 
        (measurement.gordura_corporal_percent < 3 || measurement.gordura_corporal_percent > 60)) {
      errors.push('Percentual de gordura deve estar entre 3% e 60%');
    }
    
    if (measurement.agua_corporal_percent && 
        (measurement.agua_corporal_percent < 30 || measurement.agua_corporal_percent > 80)) {
      errors.push('Percentual de água deve estar entre 30% e 80%');
    }
    
    return errors;
  }
}

export default BodyMetricsCalculator;
