'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface TextRendererProps {
  text: string;
  userInput: string;
  currentIndex: number;
  isComposing?: boolean;
  composingChar?: string;
  errors?: Record<number, boolean>;
  language?: 'ko' | 'en';
  showCursor?: boolean;
  highlightCurrent?: boolean;
  showSpaces?: boolean;
}

const TextRenderer: React.FC<TextRendererProps> = ({
  text,
  userInput,
  currentIndex,
  isComposing = false,
  composingChar = '',
  errors = {},
  language = 'ko',
  showCursor = true,
  highlightCurrent = true,
  showSpaces = false
}) => {
  // 텍스트 분할을 메모이제이션하여 불필요한 재계산 방지
  const textChars = useMemo(() => text.split(''), [text]);
  
  // 에러 카운트를 메모이제이션
  const errorCount = useMemo(() => 
    Object.values(errors).filter(Boolean).length,
    [errors]
  );

  // 렌더링되는 문자들을 메모이제이션
  const renderedChars = useMemo(() => {
    return textChars.map((char, index) => {
      const isTyped = index < currentIndex;
      const isCurrent = index === currentIndex;
      const userChar = userInput[index];
      const isError = errors[index] === true;
      const isSpace = char === ' ';
      
      // 타이핑된 글자
      if (isTyped) {
        const displayChar = userChar || char;
        
        if (isSpace) {
          return (
            <span
              key={index}
              className={`inline-block w-[0.5em] ${
                isError 
                  ? 'rounded'
                  : ''
              }`}
              style={{
                backgroundColor: isError ? 'var(--error-light)' : 'transparent'
              }}
            >
              {showSpaces && (
                <span 
                  className="opacity-20 text-[0.6em] align-middle"
                  style={{ color: 'var(--gray-400)' }}
                >
                  ·
                </span>
              )}
            </span>
          );
        }
        
        return (
          <span
            key={index}
            className={`${
              isError 
                ? 'rounded px-1'
                : ''
            }`}
            style={{
              color: isError ? 'var(--typing-incorrect)' : 'var(--gray-500)',
              backgroundColor: isError ? 'var(--error-light)' : 'transparent'
            }}
          >
            {displayChar}
          </span>
        );
      }
      
      // 현재 위치
      if (isCurrent && showCursor) {
        if (isSpace) {
          return (
            <span
              key={index}
              className="relative inline-block w-[0.5em] rounded"
              style={{ backgroundColor: 'var(--warning-light)' }}
            >
              {showSpaces && (
                <span 
                  className="opacity-30 text-[0.6em] align-middle"
                  style={{ color: 'var(--gray-500)' }}
                >
                  ·
                </span>
              )}
              {/* 커서 */}
              <motion.div
                className="absolute left-0 -bottom-1 w-full h-0.5 rounded"
                style={{ backgroundColor: 'var(--typing-current)' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </span>
          );
        }
        
        return (
          <span
            key={index}
            className="relative px-1 rounded"
            style={{ 
              color: 'var(--foreground)',
              backgroundColor: 'var(--warning-light)'
            }}
          >
            {char}
            
            {/* 커서 */}
            <motion.div
              className="absolute left-0 -bottom-1 w-full h-0.5 rounded"
              style={{ backgroundColor: 'var(--typing-current)' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </span>
        );
      }
      
      // 아직 타이핑하지 않은 글자
      if (isSpace) {
        return (
          <span
            key={index}
            className="inline-block w-[0.5em]"
          >
            {showSpaces && (
              <span 
                className="opacity-10 text-[0.6em] align-middle"
                style={{ color: 'var(--gray-300)' }}
              >
                ·
              </span>
            )}
          </span>
        );
      }
      
      return (
        <span
          key={index}
          style={{ color: 'var(--typing-pending)' }}
        >
          {char}
        </span>
      );
    });
  }, [textChars, currentIndex, userInput, errors, showCursor, showSpaces]);

  return (
    <div className="relative">
      {/* 간단한 한 줄 텍스트 렌더러 - monkeytype 스타일 */}
      <div 
        className="text-2xl md:text-3xl leading-relaxed font-mono select-none p-8 rounded-lg"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {renderedChars}
      </div>
      
      {/* 간단한 하단 통계 */}
      <div 
        className="mt-4 text-sm text-center"
        style={{ color: 'var(--gray-600)' }}
      >
        {currentIndex} / {text.length}
        {errorCount > 0 && (
          <span 
            className="ml-4"
            style={{ color: 'var(--typing-incorrect)' }}
          >
            오타 {errorCount}개
          </span>
        )}
      </div>
    </div>
  );
};

// React.memo를 사용하여 props가 변경될 때만 리렌더링
export default memo(TextRenderer, (prevProps, nextProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.userInput === nextProps.userInput &&
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.isComposing === nextProps.isComposing &&
    prevProps.composingChar === nextProps.composingChar &&
    prevProps.showCursor === nextProps.showCursor &&
    prevProps.showSpaces === nextProps.showSpaces &&
    JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors)
  );
});