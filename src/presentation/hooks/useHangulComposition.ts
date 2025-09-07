'use client';

import { useState, useCallback, useRef } from 'react';

interface UseHangulCompositionResult {
  isComposing: boolean;
  composingChar: string;
  handleCompositionStart: () => void;
  handleCompositionUpdate: (e: React.CompositionEvent) => void;
  handleCompositionEnd: (e: React.CompositionEvent, onComplete?: (data: string) => void) => void;
  resetComposition: () => void;
}

/**
 * 한글 IME 조합 상태를 관리하는 커스텀 훅
 * 모든 타이핑 컴포넌트에서 일관된 한글 입력 경험 제공
 */
export function useHangulComposition(): UseHangulCompositionResult {
  const [isComposing, setIsComposing] = useState(false);
  const [composingChar, setComposingChar] = useState('');
  const compositionRef = useRef<string>('');

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionUpdate = useCallback((e: React.CompositionEvent) => {
    const data = e.data || '';
    compositionRef.current = data;
    setComposingChar(data);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent, onComplete?: (data: string) => void) => {
    const finalData = e.data || compositionRef.current;
    setIsComposing(false);
    setComposingChar('');
    compositionRef.current = '';
    
    // 조합 완료된 글자를 콜백으로 전달
    if (onComplete && finalData) {
      onComplete(finalData);
    }
  }, []);

  const resetComposition = useCallback(() => {
    setIsComposing(false);
    setComposingChar('');
    compositionRef.current = '';
  }, []);

  return {
    isComposing,
    composingChar,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
    resetComposition
  };
}