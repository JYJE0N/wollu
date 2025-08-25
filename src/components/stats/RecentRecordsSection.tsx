"use client";

import { ImprovementSuggestions } from "./ImprovementSuggestions";
import { useUserProgressStore } from "@/stores/userProgressStore";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { TextType, TestMode } from "@/types";

interface RecentRecordsSectionProps {
  className?: string;
  hasRecentTests: boolean;
  primaryMetric: "cpm" | "wpm";
}

export function RecentRecordsSection({
  className = "",
  hasRecentTests,
  primaryMetric,
}: RecentRecordsSectionProps) {
  const { recentTests } = useUserProgressStore();
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 최근 6개 테스트 기록
  const recentSixTests = recentTests.slice(0, 6);

  const itemsPerPage = 3;
  // 항상 3의 배수로 페이지 계산 (빈 카드 포함)
  const totalPages = Math.ceil(
    Math.max(recentSixTests.length, 3) / itemsPerPage
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 날짜 포맷팅 함수 - 클라이언트에서만 실행
  const formatDate = (date: Date) => {
    if (!isClient) return "";
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // 소요시간 포맷팅 함수
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}:${String(Math.floor(remainingSeconds)).padStart(2, "0")}`
      : `${Math.floor(remainingSeconds)}s`;
  };

  // 테스트 타입 포맷팅 함수
  const formatTestType = (language: string, textType: TextType, mode: TestMode) => {
    // 언어 표시
    const langDisplay = language === 'korean' ? '한글' : 'English';
    
    // 단어 모드는 항상 단순하게 표시
    if (mode === 'words' || textType === 'words') {
      return `${langDisplay} · 단어`;
    }
    
    // 문장 모드 처리
    let lengthText = '문장';
    let styleText = '일반';
    
    // 길이 매핑 (정확한 매칭 우선)
    switch (textType) {
      case 'short-sentences':
        lengthText = '단문';
        break;
      case 'medium-sentences':
        lengthText = '중문';
        break;
      case 'long-sentences':
        lengthText = '장문';
        break;
      case 'sentences':
        lengthText = '문장';
        break;
      default:
        // 레거시 데이터나 복합 타입 처리 (fallback)
        if (textType.includes('short')) lengthText = '단문';
        else if (textType.includes('medium')) lengthText = '중문';
        else if (textType.includes('long')) lengthText = '장문';
        break;
    }
    
    // 스타일 매핑
    if (textType === 'punctuation') {
      styleText = '구두점';
    } else if (textType === 'numbers') {
      styleText = '숫자';
    } else if (textType.includes('mixed')) {
      styleText = '혼합';
    }
    
    return `${langDisplay} · ${lengthText} · ${styleText}`;
  };

  // 현재 페이지의 기록들 생성 (빈 카드 포함)
  const getCurrentPageRecords = () => {
    const startIndex = currentPage * itemsPerPage;
    const records = [];

    for (let i = 0; i < itemsPerPage; i++) {
      const dataIndex = startIndex + i;
      if (dataIndex < recentSixTests.length) {
        records.push(recentSixTests[dataIndex]);
      } else {
        records.push(null); // 빈 카드를 위한 null
      }
    }

    return records;
  };

  const currentRecords = getCurrentPageRecords();

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch ${className}`}
    >
      {/* 최근 테스트 기록 */}
      <div className="stats-card h-full flex flex-col">
        <div className="mb-4">
          <h3 className="stats-subtitle">최근 테스트 기록</h3>
        </div>

        {hasRecentTests && recentSixTests.length > 0 ? (
          <div className="flex-1">
            {/* 기록 카드들 */}
            <div className="space-y-3">
              {currentRecords.map((test, index) =>
                test ? (
                  // 실제 데이터 카드
                  <div
                    key={`test-${test.id}-${index}`}
                    className="p-3 rounded-lg border transition-colors"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between mb-3 pb-2 border-b"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: "var(--color-interactive-primary)",
                            color: "var(--color-text-inverse)",
                            opacity: "0.8",
                          }}
                        >
                          #{currentPage * itemsPerPage + index + 1}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {formatDate(test.date)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {formatTestType(test.language, test.textType, test.mode).split(' · ').map((type, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded border"
                            style={{
                              borderColor: "var(--color-interactive-secondary)",
                              color: "var(--color-interactive-secondary)",
                              backgroundColor: "transparent",
                            }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 성적 지표 */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          {primaryMetric.toUpperCase()}:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-interactive-primary)" }}
                        >
                          {primaryMetric === "cpm" ? test.cpm : test.wpm}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          정확도:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-interactive-primary)" }}
                        >
                          {test.accuracy.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          일관성:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-interactive-primary)" }}
                        >
                          {test.consistency.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          소요시간:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-interactive-primary)" }}
                        >
                          {formatDuration(test.duration)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          키스트로크:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-interactive-primary)" }}
                        >
                          {test.keystrokes}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          오타:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-feedback-error)" }}
                        >
                          {test.mistakes}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 빈 카드
                  <div
                    key={`empty-${index}`}
                    className="p-3 rounded-lg border transition-colors opacity-30"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between mb-3 pb-2 border-b"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: "var(--color-interactive-primary)",
                            color: "var(--color-text-inverse)",
                            opacity: "0.5",
                          }}
                        >
                          #
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          기록이 없습니다
                        </span>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded border"
                        style={{
                          borderColor: "var(--color-interactive-secondary)",
                          color: "var(--color-interactive-secondary)",
                          backgroundColor: "transparent",
                        }}
                      >
                        도전
                      </span>
                    </div>

                    {/* 빈 성적 지표 */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          {primaryMetric.toUpperCase()}:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          기록 없음
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          정확도:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          %
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          일관성:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          %
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          소요시간:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          기록 없음
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          키스트로크:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          기록 없음
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span style={{ color: "var(--color-text-primary)" }}>
                          오타:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          기록 없음
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* 하단 네비게이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev > 0 ? prev - 1 : totalPages - 1
                    )
                  }
                  className="p-2 rounded-full transition-colors border"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* 페이지 인디케이터 */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          i === currentPage
                            ? "var(--color-interactive-primary)"
                            : "var(--color-border)",
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < totalPages - 1 ? prev + 1 : 0
                    )
                  }
                  className="p-2 rounded-full transition-colors border"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Clock className="w-8 h-8 mb-3 opacity-50" />
            <p className="stats-description">아직 기록이 없습니다</p>
            <p className="stats-caption mt-1">
              타이핑 테스트를 완료하면 기록이 쌓입니다
            </p>
          </div>
        )}
      </div>

      {/* AI 개선 제안 */}
      <div className="stats-card h-full flex flex-col">
        <ImprovementSuggestions />
      </div>
    </div>
  );
}
