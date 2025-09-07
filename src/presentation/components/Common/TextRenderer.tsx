'use client';

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className="relative">
      {/* 간단한 한 줄 텍스트 렌더러 - monkeytype 스타일 */}
      <div className="text-2xl md:text-3xl leading-relaxed font-mono select-none p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {text.split('').map((char, index) => {
          const isTyped = index < currentIndex;
          const isCurrent = index === currentIndex;
          const userChar = userInput[index];
          const isError = isTyped && userChar !== char;
          
          let displayChar = char;
          if (char === ' ') {
            displayChar = showSpaces ? '␣' : char;
          }
          
          // 타이핑된 글자
          if (isTyped) {
            displayChar = userChar || char;
            if (displayChar === ' ') {
              displayChar = showSpaces ? '␣' : displayChar;
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
          if (isCurrent) {
            return (
              <span
                key={index}
                className="relative text-gray-900 dark:text-gray-100 bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded"
              >
                {displayChar}
                
                {/* 조합 중인 글자 표시 */}
                {isComposing && composingChar && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/70 px-2 py-1 rounded shadow-sm">
                    {composingChar}
                  </span>
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
          
          // 아직 타이핑하지 않은 글자
          return (
            <span
              key={index}
              className="text-gray-400 dark:text-gray-500"
            >
              {displayChar}
            </span>
          );
        })}
      </div>
      
      {/* 간단한 하단 통계 */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        {currentIndex} / {text.length}
        {Object.values(errors).filter(Boolean).length > 0 && (
          <span className="ml-4 text-red-500">
            오타 {Object.values(errors).filter(Boolean).length}개
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(TextRenderer);