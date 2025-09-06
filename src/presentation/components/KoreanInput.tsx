'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TypingSessionEntity } from '@/domain/entities/TypingSession';
import { TypingStats } from '@/domain/valueObjects/TypingStats';

interface KoreanInputProps {
  text: string;
  mode: 'sentence' | 'words';
  onStatsUpdate?: (stats: TypingStats) => void;
  onInputChange?: (input: string) => void;
  onComplete?: () => void;
}

export function KoreanInput({ text, mode, onStatsUpdate, onInputChange, onComplete }: KoreanInputProps) {
  const [userInput, setUserInput] = useState('');
  const [session, setSession] = useState<TypingSessionEntity | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSession = new TypingSessionEntity(
      `session_${Date.now()}`,
      text,
      mode
    );
    setSession(newSession);
    setUserInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [text, mode]);

  const updateStats = useCallback((input: string) => {
    if (!session) return;

    // 첫 입력 시 세션 시작
    if (!session.isStarted && input.length > 0) {
      session.start();
    }

    session.updateInput(input);
    const stats = TypingStats.calculate(
      text,
      input,
      session.getDuration()
    );

    if (onStatsUpdate) {
      onStatsUpdate(stats);
    }
    
    if (onInputChange) {
      onInputChange(input);
    }

    if (stats.isComplete(text)) {
      session.complete();
      if (onComplete) {
        onComplete();
      }
    }
  }, [session, text, onStatsUpdate, onInputChange, onComplete]);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    setUserInput(input);
    
    if (!isComposing) {
      updateStats(input);
    }
  }, [isComposing, updateStats]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const input = e.currentTarget.value;
    setUserInput(input);
    updateStats(input);
  }, [updateStats]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스 처리
    if (e.key === 'Backspace' && !isComposing) {
      setTimeout(() => {
        const input = inputRef.current?.value || '';
        setUserInput(input);
        updateStats(input);
      }, 0);
    }
  }, [isComposing, updateStats]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={userInput}
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
      placeholder="여기에 타이핑하세요..."
      autoFocus
    />
  );
}