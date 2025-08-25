"use client";

import { useStatsStore } from "@/stores/statsStore";
import { useTypingStore } from "@/stores/typingStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { IoSparkles, IoTrophy, IoTime } from "react-icons/io5";
import { FaKeyboard } from "react-icons/fa6";
import { AiFillThunderbolt } from "react-icons/ai";
import { Target, Loader2 } from "lucide-react";
import { TestTitleSystem } from "@/utils/titleSystem";
import { lazy, Suspense } from "react";
import { KakaoShare } from "@/components/ui/KakaoShare";

// 동적 임포트: TestResultChart는 Recharts가 무거우므로 지연 로딩
const TestResultChart = lazy(() => 
  import("./TestResultChart").then(module => ({
    default: module.TestResultChart
  }))
);

interface TestResultSectionProps {
  className?: string;
  primaryMetric: "cpm" | "wpm";
  onMetricChange: (metric: "cpm" | "wpm") => void;
}

export function TestResultSection({
  className = "",
  primaryMetric,
  onMetricChange,
}: TestResultSectionProps) {
  const { liveStats } = useStatsStore();
  const { targetText, userInput, mistakes } = useTypingStore();
  const { bestCPM, bestWPM } = useUserProgressStore();

  // 테스트 결과 데이터가 있는지 확인
  const hasStatsData = liveStats && (liveStats.cpm > 0 || liveStats.wpm > 0);

  if (!hasStatsData) {
    return (
      <div className={`stats-card ${className}`}>
        <h3 className="stats-subtitle">테스트 결과</h3>
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <p>아직 완료된 테스트가 없습니다</p>
          <p className="stats-caption mt-2">
            타이핑 테스트를 완료하면 결과가 표시됩니다
          </p>
        </div>
      </div>
    );
  }

  // 테마 색상 동적 로드
  const getThemeColors = () => {
    if (typeof window === "undefined") {
      return {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        muted: "#6b7280",
      };
    }

    const computedStyle = getComputedStyle(document.documentElement);
    return {
      primary:
        computedStyle.getPropertyValue("--color-interactive-primary").trim() ||
        "#3b82f6",
      secondary:
        computedStyle
          .getPropertyValue("--color-interactive-secondary")
          .trim() || "#8b5cf6",
      accent:
        computedStyle.getPropertyValue("--color-feedback-warning").trim() ||
        "#f59e0b",
      muted:
        computedStyle.getPropertyValue("--color-text-tertiary").trim() ||
        "#6b7280",
    };
  };

  const themeColors = getThemeColors();

  // 신기록 여부 확인
  const currentScore =
    primaryMetric === "cpm" ? liveStats.cpm || 0 : liveStats.wpm || 0;
  const personalBest = primaryMetric === "cpm" ? bestCPM || 0 : bestWPM || 0;
  const isNewRecord = currentScore > personalBest;

  // 테스트 결과 기반 칭호 계산
  const testTitle = TestTitleSystem.getTitleByResult({
    cpm: liveStats.cpm || 0,
    accuracy: liveStats.accuracy || 0,
    timeElapsed: liveStats.timeElapsed || 0,
  });

  return (
    <div className={className}>
      {/* 제목 섹션 */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="stats-subtitle">테스트 결과</h2>
          {testTitle && (
            <>
              <span
                className="font-medium text-sm px-2 py-1 rounded"
                style={{
                  color: testTitle.color,
                  backgroundColor: `${testTitle.color}10`,
                }}
              >
                "{testTitle.name}"
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {testTitle.suffix}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 성과 개요 - 6개 카드 섹션 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* CPM 카드 */}
        <div
          className="flex flex-col items-center p-4 rounded-xl text-center"
          style={{
            backgroundColor: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--chart-shadow-light)",
          }}
        >
          <FaKeyboard
            className="w-6 h-6 mb-2"
            style={{ color: themeColors.primary, opacity: 0.8 }}
          />
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: themeColors.primary }}
          >
            {primaryMetric === "cpm" ? liveStats.cpm || 0 : liveStats.wpm || 0}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeColors.muted }}
          >
            {primaryMetric.toUpperCase()}
          </div>
        </div>

        {/* 정확도 카드 */}
        <div
          className="flex flex-col items-center p-4 rounded-xl text-center"
          style={{
            backgroundColor: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--chart-shadow-light)",
          }}
        >
          <Target
            className="w-6 h-6 mb-2"
            style={{ color: themeColors.primary, opacity: 0.8 }}
          />
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: themeColors.primary }}
          >
            {(liveStats.accuracy || 0).toFixed(1)}
            <span className="text-sm">%</span>
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeColors.muted }}
          >
            정확도
          </div>
        </div>

        {/* 스트로크 카드 */}
        <div
          className="flex flex-col items-center p-4 rounded-xl text-center"
          style={{
            backgroundColor: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--chart-shadow-light)",
          }}
        >
          <AiFillThunderbolt
            className="w-6 h-6 mb-2"
            style={{ color: themeColors.primary, opacity: 0.8 }}
          />
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: themeColors.primary }}
          >
            {((liveStats.cpm || 0) / 60).toFixed(1)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeColors.muted }}
          >
            스트로크
          </div>
        </div>

        {/* 소요시간 카드 */}
        <div
          className="flex flex-col items-center p-4 rounded-xl text-center"
          style={{
            backgroundColor: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--chart-shadow-light)",
          }}
        >
          <IoTime
            className="w-6 h-6 mb-2"
            style={{ color: themeColors.primary, opacity: 0.8 }}
          />
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: themeColors.primary }}
          >
            {Math.floor((liveStats.timeElapsed || 0) / 60)}:
            {String(Math.floor((liveStats.timeElapsed || 0) % 60)).padStart(
              2,
              "0"
            )}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeColors.muted }}
          >
            소요시간
          </div>
        </div>

        {/* 최고기록 카드 */}
        <div
          className="flex flex-col items-center p-4 rounded-xl text-center"
          style={{
            backgroundColor: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--chart-shadow-light)",
          }}
        >
          <IoTrophy
            className="w-6 h-6 mb-2"
            style={{ color: themeColors.primary, opacity: 0.8 }}
          />
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: themeColors.secondary }}
          >
            {personalBest || currentScore}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeColors.muted }}
          >
            최고기록
          </div>
        </div>

        {/* 성과 요약 카드 */}
        <div
          className="flex flex-col items-center p-4 rounded-xl text-center"
          style={{
            backgroundColor: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--chart-shadow-light)",
          }}
        >
          <IoSparkles
            className="w-6 h-6 mb-2"
            style={{ color: themeColors.primary, opacity: 0.8 }}
          />
          <div
            className="text-2xl font-bold mb-1"
            style={{ color: themeColors.primary }}
          >
            {isNewRecord ? "신기록!" : "완료"}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeColors.muted }}
          >
            테스트 결과
          </div>
        </div>
      </div>

      {/* 공유하기 섹션 */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
        <KakaoShare 
          title={`월루타자기 테스트 결과 - ${primaryMetric === 'cpm' ? liveStats.cpm : liveStats.wpm}${primaryMetric === 'cpm' ? 'CPM' : 'WPM'}`}
          description={`정확도 ${liveStats.accuracy}% | ${isNewRecord ? '신기록 달성!' : '완료'} | 월루타자기에서 타이핑 실력을 향상시키세요!`}
          className="w-full sm:w-auto"
        />
        <div 
          className="text-sm text-center sm:text-left"
          style={{ color: "var(--color-text-secondary)" }}
        >
          친구들과 결과를 공유해보세요!
        </div>
      </div>

      <TestResultChart
        data={{
          cpm: liveStats.cpm || 0,
          wpm: liveStats.wpm || 0,
          accuracy: liveStats.accuracy || 0,
          timeElapsed: liveStats.timeElapsed || 0,
          targetText: targetText || "",
          userInput: userInput || "",
          mistakes: mistakes || [],
        }}
        primaryMetric={primaryMetric}
        onMetricToggle={onMetricChange}
      />
    </div>
  );
}
