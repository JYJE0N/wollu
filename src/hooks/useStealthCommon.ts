"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTypingStore } from "@/stores/typingStore";
import { useStatsStore } from "@/stores/statsStore";

/**
 * Stealth 컴포넌트들의 공통 기능을 제공하는 훅
 */
export function useStealthCommon() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBlinking, setIsBlinking] = useState(true);

  // 타이핑 스토어 상태
  const { 
    targetText, 
    currentIndex, 
    userInput, 
    mistakes, 
    isActive,
    isCompleted
  } = useTypingStore();
  
  // 통계 스토어 상태
  const { liveStats } = useStatsStore();

  // 홈으로 이동
  const handleHomeNavigation = useCallback(() => {
    router.push("/");
  }, [router]);

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 커서 깜빡임
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  // 진행률 계산
  const completionRate = targetText.length > 0 
    ? Math.round((currentIndex / targetText.length) * 100) 
    : 0;

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  // 경과 시간 포맷팅
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    // 네비게이션
    handleHomeNavigation,
    
    // 시간 관련
    currentTime,
    formatTime,
    formatDate,
    formatElapsedTime,
    
    // 커서
    isBlinking,
    
    // 타이핑 상태
    text: targetText,
    currentIndex,
    userInput,
    mistakes,
    isActive,
    isCompleted,
    completionRate,
    
    // 통계
    cpm: liveStats.cpm,
    wpm: liveStats.wpm,
    accuracy: liveStats.accuracy,
    consistency: liveStats.consistency,
    elapsedTime: liveStats.timeElapsed,
  };
}

/**
 * 공통 스타일 클래스
 */
export const stealthStyles = {
  container: "min-h-screen bg-background text-foreground",
  header: "border-b border-border",
  content: "flex-1 overflow-auto",
  sidebar: "border-l border-border bg-surface",
  statsCard: "bg-surface rounded-lg p-4 border border-border",
  statValue: "text-2xl font-bold text-primary",
  statLabel: "text-sm text-muted-foreground mt-1",
  progressBar: "w-full bg-muted rounded-full h-2",
  progressFill: "h-2 rounded-full transition-all duration-300",
  cursorBlink: "animate-pulse opacity-70",
};