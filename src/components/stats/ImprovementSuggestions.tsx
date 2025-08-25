"use client";

import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useUserProgressStore } from "@/stores/userProgressStore";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

interface Suggestion {
  type: "speed" | "accuracy" | "finger" | "posture";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: React.ComponentType<any>;
}

export function ImprovementSuggestions() {
  const { liveStats } = useStatsStore();
  const { averageWPM, averageAccuracy } =
    useUserProgressStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const newSuggestions: Suggestion[] = [];

    // 속도 개선 제안
    if (averageWPM < 30) {
      newSuggestions.push({
        type: "speed",
        title: "기본 자세 연습",
        description:
          "홈로우 자세(ASDF JKLÑ)를 익혀 타이핑 속도를 향상시키세요. 매일 10분씩 기본 연습을 추천합니다.",
        priority: "high",
        icon: Target,
      });
    } else if (averageWPM < 50) {
      newSuggestions.push({
        type: "speed",
        title: "단어 단위 연습",
        description:
          "자주 사용하는 단어들을 반복 연습하여 근육 기억을 늘려보세요.",
        priority: "medium",
        icon: TrendingUp,
      });
    }

    // 정확도 개선 제안
    if (averageAccuracy < 90) {
      newSuggestions.push({
        type: "accuracy",
        title: "정확도 우선 연습",
        description:
          "속도보다는 정확성에 집중하세요. 천천히 정확하게 타이핑하는 습관을 기르면 속도는 자연히 향상됩니다.",
        priority: "high",
        icon: Target,
      });
    } else if (averageAccuracy < 95) {
      newSuggestions.push({
        type: "accuracy",
        title: "실수 패턴 분석",
        description: "자주 틀리는 글자 조합을 파악하고 집중 연습하세요.",
        priority: "medium",
        icon: Lightbulb,
      });
    }

    // 손가락별 개선 제안 (한글 키보드 기준)
    const fingerSuggestions = [
      {
        condition: () => averageWPM > 0, // 기본 조건
        title: "왼손 약지 강화",
        description:
          'ㅂ, ㅍ, ㅃ 글자 연습으로 왼손 약지의 독립성을 키워보세요. "밥", "빵", "뿌리" 같은 단어로 연습하면 효과적입니다.',
        priority: "medium" as const,
      },
      {
        condition: () => averageWPM > 20,
        title: "오른손 새끼손가락 연습",
        description:
          "ㅣ, ㅔ, ㅖ 모음 연습을 통해 오른손 새끼손가락의 정확성을 높여보세요.",
        priority: "medium" as const,
      },
      {
        condition: () => averageWPM > 35,
        title: "중지 활용도 증대",
        description:
          'ㄷ, ㅌ, ㄸ과 ㅗ, ㅛ 조합 연습으로 중지의 활용도를 높여보세요. "도토리", "또또" 같은 반복 연습이 도움됩니다.',
        priority: "low" as const,
      },
    ];

    // 조건에 맞는 손가락 제안 추가
    const validFingerSuggestion = fingerSuggestions.find((s) => s.condition());
    if (validFingerSuggestion) {
      newSuggestions.push({
        type: "finger",
        title: validFingerSuggestion.title,
        description: validFingerSuggestion.description,
        priority: validFingerSuggestion.priority,
        icon: Zap,
      });
    }

    // 자세 개선 제안
    if (averageWPM > 40 && averageAccuracy > 95) {
      newSuggestions.push({
        type: "posture",
        title: "고급 기법 연습",
        description:
          "특수문자와 숫자 조합 연습으로 실무 타이핑 능력을 향상시켜보세요.",
        priority: "low",
        icon: TrendingUp,
      });
    }

    // 우선순위별 정렬 (high > medium > low)
    newSuggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setSuggestions(newSuggestions.slice(0, 3)); // 최대 3개만 표시
  }, [averageWPM, averageAccuracy, liveStats]);


  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "중요";
      case "medium":
        return "권장";
      case "low":
        return "참고";
      default:
        return "";
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          backgroundColor: "var(--transparent)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-feedback-error)",
          opacity: "0.9",
        };
      case "medium":
        return {
          backgroundColor: "var(--transparent)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-interactive-primary)",
          opacity: "0.9",
        };
      case "low":
        return {
          backgroundColor: "var(--transparent)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-interactive-secondary)",
          opacity: "0.9",
        };
      default:
        return {
          backgroundColor: "var(--color-text-tertiary)",
          color: "var(--color-text-inverse)",
          borderColor: "var(--color-text-tertiary)",
          opacity: "0.9",
        };
    }
  };

  if (suggestions.length === 0) {
    return (
      <>
        <div className="mb-4">
          <h3 className="stats-subtitle">개선 제안</h3>
        </div>
        <div
          className="flex-1 flex flex-col items-center justify-center text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <div className="text-4xl mb-4">🎉</div>
          <p
            className="font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            훌륭합니다!
          </p>
          <p className="text-sm">
            현재 실력이 매우 좋습니다. 꾸준히 연습을 계속하세요!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h3 className="stats-subtitle">개선 제안</h3>
      </div>

      <div className="space-y-3 flex-1">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg p-4 border transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{
                    backgroundColor: "var(--color-elevated)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <IconComponent
                    className="w-5 h-5"
                    style={{ color: "var(--color-text-primary)" }}
                  />
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium border"
                  style={getPriorityStyle(suggestion.priority)}
                >
                  {getPriorityLabel(suggestion.priority)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {suggestion.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {suggestion.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
