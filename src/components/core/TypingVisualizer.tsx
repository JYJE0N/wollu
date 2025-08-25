'use client'

import { useEffect, useState, memo, useCallback, useMemo } from 'react'
import { useTypingStore } from '@/stores/typingStore'

interface TypingVisualizerProps {
  text: string
  currentIndex: number
  className?: string
  windowSize?: number
}

export const TypingVisualizer = memo(function TypingVisualizer({ 
  text, 
  currentIndex, 
  className = '',
  windowSize = 5 // 전체 5칸, 중앙(3번째)에 현재 글자
}: TypingVisualizerProps) {
  const [displayCharsState, setDisplayChars] = useState<string[]>([])
  const [currentPosState, setCurrentPos] = useState(0)
  // const [isTransitioning, setIsTransitioning] = useState(false) // 미사용
  // const [keyPressAnimation, setKeyPressAnimation] = useState(false) // 미사용
  const [comboCount, setComboCount] = useState(0)
  
  const { isComposing, composingText, userInput } = useTypingStore()
  
  // 문자 배치 로직을 메모이제이션으로 최적화
  const { displayChars, currentPos } = useMemo(() => {
    // 현재 타이핑된 텍스트 + 조합 중인 텍스트를 합쳐서 보여줌
    const typedText = userInput
    
    // 현재 글자가 항상 중앙(세 번째 칸)에 오도록 설계
    const centerPosition = Math.floor(windowSize / 2) // 중앙 인덱스 (2)
    const chars: string[] = new Array(windowSize).fill('')
    
    // 현재 입력 위치 기준으로 배치
    const currentTypingIndex = typedText.length
    
    // 중앙에 현재 글자 배치
    if (isComposing && composingText) {
      // 조합 중인 문자의 마지막 글자만 중앙에 표시
      const lastChar = composingText.slice(-1)
      chars[centerPosition] = lastChar
    } else {
      // 다음에 타이핑할 문자를 중앙에
      chars[centerPosition] = text[currentTypingIndex] || ''
    }
    
    // 중앙 이전 칸들에 이미 타이핑한 문자들 배치
    for (let i = 1; i <= centerPosition; i++) {
      const charIndex = currentTypingIndex - i
      if (charIndex >= 0) {
        chars[centerPosition - i] = typedText[charIndex] || ''
      }
    }
    
    // 중앙 이후 칸들에 다음에 타이핑할 문자들 배치
    for (let i = 1; i < windowSize - centerPosition; i++) {
      const charIndex = currentTypingIndex + i
      if (charIndex < text.length) {
        chars[centerPosition + i] = text[charIndex] || ''
      }
    }
    
    return {
      displayChars: chars,
      currentPos: centerPosition
    }
  }, [text, currentIndex, userInput, isComposing, composingText, windowSize])

  // displayChars와 currentPos 상태 업데이트
  useEffect(() => {
    setDisplayChars(displayChars)
    setCurrentPos(currentPos)
  }, [displayChars, currentPos])

  // 키 입력시 화려한 애니메이션 트리거 - setKeyPressAnimation 제거됨으로 주석처리
  // useEffect(() => {
  //   if (isComposing || currentIndex > 0) {
  //     setKeyPressAnimation(true)
  //     setComboCount(prev => prev + 1)
      
  //     // 애니메이션 리셋
  //     setTimeout(() => setKeyPressAnimation(false), 600)
  //   }
  // }, [isComposing, currentIndex])

  // 콤보 카운트 리셋 (2초간 입력 없으면)
  useEffect(() => {
    const timer = setTimeout(() => setComboCount(0), 2000)
    return () => clearTimeout(timer)
  }, [comboCount])

  // 캐릭터 렌더링 최적화
  const renderCharacter = useCallback((char: string, index: number) => {
    // 중앙(currentPos=2)을 기준으로 상태 결정
    const isComposingChar = isComposing && index === currentPos && composingText
    const isCompletedChar = index < currentPos
    const isCurrentChar = !isComposing && index === currentPos
    const isUpcomingChar = index > currentPos
    
    // 빈 칸 체크
    const isEmpty = !char
    
    // 완료된 문자의 정확성 확인
    const isCorrect = true // TODO: 실제 정확성 데이터 연결

    return (
      <div
        key={`${index}-${char}-${currentIndex}-${isComposing}-${Date.now()}`}
        className="relative flex items-center justify-center w-16 h-16 rounded-3xl text-2xl font-korean font-medium backdrop-blur-xl border transition-all duration-700 ease-out"
        style={{
          backgroundColor: isComposingChar
            ? 'var(--color-visualizer-composing-bg)'
            : isCompletedChar && char
              ? isCorrect 
                ? 'var(--color-visualizer-completed-bg)'
                : 'var(--color-feedback-error)'
              : isCurrentChar && char
                ? 'var(--color-visualizer-current-bg)'
              : isUpcomingChar && char
                ? 'var(--color-visualizer-upcoming-bg)'
              : isEmpty
                ? 'transparent'
                : 'var(--color-visualizer-upcoming-bg)',
          color: isComposingChar
            ? 'var(--color-visualizer-composing-text)'
            : isCompletedChar && char
              ? isCorrect 
                ? 'var(--color-visualizer-completed-text)'
                : 'var(--color-text-inverse)'
              : isCurrentChar && char
                ? 'var(--color-visualizer-current-text)'
              : isUpcomingChar && char
                ? 'var(--color-visualizer-upcoming-text)'
              : isEmpty
                ? 'transparent'
                : 'var(--color-visualizer-upcoming-text)',
          borderColor: isComposingChar
            ? 'var(--color-visualizer-composing-bg)'
            : isCompletedChar && char
              ? isCorrect 
                ? 'var(--color-visualizer-completed-bg)'
                : 'var(--color-feedback-error)'
              : isCurrentChar && char
                ? 'var(--color-visualizer-current-bg)'
              : isUpcomingChar && char
                ? 'var(--color-visualizer-upcoming-border)'
              : isEmpty
                ? 'transparent'
                : 'var(--color-visualizer-upcoming-border)',
          boxShadow: isComposingChar
            ? '0 20px 25px -5px var(--color-visualizer-composing-shadow), 0 10px 10px -5px var(--color-visualizer-composing-shadow)'
            : isCompletedChar && char
              ? isCorrect 
                ? '0 10px 15px -3px var(--color-visualizer-completed-shadow)'
                : '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
              : isCurrentChar && char
                ? '0 4px 6px -1px var(--color-visualizer-current-shadow)'
              : 'none',
          opacity: isUpcomingChar && char ? 0.5 : isEmpty ? 0.1 : 1,
          fontWeight: isComposingChar ? '600' : isCompletedChar || isCurrentChar ? '500' : '300',
          transform: `
            translateY(${isComposingChar ? -8 : isCurrentChar ? -4 : isCompletedChar ? -1 : 0}px) 
            scale(${isComposingChar ? 1.15 : isCurrentChar ? 1.05 : isCompletedChar ? 1.02 : isUpcomingChar ? 0.95 : 0.85})
          `,
          zIndex: isComposingChar ? 30 : isCurrentChar ? 20 : isCompletedChar ? 10 : 5,
          filter: isComposingChar ? 'brightness(1.2) saturate(1.2)' : isCurrentChar ? 'brightness(1.1)' : 'none',
          transition: `all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          animationDelay: `${Math.abs(index - currentPos) * 60}ms`
        }}
      >
        {/* Character content */}
        <span className="relative z-10 select-none">
          {char === ' ' ? (
            <span className="opacity-50 text-lg">␣</span>
          ) : (
            char || ''
          )}
        </span>
      </div>
    )
  }, [currentIndex, isComposing, composingText, currentPos])

  if (!text || displayChars.length === 0) {
    return null
  }

  return (
    <div className={`typing-visualizer ${className} relative`}>
      {/* 모바일용 컴팩트 레이아웃 */}
      <div className="md:hidden">
        <div className="relative flex items-center justify-center gap-2 py-4 px-3">
          {displayChars.map((char, index) => (
            <div
              key={`mobile-${index}-${char}-${currentIndex}-${isComposing}`}
              className="relative flex items-center justify-center w-10 h-10 rounded-2xl text-sm font-korean font-medium backdrop-blur-xl border transition-all duration-500 ease-out"
              style={{
                backgroundColor: isComposing && index === currentPos
                  ? 'var(--color-visualizer-composing-bg)'
                  : index < currentPos && char
                    ? 'var(--color-visualizer-completed-bg)'
                    : index === currentPos && char
                      ? 'var(--color-visualizer-current-bg)'
                    : index > currentPos && char
                      ? 'var(--color-visualizer-upcoming-bg)'
                    : 'transparent',
                color: isComposing && index === currentPos
                  ? 'var(--color-visualizer-composing-text)'
                  : index < currentPos && char
                    ? 'var(--color-visualizer-completed-text)'
                    : index === currentPos && char
                      ? 'var(--color-visualizer-current-text)'
                    : index > currentPos && char
                      ? 'var(--color-visualizer-upcoming-text)'
                    : 'transparent',
                borderColor: isComposing && index === currentPos
                  ? 'var(--color-visualizer-composing-bg)'
                  : index < currentPos && char
                    ? 'var(--color-visualizer-completed-bg)'
                    : index === currentPos && char
                      ? 'var(--color-visualizer-current-bg)'
                    : 'var(--color-visualizer-upcoming-border)',
                transform: `
                  translateY(${isComposing && index === currentPos ? -4 : index === currentPos ? -2 : 0}px) 
                  scale(${isComposing && index === currentPos ? 1.1 : index === currentPos ? 1.05 : index < currentPos ? 1.02 : 0.95})
                `,
                opacity: index > currentPos && char ? 0.5 : !char ? 0.1 : 1,
              }}
            >
              <span className="relative z-10 select-none">
                {char === ' ' ? (
                  <span className="opacity-50 text-xs">␣</span>
                ) : (
                  char || ''
                )}
              </span>
            </div>
          ))}
        </div>
        
        {/* 모바일용 상태 표시 - 간소화 */}
        {isComposing && composingText && (
          <div className="flex justify-center">
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full backdrop-blur-xl border text-xs"
              style={{
                backgroundColor: 'var(--color-visualizer-status-bg)',
                borderColor: 'var(--color-visualizer-status-border)',
                color: 'var(--color-visualizer-status-text-active)'
              }}
            >
              조합: 
              <span 
                className="font-mono px-2 py-0.5 rounded-full ml-1 font-medium"
                style={{
                  backgroundColor: 'var(--color-visualizer-composing-bg)',
                  color: 'var(--color-visualizer-composing-text)'
                }}
              >
                {composingText.slice(-1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 데스크톱용 기존 레이아웃 */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-center gap-4 py-8 px-6">
          {displayChars.map(renderCharacter)}
        </div>
        
        {/* 우아한 상태 표시 */}
        <div className="flex justify-center mt-6">
          <div 
            className="inline-flex items-center px-6 py-3 rounded-full backdrop-blur-2xl border"
            style={{
              backgroundColor: 'var(--color-visualizer-status-bg)',
              borderColor: 'var(--color-visualizer-status-border)'
            }}
          >
            {/* 상태 텍스트 */}
            <span 
              className="text-sm font-light transition-all duration-500"
              style={{ color: 'var(--color-visualizer-status-text)' }}
            >
              {isComposing ? (
                <span style={{ color: 'var(--color-visualizer-status-text-active)' }}>
                  중앙 조합 
                  <span 
                    className="font-mono px-3 py-1 rounded-full ml-2 text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--color-visualizer-composing-bg)',
                      color: 'var(--color-visualizer-composing-text)'
                    }}
                  >
                    {composingText.slice(-1)}
                  </span>
                  {comboCount > 8 && (
                    <span 
                      className="ml-3 px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: 'var(--color-visualizer-status-bg)',
                        color: 'var(--color-visualizer-status-text)'
                      }}
                    >
                      COMBO {comboCount}
                    </span>
                  )}
                </span>
              ) : (
                <span style={{ color: 'var(--color-visualizer-status-text)' }}>
                  시그니처 한글 조합 모드
                  {comboCount > 0 && (
                    <span 
                      className="ml-3 text-xs"
                      style={{ color: 'var(--color-visualizer-status-text)' }}
                    >
                      COMBO {comboCount}
                    </span>
                  )}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
});

/* 스타일드 JSX에서 전역 CSS로 이동 */