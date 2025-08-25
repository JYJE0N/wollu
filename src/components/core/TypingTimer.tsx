"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTypingStore } from "@/stores/typingStore";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * 타이핑 테스트의 타이머 로직을 관리
 * 책임: 카운트다운, 테스트 시간 측정, 시간 기반 테스트 완료 처리
 */
export function useTypingTimer(onTestComplete?: () => void) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const pausedTimeRef = useRef<number>(0); // 일시정지된 총 시간
  const pauseStartTimeRef = useRef<number | null>(null); // 일시정지 시작 시점

  const {
    isActive,
    isPaused,
    isCompleted,
    isCountingDown,
    countdownValue,
    startTime,
    firstKeystrokeTime,
  } = useTypingStore();

  const { testMode, testTarget } = useSettingsStore();

  // 카운트다운 관리
  useEffect(() => {
    if (isCountingDown && countdownValue > 0) {
      timerRef.current = setTimeout(() => {
        // 카운트다운이 끝나면 테스트 시작
        if (countdownValue === 1) {
          // setTestActive(); // 제거됨
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCountingDown, countdownValue]);

  // 일시정지 상태 추적
  useEffect(() => {
    if (isPaused && pauseStartTimeRef.current === null) {
      // 일시정지 시작
      pauseStartTimeRef.current = Date.now();
    } else if (!isPaused && pauseStartTimeRef.current !== null) {
      // 일시정지 해제
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      pausedTimeRef.current += pauseDuration;
      pauseStartTimeRef.current = null;
    }
  }, [isPaused]);

  // 테스트 리셋 시 일시정지 시간도 초기화 (더 강화된 로직)
  useEffect(() => {
    if (!isActive && !isPaused && !isCompleted) {
      // 테스트가 비활성화되고 일시정지도 아니고 완료도 아닌 상태 = 리셋 상태
      pausedTimeRef.current = 0;
      pauseStartTimeRef.current = null;
      setCurrentTime(0);
      console.log('⏰ Timer reset: all time values cleared');
    }
  }, [isActive, isPaused, isCompleted]);

  // 추가: startTime이 변경될 때도 타이머 초기화 (새로고침 감지)
  useEffect(() => {
    if (!startTime && !isActive) {
      // startTime이 null이고 테스트가 비활성 상태 = 완전 초기 상태
      pausedTimeRef.current = 0;
      pauseStartTimeRef.current = null;
      setCurrentTime(0);
      console.log('⏰ Timer reset: detected fresh start');
    }
  }, [startTime, isActive]);

  // 활성 테스트 시간 관리
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const baseTime = firstKeystrokeTime?.getTime() || startTime?.getTime() || now;
        const rawElapsed = (now - baseTime) / 1000;
        
        // 일시정지된 시간을 제외한 실제 경과 시간 계산
        const actualElapsed = Math.max(0, rawElapsed - (pausedTimeRef.current / 1000));
        
        setCurrentTime(actualElapsed);

        // 시간 모드 제거됨 - 타이머 기능 비활성화
        // if (testMode === "time" && actualElapsed >= testTarget) {
        //   onTestComplete?.();
        // }
      }, 50); // 50ms마다 업데이트 (더 부드러운 진행률)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, isCompleted, firstKeystrokeTime, startTime, testMode, testTarget, onTestComplete]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 남은 시간 계산 (시간 모드일 때)
  const getRemainingTime = useCallback(() => {
    // 시간 모드 제거됨
    return null;
  }, []);

  // 진행률 계산 (시간 모드일 때)
  const getTimeProgress = useCallback(() => {
    // 시간 모드 제거됨
    return null;
  }, []);

  // 포맷된 시간 문자열
  const getFormattedTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    currentTime,
    getRemainingTime,
    getTimeProgress,
    getFormattedTime,
  };
}