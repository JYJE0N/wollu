import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TypingStats, DetailedStats, MistakeAnalysis } from '@/types';

interface StatsStore {
  // Current stats
  currentStats: TypingStats;
  detailedStats: DetailedStats | null;
  isCalculating: boolean;
  
  // Actions
  updateStats: (stats: Partial<TypingStats>) => void;
  calculateStats: (keystrokes: any[], mistakes: any[], duration: number, text: string) => void;
  calculateDetailedStats: (keystrokes: any[], mistakes: any[], duration: number, text: string) => void;
  resetStats: () => void;
  
  // Computed values
  getAccuracyColor: () => string;
  getSpeedCategory: () => string;
  getPerformanceRating: () => string;
}

const initialStats: TypingStats = {
  wpm: 0,
  cpm: 0,
  accuracy: 100,
  consistency: 100,
  errorRate: 0,
  duration: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  mistakeCount: 0,
};

export const useStatsStore = create<StatsStore>()(
  devtools(
    (set, get) => ({
      currentStats: initialStats,
      detailedStats: null,
      isCalculating: false,
      
      updateStats: (stats: Partial<TypingStats>) => {
        set(
          (state) => ({
            ...state,
            currentStats: { ...state.currentStats, ...stats },
          }),
          false,
          'updateStats'
        );
      },
      
      calculateStats: (keystrokes, mistakes, duration, text) => {
        set(
          (state) => ({ ...state, isCalculating: true }),
          false,
          'calculateStats:start'
        );
        
        try {
          const durationInMinutes = Math.max(duration / 60000, 0.1); // 최소 0.1분
          const totalKeystrokes = keystrokes.length;
          const correctKeystrokes = keystrokes.filter((k: any) => k.isCorrect).length;
          const mistakeCount = mistakes.length;
          
          // WPM 계산 (한글 특성 고려)
          const characterCount = text.length;
          const wordsTyped = characterCount / 5; // 표준 단어 길이 5자로 계산
          const wpm = Math.round(wordsTyped / durationInMinutes);
          
          // CPM 계산
          const cpm = Math.round(correctKeystrokes / durationInMinutes);
          
          // 정확도 계산
          const accuracy = totalKeystrokes > 0 
            ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
            : 100;
          
          // 에러율 계산
          const errorRate = totalKeystrokes > 0 
            ? Math.round((mistakeCount / totalKeystrokes) * 100)
            : 0;
          
          // 일관성 계산 (키 간격의 표준편차 기반)
          const consistency = calculateConsistency(keystrokes);
          
          const newStats: TypingStats = {
            wpm,
            cpm,
            accuracy,
            consistency,
            errorRate,
            duration,
            totalKeystrokes,
            correctKeystrokes,
            mistakeCount,
          };
          
          set(
            (state) => ({
              ...state,
              currentStats: newStats,
              isCalculating: false,
            }),
            false,
            'calculateStats:complete'
          );
        } catch (error) {
          console.error('Stats calculation error:', error);
          set(
            (state) => ({ ...state, isCalculating: false }),
            false,
            'calculateStats:error'
          );
        }
      },
      
      calculateDetailedStats: (keystrokes, mistakes, duration, text) => {
        const { currentStats } = get();
        
        try {
          // 문자별 정확도 분석
          const characterAccuracy = calculateCharacterAccuracy(keystrokes, text);
          
          // 속도 진행 분석
          const speedProgress = calculateSpeedProgress(keystrokes);
          
          // 실수 패턴 분석
          const mistakeAnalysis = analyzeMistakes(mistakes, text);
          
          // 난이도 점수 계산
          const difficultyScore = calculateDifficultyScore(text);
          
          const detailedStats: DetailedStats = {
            ...currentStats,
            characterAccuracy,
            speedProgress,
            mistakeAnalysis,
            difficultyScore,
          };
          
          set(
            (state) => ({ ...state, detailedStats }),
            false,
            'calculateDetailedStats'
          );
        } catch (error) {
          console.error('Detailed stats calculation error:', error);
        }
      },
      
      resetStats: () => {
        set(
          {
            currentStats: initialStats,
            detailedStats: null,
            isCalculating: false,
          },
          false,
          'resetStats'
        );
      },
      
      // Computed values
      getAccuracyColor: () => {
        const { accuracy } = get().currentStats;
        if (accuracy >= 95) return 'text-green-500';
        if (accuracy >= 85) return 'text-yellow-500';
        return 'text-red-500';
      },
      
      getSpeedCategory: () => {
        const { wpm } = get().currentStats;
        if (wpm >= 80) return 'Expert';
        if (wpm >= 60) return 'Advanced';
        if (wpm >= 40) return 'Intermediate';
        if (wpm >= 20) return 'Beginner';
        return 'Learning';
      },
      
      getPerformanceRating: () => {
        const { wpm, accuracy } = get().currentStats;
        const score = (wpm * 0.7) + (accuracy * 0.3);
        
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Average';
        if (score >= 40) return 'Below Average';
        return 'Needs Improvement';
      },
    }),
    {
      name: 'stats-store',
    }
  )
);

// Helper functions
function calculateConsistency(keystrokes: any[]): number {
  if (keystrokes.length < 2) return 100;
  
  const intervals = [];
  for (let i = 1; i < keystrokes.length; i++) {
    intervals.push(keystrokes[i].timestamp - keystrokes[i - 1].timestamp);
  }
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  
  // 일관성을 백분율로 변환 (낮은 표준편차 = 높은 일관성)
  const consistency = Math.max(0, 100 - (standardDeviation / avgInterval * 100));
  return Math.round(consistency);
}

function calculateCharacterAccuracy(keystrokes: any[], text: string): Record<string, number> {
  const characterStats: Record<string, { correct: number; total: number }> = {};
  
  keystrokes.forEach((keystroke) => {
    const char = text[keystroke.position];
    if (char) {
      if (!characterStats[char]) {
        characterStats[char] = { correct: 0, total: 0 };
      }
      characterStats[char].total++;
      if (keystroke.isCorrect) {
        characterStats[char].correct++;
      }
    }
  });
  
  const accuracy: Record<string, number> = {};
  Object.entries(characterStats).forEach(([char, stats]) => {
    accuracy[char] = Math.round((stats.correct / stats.total) * 100);
  });
  
  return accuracy;
}

function calculateSpeedProgress(keystrokes: any[]): Array<{ timestamp: number; wpm: number }> {
  const progress = [];
  const windowSize = 10; // 10개 키스트로크마다 WPM 계산
  
  for (let i = windowSize; i < keystrokes.length; i += windowSize) {
    const window = keystrokes.slice(i - windowSize, i);
    const timeSpan = window[window.length - 1].timestamp - window[0].timestamp;
    const wpm = timeSpan > 0 ? Math.round((windowSize / 5) / (timeSpan / 60000)) : 0;
    
    progress.push({
      timestamp: window[window.length - 1].timestamp,
      wpm,
    });
  }
  
  return progress;
}

function analyzeMistakes(mistakes: any[], text: string): MistakeAnalysis {
  if (mistakes.length === 0) {
    return {
      mostCommonMistakes: [],
      mistakePattern: 'No mistakes detected',
      improvementSuggestions: ['Great job! Keep practicing to maintain accuracy.'],
    };
  }
  
  // 가장 많은 실수 문자 분석
  const mistakeCount: Record<string, number> = {};
  mistakes.forEach((mistake) => {
    const char = mistake.expected;
    mistakeCount[char] = (mistakeCount[char] || 0) + 1;
  });
  
  const mostCommonMistakes = Object.entries(mistakeCount)
    .map(([character, count]) => ({
      character,
      count,
      accuracy: Math.round((1 - count / text.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // 실수 패턴 분석
  const mistakePattern = analyzeMistakePattern(mistakes);
  
  // 개선 제안
  const improvementSuggestions = generateImprovementSuggestions(mostCommonMistakes, mistakePattern);
  
  return {
    mostCommonMistakes,
    mistakePattern,
    improvementSuggestions,
  };
}

function analyzeMistakePattern(mistakes: any[]): string {
  // 실수 패턴을 분석하여 사용자의 약점 파악
  const patterns = [];
  
  if (mistakes.length > mistakes.length * 0.3) {
    patterns.push('High error rate detected');
  }
  
  // 연속 실수 패턴 검사
  let consecutiveErrors = 0;
  let maxConsecutive = 0;
  
  for (let i = 1; i < mistakes.length; i++) {
    if (mistakes[i].position - mistakes[i - 1].position === 1) {
      consecutiveErrors++;
    } else {
      maxConsecutive = Math.max(maxConsecutive, consecutiveErrors);
      consecutiveErrors = 0;
    }
  }
  maxConsecutive = Math.max(maxConsecutive, consecutiveErrors);
  
  if (maxConsecutive > 2) {
    patterns.push('Consecutive typing errors detected');
  }
  
  return patterns.length > 0 ? patterns.join(', ') : 'Random typing errors';
}

function generateImprovementSuggestions(mistakes: any[], pattern: string): string[] {
  const suggestions = [];
  
  if (mistakes.length > 0) {
    const topMistake = mistakes[0];
    suggestions.push(`Focus on practicing the '${topMistake.character}' key`);
  }
  
  if (pattern.includes('High error rate')) {
    suggestions.push('Slow down and focus on accuracy over speed');
  }
  
  if (pattern.includes('Consecutive')) {
    suggestions.push('Take breaks between practice sessions to maintain focus');
  }
  
  suggestions.push('Practice finger positioning exercises');
  
  return suggestions;
}

function calculateDifficultyScore(text: string): number {
  let score = 0;
  
  // 텍스트 길이 점수
  score += Math.min(text.length / 10, 20);
  
  // 특수 문자 점수
  const specialChars = text.match(/[^\w\s가-힣]/g) || [];
  score += specialChars.length * 2;
  
  // 대소문자 변화 점수
  const caseChanges = text.match(/[a-z][A-Z]|[A-Z][a-z]/g) || [];
  score += caseChanges.length;
  
  // 숫자 점수
  const numbers = text.match(/\d/g) || [];
  score += numbers.length;
  
  return Math.min(Math.round(score), 100);
}