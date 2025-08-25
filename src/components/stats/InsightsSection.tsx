"use client";

import { IoTrophy, IoTimer, IoRocket, IoThumbsUpSharp } from "react-icons/io5";

interface InsightsSectionProps {
  className?: string;
  totalPracticeTime: number;
  averageSpeed: number;
  totalKeystrokes: number;
  ranking: number;
  mounted: boolean;
  primaryMetric: "cpm" | "wpm";
}

export function InsightsSection({
  className = "",
  totalPracticeTime,
  averageSpeed,
  totalKeystrokes,
  ranking,
  mounted,
  primaryMetric,
}: InsightsSectionProps) {
  // 총 연습시간을 분 단위로 표시 (소수점 절삭)
  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      // 1시간 이상: 시간 단위로 표시
      const hours = Math.floor(seconds / 3600);
      const remainingMins = Math.floor((seconds % 3600) / 60);

      if (remainingMins > 0) {
        return `${hours}시간 ${remainingMins}분`;
      } else {
        return `${hours}시간`;
      }
    } else {
      // 1시간 미만: 분 단위로 표시 (최소 0.1분)
      const totalMinutes = Math.max(0.1, Math.floor((seconds / 60) * 10) / 10);
      return `${totalMinutes}분`;
    }
  };

  // 키스트로크 수를 K 단위로 포맷
  const formatKeystrokes = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const insights = [
    {
      icon: IoTimer,
      label: "총 연습시간",
      value: mounted ? formatTime(totalPracticeTime) : "0초",
      // description: "꾸준한 연습이 실력 향상의 열쇠입니다",
    },
    {
      icon: IoThumbsUpSharp,
      label: primaryMetric === "cpm" ? "평균 CPM" : "평균 WPM",
      value: mounted ? `${averageSpeed}` : "0",
      unit: primaryMetric === "cpm" ? "타" : "타",
      // description: "일관성 있는 속도를 유지하고 있습니다",
    },
    {
      icon: IoRocket,
      label: "총 타수",
      value: mounted ? formatKeystrokes(totalKeystrokes) : "0",
      // description: "매 키스트로크가 발전의 한 걸음입니다",
    },
    {
      icon: IoTrophy,
      label: "상위 랭킹",
      value: mounted ? `${ranking}` : "0",
      unit: "%",
      // description: "다른 사용자들과 비교한 당신의 위치입니다",
    },
  ];

  return (
    <div className={`stats-card ${className}`}>
      <h3 className="stats-subtitle mb-6">인사이트</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;

          return (
            <div
              key={index}
              className="text-center"
            >
              <div className="flex justify-center mb-3">
                <IconComponent
                  className="w-6 h-6"
                  style={{ color: "var(--color-interactive-primary)" }}
                />
              </div>

              <div
                className="stats-metric-medium mb-1"
                style={{ color: "var(--color-interactive-secondary)" }}
              >
                {insight.value}
                {insight.unit && (
                  <span className="stats-metric-unit ml-1">{insight.unit}</span>
                )}
              </div>

              <div
                className="stats-description mb-2"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {insight.label}
              </div>

              {/* <div className="stats-caption">{insight.description}</div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
