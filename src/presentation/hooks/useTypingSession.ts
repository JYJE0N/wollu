import { useState, useEffect, useCallback } from 'react';
import { TypingSessionEntity } from '@/domain/entities/TypingSession';
import { TypingStats } from '@/domain/valueObjects/TypingStats';
import { getTypingSessionService } from '@/infrastructure/di/DIContainer';

export function useTypingSession() {
  const [session, setSession] = useState<TypingSessionEntity | null>(null);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const typingService = getTypingSessionService();

  useEffect(() => {
    const currentSession = typingService.getCurrentSession();
    if (currentSession) {
      setSession(currentSession);
    }
  }, []);

  const startNewSession = useCallback((mode: 'sentence' | 'words', difficulty?: 'easy' | 'medium' | 'hard') => {
    setIsLoading(true);
    try {
      const newSession = typingService.startNewSession(mode, difficulty);
      setSession(newSession);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [typingService]);

  const updateInput = useCallback((input: string) => {
    if (!session) return;
    
    const newStats = typingService.updateInput(input);
    if (newStats) {
      setStats(newStats);
      
      if (newStats.isComplete(session.text)) {
        typingService.saveSessionToHistory();
      }
    }
  }, [session, typingService]);

  const resetSession = useCallback(() => {
    if (session) {
      // 같은 텍스트로 새 세션 생성
      const newSession = new TypingSessionEntity(
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session.text,
        session.mode
      );
      setSession(newSession);
      setStats(null);
    }
  }, [session]);

  return {
    session,
    stats,
    isLoading,
    startNewSession,
    updateInput,
    resetSession
  };
}