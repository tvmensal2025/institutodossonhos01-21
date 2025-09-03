import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce, throttle } from '@/config/performance';

// Hook para estado com debounce automático
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] => {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  
  const debouncedSetter = useRef(
    debounce((value: T) => {
      setDebouncedValue(value);
    }, delay)
  ).current;
  
  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
    debouncedSetter(value);
  }, [debouncedSetter]);
  
  return [immediateValue, debouncedValue, setValue];
};

// Hook para estado com throttle
export const useThrottledState = <T>(
  initialValue: T,
  delay: number = 100
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(initialValue);
  
  const throttledSetter = useRef(
    throttle((newValue: T) => {
      setValue(newValue);
    }, delay)
  ).current;
  
  return [value, throttledSetter];
};

// Hook para batch de updates
export const useBatchedState = <T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void, () => void] => {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const scheduleUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(current => ({ ...current, ...pendingUpdates.current }));
      pendingUpdates.current = {};
    }, 16); // ~60fps
  }, []);
  
  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    scheduleUpdate();
  }, [scheduleUpdate]);
  
  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (Object.keys(pendingUpdates.current).length > 0) {
      setState(current => ({ ...current, ...pendingUpdates.current }));
      pendingUpdates.current = {};
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, batchUpdate, flushUpdates];
};

// Hook para estado com cache automático
export const useCachedState = <T>(
  key: string,
  initialValue: T,
  ttl: number = 300000 // 5 minutos default
): [T, (value: T) => void, () => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const cached = sessionStorage.getItem(`cached_state_${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        
        if (now - parsed.timestamp < ttl) {
          return parsed.value;
        }
      }
    } catch (error) {
      console.warn('Erro ao recuperar cache:', error);
    }
    
    return initialValue;
  });
  
  const setCachedState = useCallback((value: T) => {
    setState(value);
    
    try {
      sessionStorage.setItem(`cached_state_${key}`, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Erro ao salvar cache:', error);
    }
  }, [key]);
  
  const clearCache = useCallback(() => {
    try {
      sessionStorage.removeItem(`cached_state_${key}`);
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }, [key]);
  
  return [state, setCachedState, clearCache];
};

export default {
  useDebouncedState,
  useThrottledState,
  useBatchedState,
  useCachedState
};