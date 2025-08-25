"use client";

import { PercentileTierBadge } from "@/components/ui/TierBadge";
import { ProgressSlider } from "@/components/ui/ProgressSlider";
import { defaultTierSystem } from "@/utils/tierSystem";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { IoCheckbox, IoPlay } from "react-icons/io5";

interface TierSectionProps {
  className?: string;
  bestCPM?: number;
  bestWPM?: number;
  improvementRate: number;
  totalTests: number;
  primaryMetric: "cpm" | "wpm";
  mounted: boolean;
}

export function TierSection({
  className = "",
  bestCPM,
  bestWPM: _bestWPM,
  improvementRate: _improvementRate,
  totalTests,
  primaryMetric,
  mounted,
}: TierSectionProps) {
  const { averageSpeed } = useUserProgressStore();

  // userProgressStore에서 실제 통계 가져오기
  const { averageAccuracy, averageConsistency } = useUserProgressStore();
  
  // 현재 사용자의 티어 정보 계산
  const currentStats = {
    averageCPM: primaryMetric === "cpm" ? bestCPM || 0 : averageSpeed || 0,
    averageAccuracy: averageAccuracy || 90, // 실제 평균 정확도 사용
    averageConsistency: averageConsistency || 80, // 실제 평균 일관성 사용
    totalTests: totalTests || 0,
  };

  const currentTier = defaultTierSystem.calculateCurrentTier(currentStats);
  const progress = defaultTierSystem.calculateProgress(currentStats);
  const currentPercentile = progress?.ranking.percentile || 50;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* 티어 현황 */}
      <div className="stats-card flex flex-col">
        <h3 className="stats-subtitle mb-6">티어 현황</h3>

        <div className="flex flex-col items-center text-center">
          {/* 아바타 배지 */}
          <div className="mb-8">
            <PercentileTierBadge
              tier={currentTier}
              currentPercentile={Math.round(currentPercentile)}
              size="lg"
            />
          </div>

          {/* 티어명 */}
          <div
            className="stats-metric-large mb-4"
            style={{ color: currentTier.color }}
          >
            {currentTier.name}
          </div>

          {/* 백분율 정보 */}
          <div className="stats-caption mb-3">
            {mounted ? (
              <>
                상위 {100 - currentPercentile}% •{" "}
                {(progress?.ranking.current || 0).toLocaleString()}위 /{" "}
                {(progress?.ranking.total || 1000).toLocaleString()}명
              </>
            ) : (
              <>상위 50% • 0위 / 1,000명</>
            )}
          </div>

          {/* 티어 설명 */}
          <div className="stats-description mb-4">
            {currentTier.description}
          </div>
        </div>

        {/* 다음 티어까지의 진행률 */}
        <div className="flex-grow flex flex-col justify-between mt-6">
          {mounted && progress && (
            <div className="space-y-3">
              <ProgressSlider
                value={Math.round(
                  (progress.percentile.progress + progress.tests.progress) / 2
                )}
                size="md"
                variant="primary"
                showLabel={true}
                animated={false}
                className="w-full"
              />

              <div className="flex justify-center">
                <span className="stats-description">다음 티어까지</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 티어 시스템 */}
      <div className="stats-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="stats-subtitle">티어 시스템</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {defaultTierSystem.getAllTiers().map((tier) => {
            const isCurrentTier = tier.id === currentTier.id;
            const isAchieved = currentPercentile >= tier.minPercentile;

            return (
              <div
                key={tier.id}
                className="relative p-3 rounded-lg border transition-all duration-300"
                style={{
                  backgroundColor: isCurrentTier
                    ? `${tier.color}20`
                    : "var(--color-background)",
                  borderColor: "var(--color-border)",
                  opacity: isAchieved || isCurrentTier ? 1 : 0.3,
                  filter: isAchieved || isCurrentTier ? "none" : "grayscale(1)",
                }}
              >
                {/* 현재 티어 표시 */}
                {isCurrentTier && (
                  <div
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "var(--color-interactive-primary)",
                      color: "var(--color-text-on-primary)",
                    }}
                  >
                    CURRENT
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">{tier.icon}</div>
                  <div
                    className="font-bold text-sm"
                    style={{
                      color: isAchieved
                        ? tier.color
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {tier.name}
                  </div>
                </div>

                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  상위{" "}
                  {tier.maxPercentile !== undefined
                    ? `${100 - tier.maxPercentile}-${100 - tier.minPercentile}%`
                    : `${100 - tier.minPercentile}%+`}
                </div>

                <div
                  className="text-xs leading-tight"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {tier.description}
                </div>

                {/* 달성 상태 */}
                {isAchieved && !isCurrentTier && (
                  <div className="absolute bottom-2 right-2">
                    <IoCheckbox
                      className="w-5 h-5"
                      style={{ color: "var(--color-interactive-primary)" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
