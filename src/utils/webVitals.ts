import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

export function reportWebVitals() {
  const handleMetric = (metric: any) => {
    const color = metric.rating === 'good' ? 'green' : 
                  metric.rating === 'needs-improvement' ? 'orange' : 'red';
    
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}ms`,
      `color: ${color}; font-weight: bold;`
    );
  };

  onCLS(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

const vitalsThresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = vitalsThresholds[name as keyof typeof vitalsThresholds];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: VitalMetric) {
  // Log no console em desenvolvimento
  if (import.meta.env.DEV) {
    const color = metric.rating === 'good' ? 'green' : 
                  metric.rating === 'needs-improvement' ? 'orange' : 'red';
    
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

export function reportWebVitals() {
  const handleMetric = (metric: any) => {
    const vitalMetric: VitalMetric = {
      name: metric.name,
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      delta: metric.delta
    };
    sendToAnalytics(vitalMetric);
  };

  onCLS(handleMetric);
  onFID(handleMetric);  
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

// Função para monitorar performance em tempo real
export function monitorPerformance() {
  // Observer para Long Tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('[Long Task]', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task observer not supported
    }
  }
  
  // Monitor memory usage (Chrome only)
  if ((performance as any).memory) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMemoryMB = Math.round(memory.totalJSHeapSize / 1048576);
      
      if (usedMemoryMB > totalMemoryMB * 0.9) {
        console.warn(`[Memory Warning] Using ${usedMemoryMB}MB of ${totalMemoryMB}MB`);
      }
    }, 10000);
  }
}