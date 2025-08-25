"use client";

import { IoStop, IoPauseSharp, IoPlay, IoReloadCircle } from "react-icons/io5";
import { FaKeyboard } from "react-icons/fa6";
import { TextRenderer } from "./TextRenderer";
import { InputHandler } from "./InputHandler";
import { TypingVisualizer } from "./TypingVisualizer";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { CharacterProgressSlider } from "@/components/ui/ProgressSlider";
import { LanguageMismatchAlert } from "@/components/ui/LanguageMismatchAlert";
// import { TypingPreview } from "@/components/ui/TypingPreview";
import { useTypingStore } from "@/stores/typingStore";
// import { useSettingsStore } from "@/stores/settingsStore"; // 현재 미사용
import type { TierConfig } from "@/utils/tierSystem";
import { useEffect, useState, lazy, Suspense } from "react";

// 동적 임포트: PromotionModal은 승급 시에만 필요하므로 지연 로딩
const PromotionModal = lazy(() => 
  import("@/components/gamification/PromotionModal").then(module => ({
    default: module.PromotionModal
  }))
);

interface TypingTestUIProps {
  // 상태
  targetText: string;
  currentIndex: number;
  userInput: string;
  mistakes: number[];

  // 타이머 관련
  currentTime: number;

  // 완료 처리 관련
  showPromotionModal: boolean;
  promotionData: { fromTier: TierConfig; toTier: TierConfig } | null;
  closePromotionModal: () => void;
  handleContinueTest?: () => void;
  handleViewStats?: () => void;

  // 언어 감지 관련
  languageHint?: {
    show: boolean;
    message: string;
    severity: "info" | "warning" | "error";
  };
  setLanguageHint?: (hint: {
    show: boolean;
    message: string;
    severity: "info" | "warning" | "error";
  }) => void;

  // 액션 핸들러
  onStart: () => void;
  onRestart: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onTestStart: () => void;

  // 스타일
  className?: string;
}

/**
 * 타이핑 테스트의 순수 UI 렌더링 컴포넌트
 * 책임: UI 렌더링, 이벤트 전달, 레이아웃
 */
export function TypingTestUI({
  targetText,
  currentIndex,
  userInput,
  mistakes,
  currentTime,
  showPromotionModal,
  promotionData,
  closePromotionModal,
  handleContinueTest,
  handleViewStats,
  languageHint,
  setLanguageHint,
  onStart,
  onRestart,
  onKeyPress,
  onBackspace,
  onPause,
  onResume,
  onStop,
  onTestStart,
  className = "",
}: TypingTestUIProps) {
  const { isActive, isPaused, isCompleted, isCountingDown, countdownValue } =
    useTypingStore();

  // 설정 스토어에서 필요한 값들
  // const { testTarget } = useSettingsStore(); // 현재 미사용

  // 가상 키보드 감지
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 모바일에서만 감지
      if (window.innerWidth <= 768) {
        // 더 정확한 뷰포트 높이 감지
        const initialViewportHeight = window.innerHeight;
        const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
        
        // 키보드 높이 = 초기 뷰포트 높이 - 현재 뷰포트 높이
        const keyboardHeight = Math.max(0, initialViewportHeight - currentViewportHeight);
        
        // 키보드가 150px 이상 올라왔을 때 (임계값 조정)
        const isKeyboardUp = keyboardHeight > 150;
        setKeyboardVisible(isKeyboardUp);

        // CSS 변수 업데이트 - 실제 사용 가능한 뷰포트 높이 기준
        document.documentElement.style.setProperty(
          "--keyboard-height",
          isKeyboardUp ? `${keyboardHeight}px` : "0px"
        );
        
        // 실제 사용 가능한 뷰포트 높이도 CSS 변수로 제공
        document.documentElement.style.setProperty(
          "--actual-viewport-height",
          `${currentViewportHeight}px`
        );

        // body 클래스 토글
        document.body.classList.toggle("keyboard-visible", isKeyboardUp);
        
        console.log(`🎹 키보드 상태: ${isKeyboardUp ? '활성' : '비활성'}, 높이: ${keyboardHeight}px, 사용가능 높이: ${currentViewportHeight}px`);
      }
    };

    // 초기 실행
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <div className={`typing-test-container mobile-content-container ${className}`}>
      {/* 카운트다운 오버레이 */}
      {isCountingDown && (
        <div
          className="countdown-overlay fixed inset-0 flex flex-col items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(12px)",
            zIndex: 90, /* 카운트다운 오버레이 */
          }}
        >
          {/* 준비 텍스트 */}
          <div
            className="text-lg font-medium mb-8 animate-pulse"
            style={{ color: "var(--color-text-secondary)" }}
          >
            한/영키 확인했나요?
          </div>

          {/* 심플한 원형 프로그레스 */}
          <div className="countdown-display relative w-32 h-32 flex items-center justify-center">
            {/* 원형 프로그레스 차트 */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* 배경 원 */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-border-primary)"
                strokeWidth="4"
                opacity="0.3"
              />
              {/* 프로그레스 원 */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-interactive-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset="0"
                style={{
                  animation: `spin-progress 1s ease-in-out forwards`,
                  transformOrigin: "center",
                }}
                key={countdownValue} // 키 변경으로 애니메이션 재시작
              />
            </svg>

            {/* 중앙 텍스트/아이콘 */}
            <div
              className="text-xl font-bold text-center flex items-center justify-center"
              style={{
                color: "var(--color-text-primary)",
                textShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {countdownValue === 3 && "3"}
              {countdownValue === 2 && "2"}
              {countdownValue === 1 && <FaKeyboard className="w-6 h-6" />}
            </div>
          </div>

          {/* 시작 힌트 */}
          <div
            className="text-sm mt-8 opacity-70"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            타이핑 시작 준비!
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 영역 - 새로운 레이아웃 구성 */}
      <div className="main-content-area max-w-4xl mx-auto px-4">
        
        {/* 1. 진행률 슬라이더 - 테스트 시작 시에만 표시 (배경만 제거) */}
        {isActive && (
          <div className="progress-slider-container mb-6">
            <div className="w-full max-w-2xl mx-auto">
              <CharacterProgressSlider
                currentIndex={currentIndex}
                totalLength={targetText.length}
                elapsedTime={currentTime}
                variant="success"
                size="lg"
                className=""
                showCount={false}
                animated={false}
              />
            </div>
          </div>
        )}

        {/* 모든 기기 공용 시작 버튼 */}
        {!isActive && !isCompleted && !isCountingDown && (
          <div className="start-button-container mb-6 text-center">
            <button
              onClick={() => {
                console.log('🚀 시작 버튼 클릭 - 사용자 의도적 시작');
                onStart();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--color-interactive-primary)',
                color: 'var(--color-text-on-primary)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <IoPlay className="w-5 h-5" />
              타이핑 시작하기
            </button>
            <div 
              className="text-xs mt-2 opacity-60"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              준비가 되면 버튼을 눌러주세요
            </div>
          </div>
        )}

        {/* 2. 텍스트 필드 */}
        <div
          className="typing-area relative"
          style={{ minHeight: "200px" }}
          onClick={() => {
            // 일시정지 상태에서만 클릭으로 재개 허용
            if (isPaused && onResume) {
              onResume();
            }
          }}
        >
          <TextRenderer
            text={targetText}
            currentIndex={currentIndex}
            userInput={userInput}
            mistakes={mistakes}
            isPaused={isPaused}
            className="mb-4"
          />

          <InputHandler
            onKeyPress={onKeyPress}
            onBackspace={onBackspace}
            onTestStart={onTestStart}
            onResume={isPaused ? onResume : undefined}
            onPause={onPause}
            onRestart={onRestart}
            disabled={isCompleted}
            className="typing-input"
          />
        </div>

        {/* 3. 현재 작성중인 글자 미리보기 패널 - PC에서만 표시 (주석처리) */}
        {/* <div className="hidden md:block">
          <TypingPreview
            targetText={targetText}
            currentIndex={currentIndex}
            userInput={userInput}
            isActive={isActive}
          />
        </div> */}

        {/* 타이핑 시각화 컨테이너 - 데스크톱용 */}
        <div
          className="typing-visualizer-container mb-8 hidden md:block"
          style={{ minHeight: "80px" }}
        >
          {isActive && !isPaused && (
            <TypingVisualizer
              text={targetText}
              currentIndex={currentIndex}
            />
          )}
        </div>

        {/* 모바일용 하단 UI 컨테이너 - 뷰포트 대응 */}
        <div className="md:hidden fixed left-0 right-0 z-50" 
             style={{ 
               bottom: keyboardVisible 
                 ? "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" // 가상키보드 활성 시: 바로 위에
                 : "calc(var(--footer-height) + env(safe-area-inset-bottom, 0px) + 0.5rem)", // 일반 상태: 푸터 위에
               maxHeight: keyboardVisible 
                 ? "calc(var(--actual-viewport-height, 100vh) - var(--header-height) - 8rem)" // 가상키보드 시 실제 뷰포트 사용
                 : "calc(50vh - 2rem)" // 일반 상태: 기존 높이 제한
             }}>
          
          {/* 통합 정보 패널 - 조합패널 + 프로그레스바 */}
          <div className="mx-3 mb-3">
            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-primary)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              {/* 조합 패널 (활성 상태일 때만) */}
              {isActive && !isPaused && (
                <div 
                  className="mb-3"
                  style={{ minHeight: "40px" }} // 높이 압축
                >
                  <TypingVisualizer
                    text={targetText}
                    currentIndex={currentIndex}
                  />
                </div>
              )}
              
              {/* 프로그레스 바 */}
              <div>
                <CharacterProgressSlider
                  currentIndex={currentIndex}
                  totalLength={targetText.length}
                  elapsedTime={currentTime}
                  variant="success"
                  size="sm"
                  className="w-full"
                  showCount={false}
                  animated={false}
                />
              </div>
            </div>
          </div>

          {/* 컴팩트 컨트롤 버튼들 */}
          <div className="flex justify-center items-center gap-2 px-3">
            {!isActive && !isCompleted && !isCountingDown && (
              <>
                <button
                  onClick={onStart}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-white hover:opacity-90 flex-1 max-w-[120px]"
                  style={{ backgroundColor: "var(--color-interactive-primary)" }}
                >
                  <IoPlay className="w-3.5 h-3.5" />
                  시작
                </button>

                <button
                  onClick={onRestart}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-white hover:opacity-90 flex-1 max-w-[120px]"
                  style={{
                    backgroundColor: "var(--color-interactive-secondary)",
                  }}
                >
                  <IoReloadCircle className="w-3.5 h-3.5" />
                  새로고침
                </button>
              </>
            )}

            {isActive && !isPaused && (
              <>
                <button
                  onClick={onPause}
                  className="typing-button-secondary flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-1 max-w-[100px]"
                >
                  <IoPauseSharp className="w-3.5 h-3.5" />
                  정지
                </button>

                <button
                  onClick={onStop}
                  className="typing-button-restart flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-1 max-w-[100px]"
                >
                  <IoStop className="w-3.5 h-3.5" />
                  중단
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={onResume}
                  className="typing-button-primary flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-1 max-w-[100px]"
                >
                  <IoPlay className="w-3.5 h-3.5" />
                  재개
                </button>

                <button
                  onClick={onRestart}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-white hover:opacity-90 flex-1 max-w-[100px]"
                  style={{
                    backgroundColor: "var(--color-interactive-secondary)",
                  }}
                >
                  <IoReloadCircle className="w-3.5 h-3.5" />
                  새로고침
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4. 컨트롤 버튼 - PC 버전 */}
        <div className="hidden md:flex justify-center items-center gap-4 mb-8 mt-8">
          {!isActive && !isCompleted && !isCountingDown && (
            <>
              <button
                onClick={onStart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-102 active:scale-95"
                style={{ backgroundColor: "var(--color-interactive-primary)" }}
              >
                <IoPlay className="w-5 h-5" />
                시작하기
              </button>

              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-102 active:scale-95"
                style={{
                  backgroundColor: "var(--color-interactive-secondary)",
                }}
              >
                <IoReloadCircle className="w-5 h-5" />
                새로고침
              </button>
            </>
          )}

          {isActive && !isPaused && (
            <>
              <button
                onClick={onPause}
                className="typing-button-secondary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-opacity-10 hover:scale-102 active:scale-95"
              >
                <IoPauseSharp className="w-5 h-5" />
                일시정지
              </button>

              <button
                onClick={onStop}
                className="typing-button-restart flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-opacity-10 hover:scale-102 active:scale-95"
              >
                <IoStop className="w-5 h-5" />
                중단
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={onResume}
                className="typing-button-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:opacity-90 hover:scale-102 active:scale-95"
              >
                <IoPlay className="w-5 h-5" />
                재개하기
              </button>

              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90 hover:scale-102 active:scale-95"
                style={{
                  backgroundColor: "var(--color-interactive-secondary)",
                }}
              >
                <IoReloadCircle className="w-5 h-5" />
                새로고침
              </button>
            </>
          )}
        </div>

        {/* 5. 숏컷 인포 */}
        <div className="shortcuts-container">
          <KeyboardShortcuts
            showStart={!isActive && !isCompleted && !isCountingDown}
            showPause={isActive && !isPaused}
            showResume={isPaused}
            showRestart={isActive || isPaused || isCompleted}
          />
        </div>
      </div>

      {/* 언어 불일치 알림 */}
      {languageHint && (
        <LanguageMismatchAlert
          show={languageHint.show}
          message={languageHint.message}
          severity={languageHint.severity}
          onDismiss={() =>
            setLanguageHint?.({ show: false, message: "", severity: "info" })
          }
        />
      )}

      {/* 승급 모달 - 동적 로딩 */}
      {showPromotionModal && promotionData && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background bg-opacity-90 backdrop-blur-sm" />
            <div className="relative rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                 style={{
                   backgroundColor: "var(--color-surface)",
                   border: "1px solid rgba(59, 130, 246, 0.2)"
                 }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse"
                     style={{ backgroundColor: "var(--color-interactive-primary)", opacity: 0.7 }}>
                  <FaKeyboard className="w-8 h-8 text-white" />
                </div>
                <p style={{ color: "var(--color-text-secondary)" }}>승급 정보를 준비하는 중...</p>
              </div>
            </div>
          </div>
        }>
          <PromotionModal
            isOpen={showPromotionModal}
            fromTier={promotionData.fromTier}
            toTier={promotionData.toTier}
            onClose={closePromotionModal}
            onContinue={handleContinueTest}
            onViewStats={handleViewStats}
          />
        </Suspense>
      )}
    </div>
  );
}
