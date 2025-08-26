import { create } from 'zustand'
import { LiveStats, Keystroke, Mistake, TextType } from '@/types'
import { 
  calculateKoreanStrokeCPM, 
  calculateKoreanStrokeWPM,
  analyzeTextStrokes
} from '@/utils/koreanStrokeCalculator'
import { containsKorean } from '@/utils/koreanIME'
// import { eventBus } from '@/utils/eventBus' // EventBus 제거로 비활성화

// 메모이제이션을 위한 캐시 객체
const memoCache = new Map<string, any>();

// 간단한 메모이제이션 함수
function memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (memoCache.has(key)) {
      return memoCache.get(key);
    }
    
    const result = fn(...args);
    memoCache.set(key, result);
    
    // 캐시 크기 제한 (100개 항목)
    if (memoCache.size > 100) {
      const firstKey = memoCache.keys().next().value;
      if (firstKey !== undefined) {
        memoCache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

interface StatsStore {
  liveStats: LiveStats
  
  // 통계 계산 액션
  calculateStats: (
    keystrokes: Keystroke[],
    mistakes: Mistake[],
    startTime: Date | null,
    currentIndex?: number,
    currentTime?: Date,
    textType?: TextType,
    currentText?: string,
    userInput?: string,        // 🔥 실제 사용자 입력 (오타 포함)
    firstKeystrokeTime?: Date | null  // 🎯 첫 키 입력 시점
  ) => void
  
  resetStats: () => void
  
  // 개별 통계 계산 유틸리티
  calculateWPM: (keystrokes: Keystroke[], timeElapsed: number, textType?: TextType) => number
  calculateRawWPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateCPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateAccuracy: (keystrokes: Keystroke[]) => number
  calculateConsistency: (keystrokes: Keystroke[]) => number
}

const initialStats: LiveStats = {
  wpm: 0,
  rawWpm: 0,
  cpm: 0,
  rawCpm: 0,
  accuracy: 100,
  consistency: 100,
  timeElapsed: 0,
  charactersTyped: 0,
  errorsCount: 0
}

// 메모이제이션된 계산 함수들
const memoizedCalculateKoreanStrokeCPM = memoize(calculateKoreanStrokeCPM, (text: string, minutes: number, accuracy?: number) => `cpm-${text.length}-${minutes.toFixed(2)}-${(accuracy ?? 1).toFixed(2)}`);
const memoizedCalculateKoreanStrokeWPM = memoize(calculateKoreanStrokeWPM, (text: string, minutes: number, accuracy?: number) => `wpm-${text.length}-${minutes.toFixed(2)}-${(accuracy ?? 1).toFixed(2)}`);
const memoizedContainsKorean = memoize(containsKorean, (text: string) => `korean-${text || ''}`);
const memoizedAnalyzeTextStrokes = memoize(analyzeTextStrokes, (text: string) => `strokes-${text || ''}`);

export const useStatsStore = create<StatsStore>((set) => {
  const store = {
  liveStats: initialStats,

  // 실시간 통계 계산 (스트로크 기반 개선된 버전)
  calculateStats: (keystrokes: Keystroke[], mistakes: Mistake[], startTime: Date | null, currentIndex = 0, currentTime = new Date(), textType: TextType = 'words', currentText = '', userInput = '', firstKeystrokeTime: Date | null | undefined = null) => {
    // 🎯 몽키타입 스타일: 첫 키 입력 시점부터 계산
    const actualStartTime = firstKeystrokeTime || startTime
    
    if (!actualStartTime) {
      set({ liveStats: initialStats })
      return
    }

    // 🎯 실제 타이핑 시간만 계산 (카운트다운 제외)
    const timeElapsed = (currentTime.getTime() - actualStartTime.getTime()) / 1000 // 초 단위
    
    // 0.5초 이상부터 통계 계산 (더 빠른 피드백)
    if (timeElapsed < 0.5) {
      return
    }

    const minutes = timeElapsed / 60
    
    // 키스트로크 및 오타 기본 통계
    const keystrokesCount = keystrokes.length
    const mistakeCount = mistakes.length
    const correctKeystrokes = keystrokes.filter(k => k.correct).length
    const accuracyRate = keystrokesCount > 0 ? correctKeystrokes / keystrokesCount : 1

    // 🔥 실제 입력한 모든 키스트로크 기준으로 계산 (오타 포함)
    const actualUserInput = userInput || currentText.substring(0, currentIndex)
    
    let cpm = 0
    let rawCpm = 0
    let wpm = 0
    let rawWpm = 0

    // 한글 포함 여부에 따른 CPM/WPM 계산 방식 분기 (원본 텍스트 기준 판단)
    if (memoizedContainsKorean(currentText)) {
      // 🇰🇷 한글 스트로크 기반 계산 (완성된 부분만, 정확한 스트로크 계산)
      const completedText = currentText.substring(0, currentIndex)
      rawCpm = memoizedCalculateKoreanStrokeCPM(completedText, minutes, 1.0) // 정확도 보정 없음
      cpm = memoizedCalculateKoreanStrokeCPM(completedText, minutes, accuracyRate) // 약간의 정확도 보정만
      rawWpm = memoizedCalculateKoreanStrokeWPM(completedText, minutes, 1.0)
      wpm = memoizedCalculateKoreanStrokeWPM(completedText, minutes, accuracyRate)

      
    } else {
      // 🌍 영문/기타 언어 기존 계산 방식
      rawCpm = minutes > 0 ? Math.round(keystrokesCount / minutes) : 0
      cpm = Math.round(rawCpm * Math.max(0.85, accuracyRate))
      rawWpm = minutes > 0 ? Math.round(currentIndex / 5 / minutes) : 0
      wpm = Math.round(rawWpm * Math.max(0.85, accuracyRate))
    }
    
    // 정확도 계산 (키스트로크 기준)
    const accuracy = keystrokesCount > 0 ? 
      Math.round((correctKeystrokes / keystrokesCount) * 100) : 100

    // 일관성 계산 (키스트로크 기준)
    const mistakeRate = keystrokesCount > 0 ? mistakeCount / keystrokesCount : 0
    const consistency = Math.round(100 - (mistakeRate * 60)) // 실수 영향 완화

    // 언어 감지: 원본 텍스트 기준으로 판단
    const isKoreanText = memoizedContainsKorean(currentText)
    console.log(`🚀 월급루팡 통계 (${isKoreanText ? '한글' : '영문'}, ${textType}):`, {
      timeElapsed: timeElapsed.toFixed(2),
      completedChars: currentIndex,
      keystrokesCount,
      correctKeystrokes,
      mistakes: mistakeCount,
      rawCpm, cpm, rawWpm, wpm,
      accuracyRate: (accuracyRate * 100).toFixed(1) + '%',
      accuracy,
      consistency
    })

    set({
      liveStats: {
        wpm: Math.max(0, wpm),
        rawWpm: Math.max(0, rawWpm),
        cpm: Math.max(0, cpm),
        rawCpm: Math.max(0, rawCpm),
        accuracy: Math.max(0, Math.min(100, accuracy)),
        consistency: Math.max(0, Math.min(100, consistency)),
        timeElapsed,
        charactersTyped: keystrokesCount,
        errorsCount: mistakeCount
      }
    })
  },

  resetStats: () => {
    set({ liveStats: initialStats })
  },

  // WPM 계산 (스트로크 기반 개선된 방식)
  calculateWPM: (keystrokes: Keystroke[], timeElapsed: number, _textType: TextType = 'words', completedText = '') => {
    if (timeElapsed === 0 || keystrokes.length === 0) return 0
    
    const correctCharacters = keystrokes.filter(k => k.correct).length
    const accuracyRate = correctCharacters / keystrokes.length
    const minutes = timeElapsed / 60
    
    if (minutes <= 0) return 0
    
    // 한글 포함 시 스트로크 기반 계산 (메모이제이션 적용)
    if (memoizedContainsKorean(completedText)) {
      return memoizedCalculateKoreanStrokeWPM(completedText, minutes, accuracyRate)
    }
    
    // 영문의 경우 기존 방식 (5타 = 1단어)
    const rawWpm = Math.round(keystrokes.length / 5 / minutes)
    return Math.round(rawWpm * Math.max(0.85, accuracyRate))
  },

  // Raw WPM 계산 (오타 포함)
  calculateRawWPM: (keystrokes: Keystroke[], timeElapsed: number) => {
    if (timeElapsed === 0) return 0
    
    const totalCharacters = keystrokes.length
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(totalCharacters / 5 / minutes) : 0
  },

  // CPM 계산 (스트로크 기반 개선된 방식)
  calculateCPM: (keystrokes: Keystroke[], timeElapsed: number, completedText = '') => {
    if (timeElapsed === 0 || keystrokes.length === 0) return 0
    
    const correctCharacters = keystrokes.filter(k => k.correct).length
    const accuracyRate = correctCharacters / keystrokes.length
    const minutes = timeElapsed / 60
    
    if (minutes <= 0) return 0
    
    // 한글 포함 시 스트로크 기반 계산 (메모이제이션 적용)
    if (memoizedContainsKorean(completedText)) {
      return memoizedCalculateKoreanStrokeCPM(completedText, minutes, accuracyRate)
    }
    
    // 영문의 경우 기존 방식
    const rawCpm = Math.round(keystrokes.length / minutes)
    return Math.round(rawCpm * Math.max(0.85, accuracyRate))
  },

  // 정확도 계산
  calculateAccuracy: (keystrokes: Keystroke[]) => {
    if (keystrokes.length === 0) return 100
    
    const correctCount = keystrokes.filter(k => k.correct).length
    return Math.max(0, Math.min(100, Math.round((correctCount / keystrokes.length) * 100)))
  },

  // 일관성 계산
  calculateConsistency: (keystrokes: Keystroke[]) => {
    if (keystrokes.length < 10) return 100
    
    // 간단한 일관성 계산: 정확한 타이핑의 비율
    const correctCount = keystrokes.filter(k => k.correct).length
    return Math.max(0, Math.min(100, Math.round((correctCount / keystrokes.length) * 100)))
  }
}

  return store
})

// 🚨 긴급: 이벤트 버스 리스너 완전 비활성화 (사이트 벽돌 방지)
// 이벤트 버스 리스너 완전 비활성화 (사이트 벽돌 방지)
if (false && typeof window !== 'undefined') {

  // EventBus 제거로 비활성화
  // const registerEventListeners = () => {
  //   if (isListenersRegistered) return;
  //   isListenersRegistered = true;

  //   eventBus.on('stats:update', (data) => {
  //     const { calculateStats } = useStatsStore.getState();
  //     calculateStats(
  //       data.keystrokes,
  //       data.mistakes,
  //       data.startTime,
  //       data.currentIndex,
  //       data.currentTime,
  //       data.textType,
  //       data.currentText,
  //       data.userInput,
  //       data.firstKeystrokeTime
  //     );
  //   });

  //   eventBus.on('test:completed', async (data) => {
  //     const { calculateStats } = useStatsStore.getState();
      
  //     // 최종 통계 계산
  //     calculateStats(
  //       data.keystrokes,
  //       data.mistakes,
  //       data.startTime,
  //       data.currentIndex,
  //       data.currentTime,
  //       data.textType,
  //       data.currentText,
  //       data.userInput,
  //       data.firstKeystrokeTime
  //     );

  //     // 🔥 구조 개선: recordTest는 TestCompletionHandler에서만 처리
  //     // statsStore는 통계 계산만 담당 (단일 책임 원칙)
  //     console.log('📊 StatsStore: 통계 계산 완료 - 저장은 TestCompletionHandler에서 처리');
  //   });
  // };

  // EventBus 제거로 비활성화
  // // DOM이 로드된 후 리스너 등록
  // if (document.readyState === 'loading') {
  //   document.addEventListener('DOMContentLoaded', registerEventListeners);
  // } else {
  //   registerEventListeners();
  // }
}