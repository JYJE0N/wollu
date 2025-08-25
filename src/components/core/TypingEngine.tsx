"use client";

import { useEffect } from "react";
import { TypingTestUI } from "./TypingTestUI";
import { useTypingTestController } from "./TypingTestController";
import { useTypingTimer } from "./TypingTimer";
import { useTestCompletionHandler } from "./TestCompletionHandler";
import { smartPreloader, performanceTriggeredPreloading } from "@/utils/bundleOptimization";
import { useStatsStore } from "@/stores/statsStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface TypingEngineProps {
  className?: string;
}

/**
 * 타이핑 엔진 오케스트레이터 - 모든 로직을 조합하는 메인 컴포넌트
 * 책임: 컨트롤러들을 조합하고 UI에 props 전달
 */
export function TypingEngine({ className = "" }: TypingEngineProps) {
  
  // 핵심 컨트롤러들
  const controller = useTypingTestController();
  const { 
    showPromotionModal, 
    promotionData, 
    closePromotionModal, 
    handleContinueTest,
    handleViewStats,
    handleTestCompletion 
  } = useTestCompletionHandler();
  
  const timer = useTypingTimer(handleTestCompletion);
  
  // 최적화를 위한 상태들
  const { liveStats } = useStatsStore();
  const { theme } = useSettingsStore();

  // 스마트 프리로딩 로직
  useEffect(() => {
    // 테스트 시작 시 Stats 컴포넌트들을 백그라운드에서 프리로딩
    if (controller.isActive || controller.currentIndex > 0) {
      smartPreloader.preloadStatsComponents();
    }

    // 성능 기반 프리로딩 트리거
    if (liveStats) {
      performanceTriggeredPreloading.checkHighPerformance(liveStats.cpm, liveStats.wpm);
      
      // 진행률 기반 프리로딩 (targetText 길이로 계산)
      const progress = controller.targetText ? controller.currentIndex / controller.targetText.length : 0;
      performanceTriggeredPreloading.checkNearCompletion(progress);
    }

    // 테마 기반 프리로딩
    performanceTriggeredPreloading.checkUserPattern(theme, false);
  }, [
    controller.isActive, 
    controller.currentIndex, 
    controller.targetText,
    liveStats?.cpm, 
    liveStats?.wpm,
    theme
  ]);

  // 초기 텍스트 생성은 page.tsx의 useEffect에서 처리됨 (무한루프 방지를 위해 제거)

  // 테스트 완료 시 처리는 TestCompletionHandler에서 담당
  // (중복 제거: controller.handleTestCompletion은 더 이상 호출하지 않음)

  // 전역 이벤트 처리는 InputHandler에서 담당

  return (
    <div data-testmode={useSettingsStore.getState().testMode} data-testtarget={useSettingsStore.getState().testTarget}>
      <TypingTestUI
        // 상태 전달
        targetText={controller.targetText}
        currentIndex={controller.currentIndex}
        userInput={controller.userInput}
        mistakes={controller.mistakes.map(m => m.position)}
        
        // 타이머 관련
        currentTime={timer.currentTime}
        
        // 완료 처리 관련 - getWordProgress 제거됨
        showPromotionModal={showPromotionModal}
        promotionData={promotionData}
        closePromotionModal={closePromotionModal}
        handleContinueTest={handleContinueTest}
        handleViewStats={handleViewStats}
        
        // 언어 감지 관련
        languageHint={controller.languageHint}
        setLanguageHint={controller.setLanguageHint}
        
        // 액션 핸들러 전달
        onStart={controller.handleStart}
        onRestart={controller.handleRestart}
        onKeyPress={controller.handleKeyPress}
        onBackspace={controller.handleBackspace}
        onPause={controller.pauseTest}
        onResume={controller.resumeTest}
        onStop={controller.stopTest}
        onTestStart={controller.handleStart}
        
        className={className}
      />
    </div>
  );
}