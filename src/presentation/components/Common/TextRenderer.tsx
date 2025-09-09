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
                  ? 'bg-red-100 dark:bg-red-900/30 rounded'
                  : ''
              }`}
            >
              {showSpaces && (
                <span className="opacity-20 text-gray-400 dark:text-gray-600 text-[0.6em] align-middle">·</span>
              )}
            </span>
          );
        }
        
        return (
          <span
            key={index}
            className={`${
              isError 
                ? 'text-red-500 bg-red-100 dark:bg-red-900/50 rounded px-1'
                : 'text-gray-500 dark:text-gray-400'
            }`}
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
              className="relative inline-block w-[0.5em] bg-yellow-100 dark:bg-yellow-900/30 rounded"
            >
              {showSpaces && (
                <span className="opacity-30 text-gray-500 dark:text-gray-500 text-[0.6em] align-middle">·</span>
              )}
              {/* 커서 */}
              <motion.div
                className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500 rounded"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </span>
          );
        }
        
        return (
          <span
            key={index}
            className="relative text-gray-900 dark:text-gray-100 bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded"
          >
            {char}
            
            {/* 커서 */}
            <motion.div
              className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500 rounded"
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
              <span className="opacity-10 text-gray-300 dark:text-gray-700 text-[0.6em] align-middle">·</span>
            )}
          </span>
        );
      }
      
      return (
        <span
          key={index}
          className="text-gray-400 dark:text-gray-500"
        >
          {char}
        </span>
      );
    });
  }, [textChars, currentIndex, userInput, errors, showCursor, showSpaces]);

  return (
    <div className="relative">
      {/* 간단한 한 줄 텍스트 렌더러 - monkeytype 스타일 */}
      <div className="text-2xl md:text-3xl leading-relaxed font-mono select-none p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {renderedChars}
      </div>
      
      {/* 간단한 하단 통계 */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        {currentIndex} / {text.length}
        {errorCount > 0 && (
          <span className="ml-4 text-red-500">
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