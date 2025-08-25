"use client";

import { useMemo, useEffect, useRef, memo, useState } from "react";
import {
  calculateCharacterStates,
  groupCharactersByWords,
} from "@/utils/textState";
import { CharacterRenderer } from "./CharacterRenderer";
import { SpaceRenderer } from "./SpaceRenderer";
import { useDeviceContext, getTypingTextClassName } from "@/utils/deviceDetection";
import { initResponsiveLineHeight } from "@/utils/responsiveLineHeight";
import { setupIOSKeyboardDetection, detectMobile } from "@/utils/mobileDetection";

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
  
  // 반응형 줄간격 초기화 및 디버깅
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 반응형 줄간격 시스템 초기화
    const cleanup = initResponsiveLineHeight({
      mobile: 1.3,           // 모바일 세로: 매우 촘촘하게
      tablet: 1.4,           // 태블릿 세로: 촘촘하게 
      tabletLandscape: 1.2,  // 태블릿 가로 (갤럭시탭 등) - 극도로 촘촘하게
      desktop: 1.4           // 데스크톱: 촘촘하게
    });
    
    // 단어 25개 모드 디버깅용 콘솔 로그
    const checkLineHeight = () => {
      const currentMode = document.querySelector('[data-testmode]')?.getAttribute('data-testmode');
      const currentTarget = document.querySelector('[data-testtarget]')?.getAttribute('data-testtarget');
      const actualLineHeight = getComputedStyle(document.documentElement).getPropertyValue('--typing-line-height');
      
      if (currentMode === 'words' && currentTarget === '25') {
        console.log('🔍 단어 25개 모드 디버깅:', {
          mode: currentMode,
          target: currentTarget,
          cssLineHeight: actualLineHeight,
          textLength: safeText.length,
          wordCount: safeText.split(' ').length
        });
      }
    };
    
    setTimeout(checkLineHeight, 100);
    
    return cleanup;
  }, [safeText]);
  
  // SSR-CSR 일치를 위한 클라이언트 전용 상태
  const [isClient, setIsClient] = useState(false);
  const [renderDimensions, setRenderDimensions] = useState({
    windowHeight: 200,
    containerHeight: 400,
    isMobileViewport: false
  });
  
  // iOS 가상키보드 상태
  const [isIOSKeyboardVisible, setIsIOSKeyboardVisible] = useState(false);
  
  // DOM 계산 및 iOS 키보드 감지 설정
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
  
  // iOS 가상키보드 감지 설정
  useEffect(() => {
    const mobileDetection = detectMobile();
    if (!mobileDetection?.isIOS) return;
    
    const cleanup = setupIOSKeyboardDetection(
      () => {
        setIsIOSKeyboardVisible(true);
        console.log('📱 iOS 가상키보드 활성화됨');
      },
      () => {
        setIsIOSKeyboardVisible(false);
        console.log('📱 iOS 가상키보드 비활성화됨');
      }
    );
    
    return cleanup;
  }, []);
  
  // 모바일용 클래스명 메모이제이션 (함수 호출 최적화)
  const mobileTypingClassName = useMemo(() => {
    if (!isClient) return 'typing-text-standardized mobile-typing-container';
    return `${getTypingTextClassName(deviceContext)} mobile-typing-container`;
  }, [deviceContext, isClient]);
  
  // 모바일 윈도우 스타일 (동적 높이 제어)
  const mobileWindowStyle = useMemo(() => {
    // 텍스트 길이에 따른 예상 높이 계산 - 더 유연하게
    const textLength = safeText.length;
    const estimatedLines = Math.ceil(textLength / 35); // 약 35자 단위로 줄 계산
    const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--typing-line-height') || '1.4') * 1.5; // CSS 변수 기반 계산
    const contentHeight = Math.max(8, Math.min(40, estimatedLines * lineHeight)); // 8rem~40rem 사이로 더 유연하게
    
    return {
      position: "relative" as const,
      marginTop: "1rem",
      marginBottom: "1rem",
      marginLeft: "0.75rem",
      marginRight: "0.75rem",
      minHeight: "8rem", // 최소 높이를 더 낮게
      height: "auto", // 자동 높이로 변경
      maxHeight: deviceContext.isMobile && (deviceContext as any).isIOS 
        ? (isIOSKeyboardVisible 
          ? "calc(30vh - var(--header-height, 4rem))" // iOS 키보드 활성화 시: 더욱 낮게
          : "calc(50vh - var(--header-height, 4rem))") // iOS 키보드 비활성화 시
        : "calc(75vh - var(--header-height, 4rem))", // 다른 환경: 기존 값
      overflow: "hidden" as const,
      backgroundColor: "transparent", // 배경 제거
      borderRadius: "0", // 모서리 둥글기 제거
      boxShadow: "none", // 그림자 제거
      transition: "max-height 0.3s ease-in-out", // 높이 전환
    };
  }, [safeText.length, deviceContext.isMobile, isIOSKeyboardVisible]); // iOS 키보드 상태 변경 시 재계산
  
  // 모바일 텍스트 컨테이너 스타일 (콘텐츠 적응형)
  const mobileTextContainerStyle = useMemo(() => {
    const textLength = safeText.length;
    const isShortText = textLength < 100; // 짧은 텍스트 기준
    
    return {
      overflow: "auto" as const,
      scrollbarWidth: "none" as const,
      msOverflowStyle: "none" as const,
      WebkitOverflowScrolling: "touch" as const,
      padding: isShortText ? "2rem 1rem" : "1.5rem 1rem", // 짧은 텍스트는 패딩 증가
      minHeight: "6rem",
      height: "100%", // 부모 요소의 높이 최대 활용
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: isShortText ? "center" : "flex-start", // 짧은 텍스트는 중앙, 긴 텍스트는 상단
    };
  }, [safeText.length]);

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
          <div className="typing-text-standardized text-gray-500 italic">
            텍스트를 로드하는 중...
          </div>
        );
      }

      // 렌더링할 데이터가 없으면 원본 텍스트만 표시
      if (!wordGroups.length) {
        return (
          <div className="font-korean typing-text-standardized">
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
        <div className="font-korean typing-text-standardized text-gray-600">
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
            className="font-korean typing-text-standardized text-center"
            style={{ 
              padding: '2rem 1rem',
              minHeight: '4rem',
              wordBreak: 'break-all',
              lineHeight: 'var(--typing-line-height)' // 반응형 줄간격 명시적 적용
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
            className="typing-text-container font-korean typing-text-standardized text-center"
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
        // PC/태블릿: 비율 기반 최적화 창
        <div
          className="desktop-text-window"
          style={{
            position: "relative",
            width: "clamp(45ch, 65vw, 85ch)", // 문자 기반 비율 (이상적: 45-85자)
            maxWidth: "none", // clamp가 제어하므로 제거
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
            className="typing-text-container font-korean typing-text-standardized text-center"
            style={{
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              padding: "4rem 2rem",
              height: "100%",
            }}
          >
            <div 
              className="typing-text-standardized flex flex-wrap justify-center items-baseline min-h-full"
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
        <div 
          className="typing-text-standardized"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {safeText || '텍스트를 표시할 수 없습니다'}
        </div>
      </div>
    );
  }
});

