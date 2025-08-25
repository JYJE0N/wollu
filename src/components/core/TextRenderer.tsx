"use client";

import { useMemo, useEffect, useRef, memo, useState } from "react";
import {
  calculateCharacterStates,
  groupCharactersByWords,
} from "@/utils/textState";
import { CharacterRenderer } from "./CharacterRenderer";
import { SpaceRenderer } from "./SpaceRenderer";
import { useDeviceContext, getTypingTextClassName } from "@/utils/deviceDetection";
import { usePerformanceMonitor } from "@/utils/performanceMonitor";

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
  // 성능 모니터링
  usePerformanceMonitor('TextRenderer');
  
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
    return `${getTypingTextClassName(deviceContext)} mobile-typing-container`;
  }, [deviceContext]);
  
  // 스타일 객체 메모이제이션 (참조 안정성 확보)
  const mobileWindowStyle = useMemo(() => ({
    position: "fixed" as const,
    top: "calc(var(--header-height) + 6.5rem)",
    left: "1rem",
    right: "1rem",
    minHeight: "8rem",
    maxHeight: "calc(100vh - var(--header-height) - var(--footer-height) - 16rem)",
    overflow: "hidden" as const,
    zIndex: 40,
    backgroundColor: "var(--color-surface)",
    borderRadius: "0.75rem",
    border: "2px solid var(--color-border-primary)",
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

  // 자동 스크롤 처리 - 모바일과 PC 다르게 처리 (성능 최적화)
  useEffect(() => {
    // 텍스트가 완료된 경우 스크롤링 비활성화 (무한 루프 방지)
    if (currentIndex >= text.length) {
      return;
    }

    let scrollTimeout: NodeJS.Timeout;
    let rafId: number;

    const scrollToCurrentPosition = () => {
      // 안전 가드 - DOM이 준비되지 않으면 즉시 반환
      if (!textContainerRef.current || !containerRef.current) return;
      
      const targetIndex = currentIndex < 0 ? 0 : currentIndex;
      
      try {
        // DOM 선택자 최적화: ref 사용 (안전 가드 추가)
        if (!currentElementRef.current || currentElementRef.current.getAttribute('data-index') !== targetIndex.toString()) {
          const element = textContainerRef.current.querySelector(`[data-index="${targetIndex}"]`) as HTMLElement;
          if (!element) return; // 요소가 없으면 안전하게 반환
          currentElementRef.current = element;
        }
        
        const currentElement = currentElementRef.current;
        const textContainer = textContainerRef.current;

        // 추가 안전 가드
        if (!currentElement || !textContainer || !currentElement.getBoundingClientRect || !textContainer.getBoundingClientRect) {
          return;
        }
        if (isMobile) {
          // 모바일: 안전한 스크롤링
          const windowHeight = 192;
          const windowCenter = windowHeight / 2;

          const textContainerRect = textContainer.getBoundingClientRect();
          const elementRect = currentElement.getBoundingClientRect();

          // 유효한 rect인지 확인
          if (textContainerRect.width === 0 || elementRect.width === 0) {
            return;
          }

          const relativeTop = elementRect.top - textContainerRect.top + textContainer.scrollTop;
          const targetScrollTop = Math.max(0, relativeTop - windowCenter);

          // scrollTop 설정 안전 가드
          if (isFinite(targetScrollTop) && targetScrollTop >= 0) {
            textContainer.scrollTop = targetScrollTop;
          }
        } else {
          // PC: 안전한 스크롤링
          const containerHeight = textContainer.clientHeight;
          if (containerHeight === 0) return;
          
          const targetPosition = containerHeight * 0.33;

          const textContainerRect = textContainer.getBoundingClientRect();
          const elementRect = currentElement.getBoundingClientRect();

          // 유효한 rect인지 확인
          if (textContainerRect.width === 0 || elementRect.width === 0) {
            return;
          }

          const relativeTop = elementRect.top - textContainerRect.top + textContainer.scrollTop;
          const targetScrollTop = Math.max(0, relativeTop - targetPosition);

          // scrollTop 설정 안전 가드
          if (isFinite(targetScrollTop) && targetScrollTop >= 0) {
            if (currentIndex <= 0) {
              textContainer.scrollTop = 0;
            } else {
              textContainer.scrollTop = targetScrollTop;
            }
          }
        }
      } catch (error) {
        // 에러 발생 시 안전하게 무시 (무한 리렌더링 방지)
        // console.error('TextRenderer scroll error:', error);
        return;
      }
    };

    // 쓰로틀링 최적화 (RAF 제거)
    const throttleDelay = isMobile ? 16 : 8; // 성능 향상된 지연시간
    
    const throttledScroll = () => {
      try {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          // 컴포넌트가 여전히 마운트되어 있는지 확인
          if (containerRef.current && textContainerRef.current) {
            scrollToCurrentPosition();
          }
        }, throttleDelay);
      } catch (error) {
        // 쓰로틀링 에러도 안전하게 처리
        return;
      }
    };

    // 초기 실행도 안전하게 처리
    if (currentIndex >= 0 && currentIndex < text.length) {
      throttledScroll();
    }

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [currentIndex, isPaused, isMobile]); // text 의존성 제거로 성능 향상

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
      {isMobile ? (
        // 모바일: 고정 윈도우 방식
        <div
          className="fixed-text-window"
          style={mobileWindowStyle}
        >
          <div
            ref={(el) => { 
              try {
                textContainerRef.current = el; 
              } catch (error) {
                // ref 설정 에러 안전 처리
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
            // CSS 변수를 사용한 적응형 높이
            height: "var(--window-height)",
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
              try {
                if (!textContainerRef.current) textContainerRef.current = el; 
              } catch (error) {
                // ref 설정 에러 안전 처리
              }
            }}
            className="typing-text-container font-korean text-2xl text-center"
            style={{
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              // CSS 변수를 사용한 적응형 패딩
              padding: "var(--text-container-padding-vertical) 2rem",
              height: "100%",
              // 텍스트 크기도 CSS 변수로 통일
              fontSize: "var(--typing-font-size)",
            }}
          >
            <div 
              className="flex flex-wrap justify-center items-baseline min-h-full"
              style={{
                // CSS 변수를 사용한 라인 높이
                lineHeight: "var(--typing-line-height)",
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

