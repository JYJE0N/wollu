"use client";

import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTypingStore } from "@/stores/typingStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { IoPlay, IoTrendingUp } from "react-icons/io5";
import { Loader2 } from "lucide-react";

// 섹션 컴포넌트들 동적 임포트 (차트가 포함된 무거운 컴포넌트들)
const TestResultSection = lazy(() => 
  import("./TestResultSection").then(module => ({
    default: module.TestResultSection
  }))
);
const TierSection = lazy(() => 
  import("./TierSection").then(module => ({
    default: module.TierSection
  }))
);
const RecentRecordsSection = lazy(() => 
  import("./RecentRecordsSection").then(module => ({
    default: module.RecentRecordsSection
  }))
);
const InsightsSection = lazy(() => 
  import("./InsightsSection").then(module => ({
    default: module.InsightsSection
  }))
);
const RecommendationSection = lazy(() => 
  import("./RecommendationSection").then(module => ({
    default: module.RecommendationSection
  }))
);

// 가벼운 컴포넌트는 일반 임포트
import { StatsHeader } from "./StatsHeader";

export function StatsPage() {
  const router = useRouter();
  const { isCompleted } = useTypingStore();
  const { liveStats } = useStatsStore();
  const { language, testMode, testTarget, sentenceLength, sentenceStyle } =
    useSettingsStore();
  const {
    bestWPM,
    bestCPM,
    recentTests,
    improvementRate,
    totalTests,
    totalPracticeTime,
    averageSpeed,
    totalKeystrokes,
    ranking,
  } = useUserProgressStore();

  const [mounted, setMounted] = useState(false);
  const [hasRecentTests, setHasRecentTests] = useState(false);
  const [primaryMetric, setPrimaryMetric] = useState<"cpm" | "wpm">("cpm");
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    header: true, // 기본적으로 헤더는 보이게
    results: true,
    tier: true,
    recent: true,
    insights: true,
    recommendations: true,
    actions: true
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // 클라이언트 사이드 마운트 및 로딩 상태 관리
  useEffect(() => {
    setMounted(true);
    
    // 로딩 시간을 더욱 단축하여 즉시 표시
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 50); // 50ms로 단축
    
    return () => clearTimeout(loadTimer);
  }, []);

  // 데이터 준비 완료 확인
  const isDataReady = mounted && !isLoading;
  
  // 교차 관찰자 설정 (지연 로딩)
  useEffect(() => {
    if (!mounted) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setVisibleSections(prev => ({
              ...prev,
              [sectionId]: entry.isIntersecting
            }));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    
    // 모든 섹션을 관찰
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
      observerRef.current?.observe(section);
    });
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [mounted]);

  // 테스트 결과 데이터 확인
  const hasStatsData =
    liveStats &&
    typeof liveStats.cpm === "number" &&
    typeof liveStats.wpm === "number" &&
    typeof liveStats.accuracy === "number" &&
    liveStats.cpm > 0;

  // 상태 업데이트
  useEffect(() => {
    if (mounted) {
      setHasRecentTests(recentTests.length > 0);
    }
  }, [
    mounted,
    isCompleted,
    hasStatsData,
    liveStats,
    improvementRate,
    recentTests.length,
  ]);

  // 재도전 핸들러
  const handleRestart = useCallback(() => {
    console.log("🔄 Starting new test");

    const { resetTest } = useTypingStore.getState();
    const { resetStats } = useStatsStore.getState();

    resetTest();
    resetStats();

    // Next.js 라우터로 부드럽게 이동
    router.push("/");
  }, [router]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && (event.key === "Tab" || event.key === "Enter")) {
        event.preventDefault();
        handleRestart();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRestart]);

  // 로딩 화면
  if (isLoading || !mounted) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 font-korean min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-interactive-primary)' }} />
          <p className="text-text-secondary">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  console.log('📊 StatsPage rendering:', { 
    mounted, 
    isLoading, 
    hasStatsData, 
    liveStats,
    isDataReady 
  });

  return (
    <div
      className={`w-full max-w-6xl mx-auto font-korean ${
        isMobile ? 'px-4 py-4' : 'px-4 lg:px-8 py-8'
      }`}
      style={{
        minHeight: '100vh'
      }}
    >
      {/* 타이틀 및 컨텍스트 */}
      <div 
        data-section="header" 
        className={`transition-all duration-700 ${
          visibleSections.header ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <StatsHeader
          language={language as "korean" | "english"}
          testMode={testMode as "words" | "sentences"}
          testTarget={testTarget}
          sentenceLength={sentenceLength}
          sentenceStyle={
            sentenceStyle as "plain" | "punctuation" | "numbers" | "mixed"
          }
        />
      </div>

      {/* 섹션 1: 테스트 결과 */}
      <div 
        data-section="results" 
        className={`transition-all duration-700 delay-100 ${
          visibleSections.results ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Suspense fallback={
          <div className={`animate-pulse ${isMobile ? "mb-6" : "mb-8"}`}>
            <div className="h-8 rounded-lg mb-4" style={{ backgroundColor: 'var(--color-surface)', width: '40%' }}></div>
            <div className="h-64 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
          </div>
        }>
          <TestResultSection
            className={isMobile ? "mb-6" : "mb-8"}
            primaryMetric={primaryMetric}
            onMetricChange={setPrimaryMetric}
          />
        </Suspense>
      </div>

      {/* 섹션 2: 티어 안내 */}
      <div 
        data-section="tier" 
        className={`transition-all duration-700 delay-200 ${
          visibleSections.tier ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Suspense fallback={
          <div className={`animate-pulse ${isMobile ? "mb-6" : "mb-8"}`}>
            <div className="h-6 rounded-lg mb-3" style={{ backgroundColor: 'var(--color-surface)', width: '30%' }}></div>
            <div className="h-32 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
          </div>
        }>
          <TierSection
            className={isMobile ? "mb-6" : "mb-8"}
            bestCPM={bestCPM}
            bestWPM={bestWPM}
            improvementRate={improvementRate}
            totalTests={totalTests}
            primaryMetric={primaryMetric}
            mounted={mounted}
          />
        </Suspense>
      </div>

      {/* 섹션 3: 최근 기록 및 AI 개선 제안 */}
      <div 
        data-section="recent" 
        className={`transition-all duration-700 delay-300 ${
          visibleSections.recent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Suspense fallback={
          <div className={`animate-pulse ${isMobile ? "mb-6" : "mb-8"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              <div className="h-48 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
            </div>
          </div>
        }>
          <RecentRecordsSection
            className={isMobile ? "mb-6" : "mb-8"}
            hasRecentTests={hasRecentTests}
            primaryMetric={primaryMetric}
          />
        </Suspense>
      </div>

      {/* 섹션 4: 인사이트 통계 */}
      <div 
        data-section="insights" 
        className={`transition-all duration-700 delay-400 ${
          visibleSections.insights ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Suspense fallback={
          <div className={`animate-pulse ${isMobile ? "mb-6" : "mb-8"}`}>
            <div className="h-6 rounded-lg mb-3" style={{ backgroundColor: 'var(--color-surface)', width: '35%' }}></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
            </div>
          </div>
        }>
          <InsightsSection
            className={isMobile ? "mb-6" : "mb-8"}
            totalPracticeTime={totalPracticeTime}
            averageSpeed={averageSpeed}
            totalKeystrokes={totalKeystrokes}
            ranking={ranking}
            mounted={mounted}
            primaryMetric={primaryMetric}
          />
        </Suspense>
      </div>

      {/* 섹션 5: AI 맞춤 추천 */}
      <div 
        data-section="recommendations" 
        className={`transition-all duration-700 delay-400 ${
          visibleSections.recommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Suspense fallback={
          <div className="stats-card mb-8">
            <div className="h-6 rounded-lg mb-3" style={{ backgroundColor: 'var(--color-surface)', width: '40%' }}></div>
            <div className="space-y-4">
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
              <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
            </div>
          </div>
        }>
          <RecommendationSection
            className={isMobile ? "mb-6" : "mb-8"}
          />
        </Suspense>
      </div>

      {/* 하단 액션 버튼 */}
      <div 
        data-section="actions" 
        className={`flex flex-col items-center gap-4 mt-12 transition-all duration-700 delay-500 ${
          visibleSections.actions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* 주요 액션 버튼 */}
        <div className={`flex gap-4 ${
          isMobile ? 'flex-col w-full max-w-sm' : 'flex-row'
        }`}>
          <button
            onClick={handleRestart}
            className={`flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
              isMobile ? 'px-6 py-4 rounded-lg w-full' : 'px-8 py-3 rounded-xl'
            }`}
            style={{
              backgroundColor: "var(--color-interactive-primary)",
              color: "white",
              boxShadow: "var(--chart-shadow-heavy)",
            }}
          >
            <IoPlay className="w-5 h-5" />
            연습 계속하기
          </button>
          
          {/* 모바일에서 추가 액션 */}
          {isMobile && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 w-full"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-interactive-primary)",
                border: "2px solid var(--color-interactive-primary)",
              }}
            >
              <IoTrendingUp className="w-5 h-5" />
              맨 위로 이동
            </button>
          )}
        </div>

        {/* 키보드 단축키 안내 (데스크톱에서만) */}
        {!isMobile && (
          <div className="flex justify-center mt-2">
            <KeyboardShortcuts
              showRestart={true}
              showContinue={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
