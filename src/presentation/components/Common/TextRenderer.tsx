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

interface CharacterProps {
  char: string;
  index: number;
  userChar?: string;
  isCurrent: boolean;
  isTyped: boolean;
  isError: boolean;
  isComposing: boolean;
  composingChar?: string;
  language: 'ko' | 'en';
  showSpaces: boolean;
}

const Character = memo(({ 
  char, 
  index, 
  userChar, 
  isCurrent, 
  isTyped, 
  isError, 
  isComposing,
  composingChar,
  language,
  showSpaces 
}: CharacterProps) => {
  const displayChar = useMemo(() => {
    // 타이핑된 글자 표시
    if (isTyped && userChar !== undefined) {
      return userChar;
    }
    // 공백 표시
    if (char === ' ' && showSpaces && !isTyped) {
      return '␣';
    }
    // 기본 글자 표시 (원본 유지)
    return char;
  }, [char, isTyped, userChar, showSpaces]);

  const className = useMemo(() => {
    const baseClass = 'relative inline-block transition-all duration-200';
    const spacingClass = language === 'ko' ? 'tracking-wider' : 'tracking-normal';
    
    let stateClass = '';
    if (isTyped) {
      if (isError) {
        stateClass = 'text-white bg-red-500 rounded px-0.5 animate-shake';
      } else {
        stateClass = 'text-gray-400 dark:text-gray-500';
      }
    } else if (isCurrent) {
      // 현재 위치 - 조합 중일 때는 원본 글자를 매우 흐리게
      if (isComposing) {
        stateClass = 'text-gray-200 dark:text-gray-800 opacity-30';
      } else {
        stateClass = 'text-gray-900 dark:text-gray-100';
      }
    } else {
      stateClass = 'text-gray-700 dark:text-gray-300';
    }

    return `${baseClass} ${spacingClass} ${stateClass}`;
  }, [language, isTyped, isError, isCurrent, isComposing]);

  return (
    <span className={className} style={{ letterSpacing: language === 'ko' ? '0.1em' : '0.05em' }}>
      {displayChar}
      
      {/* 현재 위치에서 조합 중인 글자를 원본 위에 오버레이 */}
      {isCurrent && isComposing && composingChar && (
        <span className="absolute left-0 top-0 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950 px-0.5 rounded-sm">
          {composingChar}
        </span>
      )}
      
      {/* 언더바 스타일 커서 */}
      {isCurrent && (
        <motion.span
          className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500"
          animate={{ opacity: [1, 0.3] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </span>
  );
});

Character.displayName = 'Character';

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
  const characters = useMemo(() => {
    return text.split('').map((char, index) => {
      const isTyped = index < currentIndex;
      const isCurrent = index === currentIndex;
      const userChar = userInput[index];
      const isError = isTyped && userChar !== char;

      return {
        char,
        index,
        userChar,
        isCurrent: isCurrent && highlightCurrent,
        isTyped,
        isError,
        isComposing: isCurrent && isComposing,
        composingChar: isCurrent ? composingChar : undefined,
        language,
        showSpaces
      };
    });
  }, [text, userInput, currentIndex, isComposing, composingChar, language, highlightCurrent, showSpaces]);

  const words = useMemo(() => {
    const result: { char: string; props: CharacterProps }[][] = [];
    let currentWord: { char: string; props: CharacterProps }[] = [];

    characters.forEach((charProps) => {
      if (charProps.char === ' ') {
        if (currentWord.length > 0) {
          result.push(currentWord);
          currentWord = [];
        }
        result.push([{ char: ' ', props: charProps }]);
      } else {
        currentWord.push({ char: charProps.char, props: charProps });
      }
    });

    if (currentWord.length > 0) {
      result.push(currentWord);
    }

    return result;
  }, [characters]);

  const renderText = () => {
    const elements = [];
    
    // 타이핑된 글자들 렌더링
    for (let i = 0; i < currentIndex; i++) {
      const char = text[i];
      const userChar = userInput[i];
      const isError = userChar !== char;
      
      let displayChar = userChar || char;
      let className = 'inline-block transition-all duration-200';
      
      if (isError) {
        className += ' text-white bg-red-500 rounded px-0.5 animate-shake';
      } else {
        className += ' text-gray-400 dark:text-gray-500 opacity-60';
      }
      
      // 공백 처리
      if (char === ' ' && showSpaces) {
        displayChar = '␣';
        className += ' bg-gray-100 dark:bg-gray-700 rounded px-1';
      }
      
      elements.push(
        <span 
          key={i}
          className={className}
          style={{ letterSpacing: language === 'ko' ? '0.1em' : '0.05em' }}
        >
          {displayChar}
        </span>
      );
    }
    
    // 현재 위치 표시: 원본 텍스트를 명확히 표시하고 조합 중인 글자를 오버레이
    if (currentIndex < text.length) {
      const currentChar = text[currentIndex];
      let displayChar = currentChar;
      
      // 공백 처리
      if (currentChar === ' ' && showSpaces) {
        displayChar = '␣';
      }
      
      elements.push(
        <span 
          key={`current-${currentIndex}`}
          className="relative inline-block transition-all duration-200"
          style={{ letterSpacing: language === 'ko' ? '0.1em' : '0.05em' }}
        >
          {/* 원본 글자 - 조합 중일 때는 배경 강조 */}
          <span className={`${isComposing 
            ? 'text-gray-800 dark:text-gray-200 bg-yellow-100 dark:bg-yellow-900/30 rounded px-1' 
            : 'text-gray-900 dark:text-gray-100'
          }`}>
            {displayChar}
          </span>
          
          {/* 커서 */}
          <motion.span
            className={`absolute left-0 -bottom-1 w-full h-0.5 ${
              isComposing ? 'bg-blue-500' : 'bg-gray-500'
            }`}
            animate={{ opacity: [1, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          />
        </span>
      );
    }
    
    // 나머지 원본 텍스트 렌더링 (다음 위치부터)
    for (let i = currentIndex + 1; i < text.length; i++) {
      const char = text[i];
      
      let displayChar = char;
      const className = 'inline-block transition-all duration-200 text-gray-500 dark:text-gray-400';
      
      // 공백 처리
      if (char === ' ' && showSpaces) {
        displayChar = '␣';
      }
      
      elements.push(
        <span 
          key={i}
          className={className}
          style={{ letterSpacing: language === 'ko' ? '0.1em' : '0.05em' }}
        >
          {displayChar}
        </span>
      );
    }
    
    return elements;
  };

  return (
    <div className="space-y-3">
      <div className="relative text-xl md:text-2xl leading-relaxed font-mono select-none">
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
        
        {renderText()}
        
        {/* 조합 중인 글자를 별도 위치에 고정 표시 */}
        {isComposing && composingChar && (
          <div className="absolute -top-12 left-0 flex items-center space-x-2">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium">
              조합 중: {composingChar}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              → {text[currentIndex] || ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TextRenderer);