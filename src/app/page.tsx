'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import TypingDisplay from '@/components/practice/TypingDisplay';
import TypingInput from '@/components/practice/TypingInput';
import StatsPanel from '@/components/practice/StatsPanel';
import { useTypingStore } from '@/stores/useTypingStore';

export default function HomePage() {
  const initializeTyping = useTypingStore((state) => state.initialize);

  useEffect(() => {
    initializeTyping();
  }, [initializeTyping]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 텍스트 표시 영역 */}
          <TypingDisplay />
          
          {/* 입력 필드 */}
          <TypingInput />
          
          {/* 통계 패널 */}
          <StatsPanel />
        </div>
      </div>
    </main>
  );
}