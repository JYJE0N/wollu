"use client";

import { useMemo } from 'react';

interface TypingPreviewProps {
  targetText: string;
  currentIndex: number;
  userInput: string;
  isActive: boolean;
  className?: string;
}

/**
 * 현재 작성중인 글자 미리보기 패널
 * 다음에 타이핑할 글자들을 미리 보여주는 컴포넌트
 */
export function TypingPreview({
  targetText,
  currentIndex,
  isActive,
  className = "",
}: Omit<TypingPreviewProps, 'userInput'>) {
  // 미리보기 텍스트 생성 (현재 위치부터 다음 20글자 정도)
  const previewText = useMemo(() => {
    if (!targetText || currentIndex < 0) return '';
    
    // 현재 위치부터 다음 30글자까지 미리보기
    const startIndex = Math.max(0, currentIndex);
    const previewLength = 30;
    const preview = targetText.slice(startIndex, startIndex + previewLength);
    
    // 마지막이 단어 중간에서 끝나면 단어 경계까지 확장
    const lastSpaceIndex = preview.lastIndexOf(' ');
    if (lastSpaceIndex > 15 && preview.length === previewLength) {
      return preview.slice(0, lastSpaceIndex + 1);
    }
    
    return preview;
  }, [targetText, currentIndex]);

  // 현재 타이핑할 글자 (하이라이트)
  const currentChar = useMemo(() => {
    if (!targetText || currentIndex < 0 || currentIndex >= targetText.length) {
      return '';
    }
    return targetText[currentIndex];
  }, [targetText, currentIndex]);

  if (!isActive || !previewText) {
    return null;
  }

  return (
    <div 
      className={`typing-preview-panel ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* 패널 제목 */}
      <div 
        className="panel-header mb-3 text-sm font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        다음 입력할 텍스트
      </div>

      {/* 미리보기 텍스트 */}
      <div 
        className="preview-content text-lg font-korean typing-text-standardized"
      >
        {/* 현재 타이핑할 글자 (하이라이트) */}
        {currentChar && (
          <span
            className="current-char inline-block px-1 py-0.5 rounded mr-1"
            style={{
              backgroundColor: 'var(--color-interactive-secondary)',
              color: 'var(--color-text-on-primary)',
              fontWeight: '600',
              transform: 'scale(1.1)',
              display: 'inline-block',
            }}
          >
            {currentChar === ' ' ? '␣' : currentChar}
          </span>
        )}
        
        {/* 다음에 올 텍스트 */}
        <span 
          style={{ 
            color: 'var(--color-text-secondary)',
            opacity: 0.8 
          }}
        >
          {previewText.slice(1)}
        </span>
      </div>

      {/* 진행률 정보 */}
      <div 
        className="progress-info mt-3 flex justify-between text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <span>
          진행: {currentIndex} / {targetText.length} 글자
        </span>
        <span>
          {((currentIndex / targetText.length) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}