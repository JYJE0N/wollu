"use client";

import React, { useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Tooltip,
  ComposedChart,
} from "recharts";
import { Share2 } from "lucide-react";
import { IoPlay } from "react-icons/io5";
import { IoCalendarOutline } from "react-icons/io5";
import { useUserProgressStore } from "@/stores/userProgressStore";

import type { Mistake } from "@/types";

interface TestResultData {
  cpm: number;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  mistakes: Mistake[];
  targetText: string;
  userInput: string;
}

interface TestResultChartProps {
  data: TestResultData;
  className?: string;
  primaryMetric: "cpm" | "wpm";
  onMetricToggle: (metric: "cpm" | "wpm") => void;
}

export function TestResultChart({
  data,
  className = "",
  primaryMetric,
  onMetricToggle,
}: TestResultChartProps) {
  // 상대 시간 계산
  const getRelativeTime = () => {
    // 테스트 완료 시점을 현재로 가정
    const now = new Date();
    const secondsAgo = Math.floor(
      (now.getTime() - (now.getTime() - 30000)) / 1000
    ); // 임시로 30초 전

    if (secondsAgo < 60) return "방금 전";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}분 전`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}시간 전`;
    return `${Math.floor(secondsAgo / 86400)}일 전`;
  };
  const [showShareModal, setShowShareModal] = useState(false);

  // 사용자 진행률 데이터 가져오기
  const { bestCPM, bestWPM, initializeUser, fetchProgress } =
    useUserProgressStore();

  // 데이터 로드 확인
  useEffect(() => {
    console.log("💾 UserProgressStore Debug:", {
      bestCPM,
      bestWPM,
      timestamp: new Date().toISOString(),
    });

    // 데이터가 없으면 초기화 시도
    if (!bestCPM && !bestWPM) {
      console.log("🔄 Initializing user data...");
      initializeUser().then(() => {
        fetchProgress();
      });
    }
  }, [bestCPM, bestWPM, initializeUser, fetchProgress]);

  // 테마 색상 동적 로드 (드라큐라 테마 지원)
  const getThemeColors = () => {
    if (typeof window === "undefined") {
      // SSR 대비 기본값
      return {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        muted: "#6b7280",
        border: "#e5e7eb",
        background: "#ffffff",
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
      border:
        computedStyle.getPropertyValue("--color-border").trim() || "#e5e7eb",
      background:
        computedStyle.getPropertyValue("--color-background").trim() ||
        "#ffffff",
    };
  };

  const themeColors = getThemeColors();


  // 스트로크 속도와 함께 더 역동적인 차트 데이터 생성 (장문 대응 최적화)
  const generateChartData = () => {
    const textLength = Math.max(data.targetText.length, 100);
    const testDuration = data.timeElapsed; // 테스트 소요 시간(초)

    // 테스트 시간에 따른 적응적 포인트 수 결정
    let points: number;
    if (testDuration <= 60) {
      points = 30; // 1분 이하: 30 포인트
    } else if (testDuration <= 180) {
      points = 45; // 1-3분: 45 포인트
    } else if (testDuration <= 300) {
      points = 60; // 3-5분: 60 포인트
    } else {
      points = Math.min(90, Math.max(60, Math.floor(testDuration / 5))); // 5분 초과: 최대 90 포인트
    }

    const finalMetric = primaryMetric === "cpm" ? data.cpm : data.wpm;
    const chartData = [];

    // 데이터 밀도 계산 (차트 성능 최적화용)
    // const dataDensity = points / testDuration; // 미사용

    // 스트로크 패턴 생성 (실제 타이핑의 리듬감 모방)
    const strokePattern = [];
    for (let i = 0; i <= points; i++) {
      const progress = i / points;

      // 타이핑 리듬: 처음엔 느리게, 중간에 빨라지고, 끝에 약간 느려짐
      let baseStrokeRate = 1.0;

      if (progress < 0.2) {
        // 초반: 워밍업 구간 (천천히 가속)
        baseStrokeRate = 0.4 + (progress / 0.2) * 0.4;
      } else if (progress < 0.7) {
        // 중반: 고속 구간 (안정적인 고속)
        baseStrokeRate = 0.8 + Math.sin((progress - 0.2) * 4 * Math.PI) * 0.3;
      } else {
        // 후반: 피로 구간 (약간 느려짐)
        baseStrokeRate = 1.0 - (progress - 0.7) * 0.3;
      }

      // 실수 지점에서 스트로크 속도 급격히 변화
      const mistakesUpToHere = data.mistakes.filter(
        (mistake) => mistake.position <= progress * textLength
      ).length;
      if (
        mistakesUpToHere > strokePattern.filter((p) => p.mistakes > 0).length
      ) {
        baseStrokeRate *= 0.3; // 실수 시 급격히 느려짐
      }

      // 랜덤 변동성 추가 (실제 타이핑의 불규칙성)
      const variation = (Math.random() - 0.5) * 0.4;
      const strokeRate = Math.max(
        0.1,
        Math.min(2.0, baseStrokeRate + variation)
      );

      strokePattern.push({
        progress,
        strokeRate,
        mistakes: mistakesUpToHere,
      });
    }

    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      const currentChar = Math.floor(progress * textLength);

      // 정확도 계산 (이제 좀 더 안정적)
      const mistakesUpToHere = data.mistakes.filter(
        (mistake) => mistake.position <= currentChar
      ).length;
      let accuracy =
        currentChar > 0
          ? ((currentChar - mistakesUpToHere) / currentChar) * 100
          : 100;

      // 정확도는 실수 지점에서만 변화하고 나머지는 안정적
      if (mistakesUpToHere > 0) {
        accuracy = Math.max(88 - mistakesUpToHere * 3, 75); // 실수마다 3% 감소
      }

      // 타이핑 속도 (S자 곡선)
      const speedMultiplier = 1 / (1 + Math.exp(-8 * (progress - 0.5)));
      let speed = finalMetric * speedMultiplier;

      // 중간 변동성
      if (progress > 0.1 && progress < 0.9) {
        const variation = (Math.random() - 0.5) * finalMetric * 0.12;
        speed = Math.max(speed + variation, 0);
      }

      // 스트로크 속도 계산 (키/초)
      const currentStrokePattern = strokePattern[i];
      const baseStrokeSpeed = finalMetric / 5; // CPM을 키/초로 변환하는 기본값
      const strokeSpeed = baseStrokeSpeed * currentStrokePattern.strokeRate;

      // 마지막 포인트는 정확한 결과값
      if (i === points) {
        speed = finalMetric;
        accuracy = data.accuracy;
      }

      // 애니메이션 적용
      const isVisible = true;

      chartData.push({
        time: Math.round(progress * data.timeElapsed),
        speed: isVisible ? Math.round(speed) : 0,
        accuracy: isVisible ? Math.round(accuracy) : 100,
        strokeSpeed: isVisible ? Math.round(strokeSpeed * 10) / 10 : 0, // 키/초 (소수점 1자리)
        progress: Math.round(progress * 100),
        mistakes: mistakesUpToHere,
        rhythm: isVisible
          ? Math.round(currentStrokePattern.strokeRate * 100)
          : 100, // 리듬 지수 (100 = 정상)
        flow: isVisible ? Math.round(speed * (accuracy / 100)) : 0, // 플로우 점수
        intensity: isVisible ? Math.round(strokeSpeed * (accuracy / 100)) : 0, // 타이핑 강도
      });
    }

    return chartData;
  };

  const chartData = generateChartData();
  const maxSpeed = Math.max(...chartData.map((d) => d.speed)) * 1.1;
  const maxStrokeSpeed = Math.max(...chartData.map((d) => d.strokeSpeed)) * 1.1;

  // 사용자 최고기록 기반 성과 영역 정의
  const getPerformanceZones = () => {
    const userScore = primaryMetric === "cpm" ? data.cpm : data.wpm;
    const actualPersonalBest =
      primaryMetric === "cpm" ? bestCPM || 0 : bestWPM || 0;

    // 디버깅 로그 추가
    console.log("🎯 Performance Zone Debug:", {
      primaryMetric,
      userScore,
      bestCPM,
      bestWPM,
      actualPersonalBest,
    });

    // 현재 테스트 기록과 기존 최고기록 비교
    const personalBest = Math.max(actualPersonalBest, userScore);
    const isNewRecord = userScore > actualPersonalBest;

    // 최고기록이 너무 낮으면 최소값 설정
    const baseBest = Math.max(personalBest, userScore * 0.9);

    console.log("📊 Final zones:", {
      personalBest,
      baseBest,
      isNewRecord,
    });

    return {
      excellent: baseBest * 1.2, // 최고기록의 120%
      good: baseBest * 1.05, // 최고기록의 105%
      current: userScore, // 사용자 현재 기록
      personalBest: baseBest, // 사용자 최고기록 (구분선)
      baseline: baseBest * 0.8, // 기본 기준
      isNewRecord: isNewRecord, // 신기록 여부
    };
  };

  const zones = getPerformanceZones();

  // X축 틱 간격 최적화 함수 - 미사용
  // const getOptimalTickInterval = (dataLength: number) => {
  //   if (dataLength <= 30) return 0; // 모든 틱 표시
  //   if (dataLength <= 60) return 1; // 2개 중 1개 표시
  //   if (dataLength <= 90) return 2; // 3개 중 1개 표시
  //   return Math.floor(dataLength / 15); // 최대 15개 틱 표시
  // };

  // 간결한 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div
          className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-medium"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span>{Math.floor(label)}초 지점</span>
          </div>

          <div className="space-y-0.5">
            <div>CPM {Math.floor(data?.speed || 0)}</div>
            <div>WPM {Math.floor((data?.speed || 0) * 0.2)}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleShare = async () => {
    const shareText = `🎯 타이핑 테스트 완료!\n\n📊 ${primaryMetric.toUpperCase()}: ${
      primaryMetric === "cpm" ? data.cpm : data.wpm
    }\n🎯 정확도: ${data.accuracy.toFixed(1)}%\n⏱️ 시간: ${Math.floor(
      data.timeElapsed / 60
    )}:${String(data.timeElapsed % 60).padStart(
      2,
      "0"
    )}\n\n#타이핑연습 #한글타이핑`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "타이핑 테스트 결과",
          text: shareText,
        });
      } catch (_err) {
        console.log("공유 취소됨");
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareText);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  return (
    <div className={`stats-modal-container ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="stats-subtitle mb-1">상세 메트릭</h2>
          <div className="flex items-center gap-1">
            <IoCalendarOutline
              className="w-3 h-3"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <p
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {new Date()
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  timeZone: "Asia/Seoul",
                })
                .replace(/\./g, "-")
                .replace(/-$/, "")}{" "}
              • {getRelativeTime()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 메트릭 토글 - iOS 스타일 */}
          <button
            onClick={() =>
              onMetricToggle(primaryMetric === "cpm" ? "wpm" : "cpm")
            }
            className="relative flex items-center px-1 py-1 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
              width: "var(--chart-toggle-width)",
              height: "var(--chart-toggle-height)",
              backgroundColor:
                primaryMetric === "cpm"
                  ? themeColors.primary
                  : themeColors.secondary,
              boxShadow: "var(--chart-inset-shadow)",
            }}
            aria-label={`메트릭 변경: 현재 ${primaryMetric.toUpperCase()}`}
          >
            {/* 배경 라벨들 */}
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold pointer-events-none">
              <span
                className={`transition-all duration-300 ${
                  primaryMetric === "cpm"
                    ? "text-white opacity-100"
                    : "text-white/40"
                }`}
              >
                CPM
              </span>
              <span
                className={`transition-all duration-300 ${
                  primaryMetric === "wpm"
                    ? "text-white opacity-100"
                    : "text-white/40"
                }`}
              >
                WPM
              </span>
            </div>

            {/* 슬라이더 */}
            <div
              className="absolute bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
              style={{
                width: "var(--chart-toggle-slider-width)",
                height: "var(--chart-toggle-slider-height)",
                left: primaryMetric === "cpm" ? "4%" : "46%",
                boxShadow: "var(--chart-shadow-medium)",
              }}
            >
              <span
                className="text-xs font-bold transition-colors duration-300"
                style={{
                  color:
                    primaryMetric === "cpm"
                      ? themeColors.primary
                      : themeColors.secondary,
                }}
              >
                {primaryMetric.toUpperCase()}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="w-full">
        <div
          className="w-full"
          style={{ height: "var(--chart-container-height)" }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 10,
                right: 0,
                left: 0,
                bottom: 20,
              }}
            >
              <defs>
                {/* 차트 배경 수직 그라디언트 (테마 백그라운드 컬러 + 투명도 조절) */}
                <linearGradient
                  id="chartBackground"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={themeColors.background}
                    stopOpacity={0}
                  />
                  <stop
                    offset="30%"
                    stopColor={themeColors.background}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="70%"
                    stopColor={themeColors.background}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="100%"
                    stopColor={themeColors.background}
                    stopOpacity={0.9}
                  />
                </linearGradient>

                {/* 성과 칩 샤도우 */}
                <filter
                  id="chipShadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="2"
                    floodOpacity="0.15"
                  />
                </filter>
              </defs>

              {/* 차트 배경 그라디언트 */}
              <Area
                yAxisId="speed"
                dataKey={() => maxSpeed}
                fill="url(#chartBackground)"
                stroke="none"
                isAnimationActive={false}
              />

              {/* 바둑판 격자 - 촬촘한 수직/수평 점선 (차트 영역 내부만) */}
              <CartesianGrid
                strokeDasharray="2 2"
                stroke={themeColors.muted}
                opacity={0.15}
                vertical={true}
                horizontal={true}
              />

              <XAxis
                dataKey="time"
                stroke={themeColors.muted}
                fontSize={11}
                tickFormatter={(value) => {
                  const minutes = Math.floor(value / 60);
                  const seconds = value % 60;
                  return minutes > 0
                    ? `${minutes}:${String(seconds).padStart(2, "0")}`
                    : `${value}s`;
                }}
                interval={Math.max(Math.floor(chartData.length / 8), 3)}
                axisLine={{ stroke: themeColors.muted, strokeWidth: 1 }}
                tickLine={false}
              />

              <YAxis
                yAxisId="speed"
                stroke={themeColors.muted}
                fontSize={11}
                domain={[0, maxSpeed]}
                tickFormatter={(value) => String(Math.round(value / 5) * 5)}
                interval={0}
                tickCount={6}
                axisLine={{ stroke: themeColors.muted, strokeWidth: 1 }}
                tickLine={false}
              />

              <YAxis
                yAxisId="stroke"
                orientation="right"
                stroke={themeColors.muted}
                fontSize={11}
                domain={[0, maxStrokeSpeed]}
                tickFormatter={(value) => String(Math.round(value * 2) / 2)}
                interval={0}
                tickCount={4}
                axisLine={{ stroke: themeColors.muted, strokeWidth: 1 }}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* 최고기록 구분선 - 유효한 값이 있을 때만 표시 */}
              {zones.personalBest > 0 && (
                <ReferenceLine
                  yAxisId="speed"
                  y={zones.personalBest}
                  stroke={themeColors.accent}
                  strokeWidth={2}
                  opacity={1}
                  strokeDasharray="4 4"
                  name="개인 최고기록"
                />
              )}

              {/* 메인 타이핑 속도 라인 (테마 메인 색상) */}
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="speed"
                stroke={themeColors.primary}
                strokeWidth={2}
                dot={{
                  fill: themeColors.primary,
                  stroke: themeColors.primary,
                  strokeWidth: 2,
                  r: 4,
                }}
                connectNulls={false}
                isAnimationActive={chartData.length <= 60}
                animationDuration={chartData.length <= 30 ? 2000 : 1200}
                activeDot={{
                  r: 7,
                  fill: themeColors.primary,
                  stroke: themeColors.primary,
                  strokeWidth: 2,
                }}
              />

              {/* 세컨더리 스트로크 속도 라인 (테마 세컨더리 색상) */}
              <Line
                yAxisId="stroke"
                type="monotone"
                dataKey="strokeSpeed"
                stroke={themeColors.secondary}
                strokeWidth={2}
                dot={{
                  fill: themeColors.secondary,
                  stroke: themeColors.secondary,
                  strokeWidth: 2,
                  r: 3,
                }}
                connectNulls={false}
                isAnimationActive={chartData.length <= 60}
                animationDuration={chartData.length <= 30 ? 1500 : 800}
                activeDot={{
                  r: 6,
                  fill: themeColors.secondary,
                  stroke: themeColors.secondary,
                  strokeWidth: 2,
                }}
              />

              {/* 통합 성과 칩 컴포넌트 - 최고기록 라인에 따라 동적 배치 */}
              {/* 
                <g>
                  <g>
                    <defs>
                      <filter id="personalBestChipShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={themeColors.accent} floodOpacity="0.25"/>
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="black" floodOpacity="0.15"/>
                      </filter>
                    </defs>
                    
                    <rect
                      x={180}
                      y={120}
                      width={120}
                      height={24}
                      rx={12}
                      fill={themeColors.accent}
                      fillOpacity={1}
                      stroke={themeColors.background}
                      strokeWidth={3}
                      filter="url(#personalBestChipShadow)"
                    />
                    
                    <rect
                      x={182}
                      y={122}
                      width={116}
                      height={20}
                      rx={10}
                      fill="url(#chipGlow)"
                      opacity={0.3}
                    />
                    
                    <text
                      x={240}
                      y={134}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="800"
                      textShadow="0 1px 2px rgba(0,0,0,0.5)"
                    >
                      개인최고 {Math.round(zones.personalBest)}
                    </text>
                    
                    <polygon
                      points="235,144 245,144 240,154"
                      fill={themeColors.accent}
                      stroke={themeColors.background}
                      strokeWidth={1}
                      filter="url(#personalBestChipShadow)"
                    />
                  </g>
                </g>
                */}

              {/* 칩 글로우 그라디언트 정의 */}
              <defs>
                <linearGradient
                  id="chipGlow"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "white", stopOpacity: 0.8 }}
                  />
                  <stop
                    offset="50%"
                    style={{ stopColor: "white", stopOpacity: 0.3 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "white", stopOpacity: 0.1 }}
                  />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>

        </div>
      </div>

      {/* 커스텀 범례 섹션 */}
      <div className="w-full flex justify-center">
        <div
          className="chart-box-legend flex flex-wrap px-4 py-2 rounded-md border"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border-dark)",
          }}
        >
          {/* 타이핑 속도 */}
          <div className="legend-item flex items-center gap-2">
            <div className="legend-line-with-dot">
              <div
                className="legend-line"
                style={{ backgroundColor: themeColors.primary }}
              />
              <div className="legend-dot" />
            </div>
            <span
              className="legend-label"
              style={{ color: themeColors.primary }}
            >
              타이핑 속도
            </span>
          </div>

          {/* 스트로크 빈도 */}
          <div className="legend-item flex items-center gap-2">
            <div className="legend-line-with-dot">
              <div
                className="legend-line"
                style={{ backgroundColor: themeColors.secondary }}
              />
              <div
                className="legend-dot"
                style={{
                  backgroundColor: themeColors.secondary,
                  borderColor: "var(--color-interactive-secondary)",
                }}
              />
            </div>
            <span
              className="legend-label"
              style={{ color: themeColors.secondary }}
            >
              스트로크 빈도
            </span>
          </div>

          {/* 개인 최고기록 */}
          {zones.personalBest > 0 && (
            <div className="legend-item">
              <div className="legend-line-with-dot">
                <div className="legend-line legend-dashed" />
                <div
                  className="legend"
                  style={{
                    backgroundColor: themeColors.accent,
                    borderColor: themeColors.accent,
                  }}
                />
              </div>
              <span
                className="legend-label"
                style={{ color: themeColors.accent }}
              >
                개인 최고기록{zones.isNewRecord && " (신기록!)"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        {/* 재도전 버튼 */}
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: themeColors.primary,
            color: "white",
            boxShadow: "var(--chart-shadow-heavy)",
          }}
        >
          <IoPlay className="w-5 h-5" />
          재도전
        </button>

        {/* 공유 버튼 */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "transparent",
            color: themeColors.primary,
            border: `2px solid ${themeColors.primary}`,
            boxShadow: "var(--chart-shadow-medium)",
          }}
        >
          <Share2 className="w-5 h-5" />
          결과 공유
        </button>
      </div>

      {/* 공유 성공 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <div className="stats-card relative z-10 text-center">
            <div className="stats-body">클립보드에 복사되었습니다!</div>
          </div>
        </div>
      )}
    </div>
  );
}
