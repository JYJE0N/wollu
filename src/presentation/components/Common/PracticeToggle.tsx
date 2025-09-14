'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap } from 'lucide-react';

interface PracticeToggleProps {
  practiceMode: 'sentence' | 'words';
  onToggle: (mode: 'sentence' | 'words') => void;
  currentLanguage: 'ko' | 'en';
  disabled?: boolean;
}

export const PracticeToggle = memo<PracticeToggleProps>(({
  practiceMode,
  onToggle,
  currentLanguage,
  disabled = false,
}) => {
  const isSentence = practiceMode === 'sentence';

  // 레이블과 아이콘을 메모이제이션
  const labels = useMemo(() => ({
    sentence: currentLanguage === 'ko' ? '문장' : 'Sent',
    words: currentLanguage === 'ko' ? '단어' : 'Word'
  }), [currentLanguage]);

  // 토글 크기 계산 (더 컴팩트하게)
  const toggleWidth = 100;
  const toggleHeight = 36;
  const knobSize = 28;
  const knobOffset = 4;
  const knobTravel = toggleWidth - knobSize - (knobOffset * 2);

  return (
    <button
      onClick={() => onToggle(isSentence ? 'words' : 'sentence')}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm ${
        isSentence ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
      style={{ width: `${toggleWidth}px`, height: `${toggleHeight}px` }}
      role="switch"
      aria-checked={isSentence}
      aria-label={`Switch to ${isSentence ? labels.words : labels.sentence} practice`}
    >
      {/* 왼쪽 레이블 (문장) */}
      <span
        className="absolute left-2 text-[10px] font-bold text-white pointer-events-none select-none transition-opacity duration-200 flex items-center space-x-0.5"
        style={{ opacity: isSentence ? 1 : 0.5 }}
      >
        <BookOpen className="w-2.5 h-2.5" />
        <span className="whitespace-nowrap">{labels.sentence}</span>
      </span>

      {/* 오른쪽 레이블 (단어) */}
      <span
        className="absolute right-2 text-[10px] font-bold text-white pointer-events-none select-none transition-opacity duration-200 flex items-center space-x-0.5"
        style={{ opacity: !isSentence ? 1 : 0.5 }}
      >
        <Zap className="w-2.5 h-2.5" />
        <span className="whitespace-nowrap">{labels.words}</span>
      </span>

      {/* 슬라이딩 노브 */}
      <motion.div
        className="absolute rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600"
        style={{
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          top: `${knobOffset}px`
        }}
        animate={{
          x: isSentence ? knobOffset : knobOffset + knobTravel,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isSentence ? (
          <BookOpen className="w-3.5 h-3.5" />
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
      </motion.div>
    </button>
  );
});

PracticeToggle.displayName = 'PracticeToggle';