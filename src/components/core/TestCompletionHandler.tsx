"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { defaultTierSystem, type TierConfig } from "@/utils/tierSystem";
import { triggerTestCompletion, initializeTestCompletionManager } from "@/utils/testCompletionManager";
import { initDevTools } from "@/utils/devTools";

/**
 * 🎯 간소화된 테스트 완료 핸들러 (중앙집중식 매니저 사용)
 * 책임: 테스트 완료 감지, 이벤트 발행, 티어 승급, 페이지 이동
 */
export function useTestCompletionHandler() {
  const router = useRouter();
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionData, setPromotionData] = useState<{
    fromTier: TierConfig;
    toTier: TierConfig;
  } | null>(null);

  const { isCompleted, targetText, currentIndex, keystrokes, mistakes, startTime, firstKeystrokeTime } = useTypingStore();
  const { liveStats } = useStatsStore();
  const { 
    averageCPM, 
    averageAccuracy, 
    averageConsistency = 0,
    totalTests,
    initializeUser,
    fetchProgress 
  } = useUserProgressStore();

  // 🎯 매니저 초기화 및 사용자 초기화
  useEffect(() => {
    initializeTestCompletionManager();
    initializeUser();
    fetchProgress();
    
    // 개발자 도구 초기화
    initDevTools();
    
    // 개발자 도구에서 승급 모달 테스트 이벤트 리스너
    const handleTestPromotion = (event: CustomEvent) => {
      const { fromTier, toTier } = event.detail;
      setPromotionData({ fromTier, toTier });
      setShowPromotionModal(true);
      console.log('🎉 개발자 도구: 승급 모달 표시', fromTier.name, '→', toTier.name);
    };
    
    window.addEventListener('test:promotion', handleTestPromotion as EventListener);
    
    return () => {
      window.removeEventListener('test:promotion', handleTestPromotion as EventListener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 한번만 실행 (initializeUser, fetchProgress는 항상 안정적)


  // 🎯 간소화된 테스트 완료 처리 (이벤트 발행만)
  const handleTestCompletion = useCallback(async () => {
    if (!isCompleted || !firstKeystrokeTime || !startTime) return;

    console.log('🎯 TestCompletionHandler: 테스트 완료 이벤트 발행');

    let hasPromotion = false;

    try {
      // 🎯 중앙집중식 매니저에게 이벤트 위임
      triggerTestCompletion({
        keystrokes,
        mistakes,
        startTime,
        currentIndex,
        currentTime: new Date(),
        firstKeystrokeTime,
        currentText: targetText,
        userInput: ''
      });

      // 티어 승급 체크 (UI 관련이므로 여기서 처리)
      if (totalTests >= 5) {
        // 현재 실제 평균값 기반 티어 계산
        const currentTier = defaultTierSystem.calculateCurrentTier({
          averageCPM,
          averageAccuracy,
          averageConsistency: averageConsistency || 0,
          totalTests
        });
        
        // 새로운 테스트 결과를 포함한 예상 평균값 계산
        const newAverageCPM = ((averageCPM * totalTests) + liveStats.cpm) / (totalTests + 1);
        const newAverageAccuracy = ((averageAccuracy * totalTests) + liveStats.accuracy) / (totalTests + 1);
        const newAverageConsistency = ((averageConsistency * totalTests) + (liveStats.consistency || 0)) / (totalTests + 1);
        
        const newTier = defaultTierSystem.calculateCurrentTier({
          averageCPM: newAverageCPM,
          averageAccuracy: newAverageAccuracy,
          averageConsistency: newAverageConsistency,
          totalTests: totalTests + 1
        });

        // 티어가 상승했는지 확인 (minPercentile로 비교)
        if (newTier.minPercentile > currentTier.minPercentile) {
          hasPromotion = true;
          setPromotionData({
            fromTier: currentTier,
            toTier: newTier
          });
          setShowPromotionModal(true);
        }
      }

      console.log('✅ TestCompletionHandler: 이벤트 발행 완료');

    } catch (error) {
      console.error('❌ TestCompletionHandler: 이벤트 발행 실패', error);
    }

    // 승급이 없으면 바로 stats로 이동
    if (!hasPromotion) {
      setTimeout(() => {
        router.push('/stats');
      }, 500);
    }
  }, [isCompleted, firstKeystrokeTime, startTime, keystrokes, mistakes, targetText, currentIndex, totalTests, averageCPM, averageAccuracy, averageConsistency, liveStats, router]);

  // 테스트 완료 감지 (완전한 무한 루프 방지)
  useEffect(() => {
    // 테스트가 완료되지 않았으면 아무것도 하지 않음
    if (!isCompleted) {
      return;
    }
    
    console.log('🏁 TestCompletionHandler: 테스트 완료 감지', {
      isCompleted,
      targetTextLength: targetText?.length,
      currentIndex
    });
    
    // 즉시 실행 (지연 없음)
    handleTestCompletion();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]); // handleTestCompletion은 의도적으로 제외 (무한루프 방지)

  // 승급 모달 닫기 + stats 페이지로 이동
  const closePromotionModal = useCallback(() => {
    setShowPromotionModal(false);
    setPromotionData(null);
    
    // 즉시 stats 페이지로 이동
    router.push('/stats');
  }, [router]);

  // 계속하기 (새 테스트 시작)
  const handleContinueTest = useCallback(() => {
    setShowPromotionModal(false);
    setPromotionData(null);
    
    // 현재 페이지가 메인 페이지라면 새로운 텍스트를 강제로 생성
    if (window.location.pathname === '/') {
      // 전역 이벤트로 새 테스트 시작 요청
      window.dispatchEvent(new CustomEvent('typing:restart-test'));
    } else {
      // 다른 페이지에서 온 경우 메인 페이지로 이동 후 새 테스트 시작
      setTimeout(() => {
        router.push('/?restart=true');
      }, 300);
    }
  }, [router]);

  // 자세히 보기 (통계 페이지로 이동)
  const handleViewStats = useCallback(() => {
    setShowPromotionModal(false);
    setPromotionData(null);
    
    // 즉시 stats 페이지로 이동
    router.push('/stats');
  }, [router]);

  // 진행률 계산 (단어 모드일 때)
  const getWordProgress = useCallback(() => {
    if (!targetText) return 0;
    const words = targetText.split(' ');
    const currentWords = targetText.slice(0, currentIndex).split(' ');
    return Math.min(100, (currentWords.length / words.length) * 100);
  }, [targetText, currentIndex]);

  return {
    // 승급 모달 상태
    showPromotionModal,
    promotionData,
    closePromotionModal,
    handleContinueTest,
    handleViewStats,
    
    // 진행률
    getWordProgress,
    
    // 액션
    handleTestCompletion,
  };
}