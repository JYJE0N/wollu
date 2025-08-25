"use client";

import { useMemo, useEffect, useRef, memo, useState } from "react";
import {
  calculateCharacterStates,
  groupCharactersByWords,
} from "@/utils/textState";
import { CharacterRenderer } from "./CharacterRenderer";
import { SpaceRenderer } from "./SpaceRenderer";
import { useDeviceContext, getTypingTextClassName } from "@/utils/deviceDetection";

interface TextRendererProps {
  text: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[];
  isPaused?: boolean;
  className?: string;
}

/**
 * 최적화된 텍스트 렌더러
 * 책임: 텍스트 레이아웃, 상태 계산 조합, 성능 최적화
 */
export const TextRenderer = memo(function TextRenderer({
  text,
  currentIndex,
  userInput,
  mistakes,
  isPaused = false,
  className = "",
}: TextRendererProps) {
  // 모든 props를 문자열/기본값으로 안전하게 정규화
  const safeText = String(text || '');
  const safeCurrentIndex = Math.max(0, Number(currentIndex) || 0);
  const safeUserInput = String(userInput || '');
  const safeMistakes = Array.isArray(mistakes) ? mistakes : [];
  const safeIsPaused = Boolean(isPaused);
  const safeClassName = String(className || '');
  // 성능 모니터링 비활성화 (모바일 무한루프 방지)
  // useEffect(() => {
  //   if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  //     performanceMonitor.recordRender('TextRenderer');
  //   }
  // });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const currentElementRef = useRef<HTMLElement | null>(null);
  const textContainerRef = useRef<HTMLElement | null>(null);
  const deviceContext = useDeviceContext();
  const { isMobile } = deviceContext;
  
  // SSR-CSR 일치를 위한 클라이언트 전용 상태
  const [isClient, setIsClient] = useState(false);
  const [renderDimensions, setRenderDimensions] = useState({
    windowHeight: 200,
    containerHeight: 400,
    isMobileViewport: false
  });
  
  // DOM 계산은 useEffect에서만 수행
  useEffect(() => {
    try {
      setIsClient(true);
      
      // window/document 계산을 여기서만 수행
      if (typeof window !== 'undefined') {
        const windowHeight = window.innerHeight || 800;
        const containerHeight = Math.min(windowHeight * 0.4, 600);
        const isMobileViewport = window.innerWidth <= 768;
        
        setRenderDimensions({
          windowHeight: windowHeight,
          containerHeight: containerHeight,
          isMobileViewport: isMobileViewport
        });
      }
    } catch (error) {
      // DOM 계산 실패 시 기본값 유지
      setRenderDimensions({
        windowHeight: 200,
        containerHeight: 400,
        isMobileViewport: false
      });
    }
  }, []);
  
  // 모바일용 클래스명 메모이제이션 (함수 호출 최적화)
  const mobileTypingClassName = useMemo(() => {
    if (!isClient) return 'typing-text-standardized mobile-typing-container';
    return `${getTypingTextClassName(deviceContext)} mobile-typing-container`;
  }, [deviceContext, isClient]);
  
  // 스타일 객체 메모이제이션 (참조 안정성 확보)
  const mobileWindowStyle = useMemo(() => ({
    position: "fixed" as const,
    top: "6rem",
    left: "1rem",
    right: "1rem",
    minHeight: "10rem",
    maxHeight: "40vh", // 가상 키보드를 고려한 높이 (화면의 40%)
    overflow: "hidden" as const,
    zIndex: 40,
    backgroundColor: "var(--color-surface, #ffffff)",
    borderRadius: "0.75rem",
    border: "2px solid var(--color-border-primary, #e5e7eb)",
    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }), []);
  
  const mobileTextContainerStyle = useMemo(() => ({
    overflow: "auto" as const,
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
    WebkitOverflowScrolling: "touch" as const,
    padding: "1rem",
    minHeight: "6rem",
  }), []);

  // 문자별 상태 계산 (안전한 정규화된 값 사용)
  const characterStates = useMemo(() => {
    try {
      if (!safeText) return [];
      return calculateCharacterStates(safeText, safeCurrentIndex, safeUserInput, safeMistakes);
    } catch (error) {
      // 계산 실패 시 빈 배열 반환 (throw 금지)
      return [];
    }
  }, [safeText, safeCurrentIndex, safeUserInput, safeMistakes]);

  // 단어별 그룹화 (안전한 렌더링 최적화)
  const wordGroups = useMemo(() => {
    try {
      if (!safeText || !characterStates.length) return [];
      return groupCharactersByWords(safeText, characterStates);
    } catch (error) {
      // 그룹화 실패 시 빈 배열 반환 (throw 금지)
      return [];
    }
  }, [safeText, characterStates]);

  // 자동 스크롤 처리 - 모바일 포함
  useEffect(() => {
    // 클라이언트 사이드가 아니거나 텍스트가 없으면 스킵
    if (!isClient || !safeText || safeCurrentIndex >= safeText.length) {
      return;
    }

    const scrollToCurrentPosition = () => {
      if (!textContainerRef.current) return;
      
      const targetIndex = Math.max(0, safeCurrentIndex);
      const element = textContainerRef.current.querySelector(`[data-index="${targetIndex}"]`) as HTMLElement;
      
      if (!element) return;

      const container = textContainerRef.current;
      const containerHeight = container.clientHeight;
      if (containerHeight === 0) return;
      
      // 모바일과 PC 다른 스크롤 위치 설정
      let targetPosition: number;
      
      if (isMobile) {
        // 모바일: 가상 키보드를 고려하여 상단에 가깝게 (화면의 30% 위치)
        targetPosition = containerHeight * 0.3;
      } else {
        // PC: 화면 중앙 근처 (33% 위치)
        targetPosition = containerHeight * 0.33;
      }
      
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
      const targetScrollTop = Math.max(0, relativeTop - targetPosition);
      
      if (safeCurrentIndex <= 0) {
        container.scrollTop = 0;
      } else {
        // 부드러운 스크롤 적용
        if (isMobile) {
          // 모바일에서는 즉시 스크롤 (성능 고려)
          container.scrollTop = targetScrollTop;
        } else {
          // PC에서는 부드럽게
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    };

    // 딜레이를 두고 스크롤 실행
    const timeoutId = setTimeout(scrollToCurrentPosition, 50);

    return () => clearTimeout(timeoutId);
  }, [safeCurrentIndex, safeText, isMobile, isClient]); // 안전한 의존성만 사용

  // 텍스트 컨텐츠 안전 렌더링 (예외 시 기본 텍스트)
  const textContent = useMemo(() => {
    try {
      // 텍스트가 없으면 기본 메시지
      if (!safeText) {
        return (
          <div className="text-gray-500 italic text-lg">
            텍스트를 로드하는 중...
          </div>
        );
      }

      // 렌더링할 데이터가 없으면 원본 텍스트만 표시
      if (!wordGroups.length) {
        return (
          <div className="font-korean text-xl">
            {safeText}
          </div>
        );
      }

      // 정상 렌더링 시도
      return (
        <>
          {wordGroups.map((group, wordIndex) => {
            try {
              return (
                <span
                  key={`word-${wordIndex}`}
                  className="word-group"
                >
                  {/* 단어 내 문자들 - 안전 렌더링 */}
                  {Array.isArray(group.wordChars) && group.wordChars.map((charState, charIndex) => {
                    try {
                      return (
                        <CharacterRenderer
                          key={`char-${charState.index || charIndex}`}
                          state={charState}
                          showCursor={charState.status === "current"}
                          data-index={charState.index || charIndex}
                        />
                      );
                    } catch (error) {
                      // 개별 문자 렌더링 실패 시 기본 텍스트
                      return <span key={`fallback-${charIndex}`}>{charState.char || '?'}</span>;
                    }
                  })}

                  {/* 스페이스 문자 - 안전 렌더링 */}
                  {group.spaceChar && (() => {
                    try {
                      return (
                        <SpaceRenderer
                          key={`space-${group.spaceChar.index || wordIndex}`}
                          state={group.spaceChar}
                          showCursor={group.spaceChar.status === "current"}
                          data-index={group.spaceChar.index || wordIndex}
                        />
                      );
                    } catch (error) {
                      // 스페이스 렌더링 실패 시 기본 공백
                      return <span key={`space-fallback-${wordIndex}`}> </span>;
                    }
                  })()}
                </span>
              );
            } catch (error) {
              // 단어 그룹 렌더링 실패 시 기본 텍스트
              return <span key={`group-fallback-${wordIndex}`}>텍스트</span>;
            }
          })}

          {/* 텍스트 끝 커서 - 안전 렌더링 */}
          {safeCurrentIndex >= safeText.length && (
            <span 
              className="end-cursor inline-block w-0.5 ml-1 rounded-sm bg-blue-500"
            />
          )}
        </>
      );
    } catch (error) {
      // 전체 렌더링 실패 시 최종 fallback
      return (
        <div className="font-korean text-xl text-gray-600">
          {safeText || '텍스트 렌더링 오류'}
        </div>
      );
    }
  }, [safeText, wordGroups, safeCurrentIndex]); // 안전한 값들만 의존성으로 사용

  // SSR에서는 기본 렌더링만 (안전함을 최우선)
  if (!isClient) {
    try {
      return (
        <div
          className={`text-renderer ${safeClassName}`}
          style={{ padding: '1rem' }}
        >
          <div 
            className="font-korean text-xl text-center"
            style={{ 
              padding: '2rem 1rem',
              minHeight: '4rem',
              wordBreak: 'break-all'
            }}
          >
            {safeText || '텍스트 로딩 중...'}
          </div>
        </div>
      );
    } catch (error) {
      // SSR 렌더링조차 실패하면 최소한의 텍스트만
      return (
        <div style={{ padding: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            {String(text || '텍스트 오류')}
          </div>
        </div>
      );
    }
  }

  // 메인 렌더링도 안전하게 감싸기
  try {
    return (
      <div
        className={`text-renderer ${safeClassName}`}
        ref={containerRef}
      >
      {isClient && isMobile ? (
        // 모바일: 고정 윈도우 방식
        <div
          className="fixed-text-window"
          style={mobileWindowStyle}
        >
          <div
            ref={(el) => {
              if (el) {
                textContainerRef.current = el;
              }
            }}
            className="typing-text-container font-korean text-xl text-center"
            style={mobileTextContainerStyle}
          >
            {/* 실제 스크롤되는 텍스트 컨테이너 */}
            <div
              className={mobileTypingClassName}
            >
              {textContent}
            </div>
          </div>
        </div>
      ) : (
        // PC/태블릿: 적응형 구멍뚫린 창
        <div
          className="desktop-text-window"
          style={{
            position: "relative",
            width: "70%", // 뷰포트의 70%만 사용
            maxWidth: "800px", // 최대 너비 제한
            margin: "0 auto", // 중앙 정렬
            // 고정 높이 설정 (CSS 변수 대신)
            height: renderDimensions.containerHeight + 'px',
            overflow: "hidden",
            backgroundColor: "transparent",
            marginTop: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* 단순화된 블러 효과 - 성능 최적화 */}
          <div
            className="blur-mask-top"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4rem",
              background: `linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)`,
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
          
          <div
            className="blur-mask-bottom"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4rem",
              background: `linear-gradient(to top, var(--color-background) 0%, transparent 100%)`,
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          <div
            ref={(el) => {
              if (el) {
                textContainerRef.current = el;
              }
            }}
            className="typing-text-container font-korean text-2xl text-center"
            style={{
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              // 고정 패딩 설정
              padding: "4rem 2rem",
              height: "100%",
              // 고정 폰트 크기
              fontSize: "1.5rem",
            }}
          >
            <div 
              className="flex flex-wrap justify-center items-baseline min-h-full"
              style={{
                // 고정 라인 높이
                lineHeight: "2.5",
                letterSpacing: "0.02em", // 자간도 약간 추가
                // 영화 크레딧 스타일을 위한 추가 스타일
                textAlign: "center",
              }}
            >
              {textContent}
            </div>
          </div>
        </div>
      )}
    </div>
    );
  } catch (error) {
    // 메인 렌더링 실패 시 최종 안전 fallback
    return (
      <div style={{ 
        padding: '2rem 1rem', 
        textAlign: 'center' as const,
        minHeight: '4rem',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '0.5rem'
      }}>
        <div style={{ fontSize: '1.25rem', color: '#6c757d' }}>
          {safeText || '텍스트를 표시할 수 없습니다'}
        </div>
      </div>
    );
  }
});

