import { useState, useRef, useCallback } from 'react';
import { getHangulService } from '@/infrastructure/di/DIContainer';

interface UseHangulIMEOptions {
  onInputChange?: (input: string) => void;
  onCompositionComplete?: (char: string) => void;
}

export function useHangulIME(options: UseHangulIMEOptions = {}) {
  const [isComposing, setIsComposing] = useState(false);
  const [compositionText, setCompositionText] = useState('');
  const [input, setInput] = useState('');
  
  const hangulService = getHangulService();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionUpdate = useCallback((e: React.CompositionEvent) => {
    setCompositionText(e.data || '');
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent) => {
    const inputElement = e.target as HTMLInputElement;
    const newInput = inputElement.value;
    
    setIsComposing(false);
    setCompositionText('');
    setInput(newInput);
    
    if (options.onInputChange) {
      options.onInputChange(newInput);
    }
    
    if (options.onCompositionComplete && e.data) {
      options.onCompositionComplete(e.data);
    }
  }, [options]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    
    // 한글 조합 중이 아닐 때만 콜백 실행 (영문, 숫자, 백스페이스 등)
    if (!isComposing && options.onInputChange) {
      options.onInputChange(newInput);
    }
  }, [isComposing, options]);

  const validateHangul = useCallback((text: string): boolean => {
    return hangulService.isValidHangul(text);
  }, [hangulService]);

  const disassemble = useCallback((text: string): string[] => {
    return hangulService.disassemble(text);
  }, [hangulService]);

  const reset = useCallback(() => {
    setInput('');
    setCompositionText('');
    setIsComposing(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return {
    input,
    isComposing,
    compositionText,
    inputRef,
    handlers: {
      onCompositionStart: handleCompositionStart,
      onCompositionUpdate: handleCompositionUpdate,
      onCompositionEnd: handleCompositionEnd,
      onChange: handleChange
    },
    validateHangul,
    disassemble,
    reset
  };
}