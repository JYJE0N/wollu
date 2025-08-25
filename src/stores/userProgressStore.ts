'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import type { TypingSession, TestMode, TextType } from '@/types'

interface TestRecord {
  id: string
  date: Date
  mode: TestMode
  textType: TextType
  language: string
  duration: number
  wordsTyped: number
  cpm: number
  wpm: number
  accuracy: number
  consistency: number
  mistakes: number
  keystrokes: number
}

interface CharacterStats {
  char: string
  totalAttempts: number
  mistakes: number
  averageTime: number
}

interface UserProgress {
  // 최고 기록
  bestCPM: number
  bestWPM: number
  bestAccuracy: number
  bestConsistency: number
  
  // 누적 통계
  totalTests: number
  totalTime: number
  totalWords: number
  totalKeystrokes: number
  totalMistakes: number
  
  // 평균 통계
  averageCPM: number
  averageWPM: number
  averageAccuracy: number
  averageConsistency: number
  
  // 향상도 추적
  improvementTrend: number[] // 최근 10개 테스트의 WPM
  lastTestDate: Date | null
  
  // 약점 분석
  weakCharacters: CharacterStats[]
  commonMistakes: Array<{ wrong: string; correct: string; count: number }>
  
  // 테스트 기록
  recentTests: TestRecord[]
  
  // 스트릭 (연속 일수)
  currentStreak: number
  longestStreak: number
  lastStreakDate: Date | null
  
  // 추가 통계
  improvementRate: number // 향상도 퍼센트
  totalPracticeTime: number // 총 연습 시간 (초)
  averageSpeed: number // 평균 속도 (CPM)
  ranking: number // 상위 몇 퍼센트
  
  // 마지막 테스트 결과 (TestResultChart용)
  lastTestResult: {
    cpm: number
    wpm: number
    accuracy: number
    timeElapsed: number
    mistakes: Array<{position: number, expected: string, actual: string}>
    targetText: string
    userInput: string
  } | null
}

interface UserProgressStore extends UserProgress {
  // User ID
  userId: string | null
  isLoading: boolean
  error: string | null
  
  // 중복 저장 방지를 위한 락
  isRecording: boolean
  lastRecordTime: number
  
  // Actions
  initializeUser: () => Promise<void>
  fetchProgress: () => Promise<void>
  recordTest: (session: TypingSession) => Promise<void>
  updateCharacterStats: (char: string, isCorrect: boolean, time: number) => void
  updateMistakePattern: (wrong: string, correct: string) => void
  syncWithServer: () => Promise<void>
  resetProgress: () => Promise<void>
  getWeakestCharacters: (limit?: number) => CharacterStats[]
  getImprovementRate: () => number
  updateStreak: () => void
}

const initialState: UserProgress = {
  bestCPM: 0,
  bestWPM: 0,
  bestAccuracy: 0,
  bestConsistency: 0,
  totalTests: 0,
  totalTime: 0,
  totalWords: 0,
  totalKeystrokes: 0,
  totalMistakes: 0,
  averageCPM: 0,
  averageWPM: 0,
  averageAccuracy: 0,
  averageConsistency: 0,
  improvementTrend: [],
  lastTestDate: null,
  weakCharacters: [],
  commonMistakes: [],
  recentTests: [],
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDate: null,
  improvementRate: 0,
  totalPracticeTime: 0,
  averageSpeed: 0,
  ranking: 0,
  lastTestResult: null,
}

const API_BASE = '/api/progress'

export const useUserProgressStore = create<UserProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      userId: null,
      isLoading: false,
      error: null,
      
      // 🔐 중복 저장 방지 초기값
      isRecording: false,
      lastRecordTime: 0,

      initializeUser: async () => {
        const state = get()
        
        // SSR 안전성: localStorage 접근 전 클라이언트 환경 확인
        if (typeof window === 'undefined') {
          console.warn('initializeUser called on server-side, skipping')
          return
        }

        // 💾 이미 userId가 있고 데이터도 있으면 재초기화 스킵
        if (state.userId && state.totalTests > 0) {
          console.log('🔄 User already initialized with data, skipping')
          return
        }

        // localStorage에서 userId 확인 또는 새로 생성
        let userId: string | null = null
        try {
          userId = localStorage.getItem('ktypes-user-id')
          console.log('📱 localStorage userId:', userId)
        } catch (error) {
          console.warn('localStorage not available:', error)
        }
        
        if (!userId) {
          try {
            const response = await axios.get(API_BASE)
            userId = response.data.userId
            console.log('🌐 Server userId:', userId)
            try {
              localStorage.setItem('ktypes-user-id', userId || '')
            } catch (error) {
              console.warn('localStorage write failed:', error)
            }
          } catch (error) {
            console.error('Failed to initialize user:', error)
            // 오프라인 모드일 때 임시 ID 생성
            userId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            console.log('🔌 Offline userId:', userId)
            try {
              localStorage.setItem('ktypes-user-id', userId || '')
              console.log('✅ 오프라인 userId localStorage에 저장됨:', userId)
            } catch (error) {
              console.warn('localStorage write failed:', error)
            }
          }
        }

        // userId 설정
        set({ userId })
        console.log('👤 User ID set:', userId)
        
        // 서버에서 진행률 가져오기 (있으면)
        await get().fetchProgress()
      },

      fetchProgress: async () => {
        const state = get()
        const { userId } = state
        if (!userId) {
          console.log('❌ fetchProgress: No userId')
          return
        }

        set({ isLoading: true, error: null })

        try {
          const response = await axios.get(API_BASE, {
            params: { userId }
          })

          if (response.data.progress) {
            const serverProgress = response.data.progress
            const localProgress = state
            
            // 🔄 로컬과 서버 데이터 병합 (최신 것 우선)
            const mergedProgress = {
              bestCPM: Math.max(serverProgress.bestCPM || 0, localProgress.bestCPM || 0),
              bestWPM: Math.max(serverProgress.bestWPM || 0, localProgress.bestWPM || 0),
              bestAccuracy: Math.max(serverProgress.bestAccuracy || 0, localProgress.bestAccuracy || 0),
              bestConsistency: Math.max(serverProgress.bestConsistency || 0, localProgress.bestConsistency || 0),
              totalTests: Math.max(serverProgress.totalTests || 0, localProgress.totalTests || 0),
              totalTime: Math.max(serverProgress.totalTime || 0, localProgress.totalTime || 0),
              totalWords: Math.max(serverProgress.totalWords || 0, localProgress.totalWords || 0),
              totalKeystrokes: Math.max(serverProgress.totalKeystrokes || 0, localProgress.totalKeystrokes || 0),
              totalMistakes: serverProgress.totalMistakes || localProgress.totalMistakes || 0,
              averageCPM: serverProgress.averageCPM || localProgress.averageCPM || 0,
              averageWPM: serverProgress.averageWPM || localProgress.averageWPM || 0,
              averageAccuracy: serverProgress.averageAccuracy || localProgress.averageAccuracy || 0,
              averageConsistency: serverProgress.averageConsistency || localProgress.averageConsistency || 0,
              improvementTrend: serverProgress.improvementTrend || localProgress.improvementTrend || [],
              lastTestDate: serverProgress.lastTestDate ? new Date(serverProgress.lastTestDate) : (localProgress.lastTestDate || null),
              weakCharacters: serverProgress.weakCharacters || localProgress.weakCharacters || [],
              commonMistakes: serverProgress.commonMistakes || localProgress.commonMistakes || [],
              recentTests: serverProgress.recentTests || localProgress.recentTests || [],
              currentStreak: Math.max(serverProgress.currentStreak || 0, localProgress.currentStreak || 0),
              longestStreak: Math.max(serverProgress.longestStreak || 0, localProgress.longestStreak || 0),
              lastStreakDate: serverProgress.lastStreakDate ? new Date(serverProgress.lastStreakDate) : (localProgress.lastStreakDate || null),
            }
            
            set(mergedProgress)
            console.log('🔄 Progress merged from server:', mergedProgress)
          }
        } catch (_error) {
          // API 에러 시 로컬 스토리지 데이터 유지
          console.log('📱 Using localStorage data only - API not available')
          set({ error: null })  // 에러 메시지 표시 안함
        } finally {
          set({ isLoading: false })
        }
      },

      recordTest: async (session: TypingSession) => {
        const currentTime = Date.now();
        const state = get();
        
        // 🔐 중복 호출 방지: 이미 처리 중이거나 1초 이내 재호출
        if (state.isRecording || (currentTime - state.lastRecordTime < 1000)) {
          console.log('⚠️ UserProgressStore: 중복 recordTest 호출 차단');
          return;
        }

        // 🔐 처리 시작
        set({ isRecording: true, lastRecordTime: currentTime });

        try {
          // 실제 타이핑한 단어 수 계산 (현재 위치 기반)
          const actualWordsTyped = Math.max(1, Math.ceil(session.keystrokes.length / 5))
          
          // newRecord를 먼저 생성
          const newRecord: TestRecord = {
            id: session.id || `test-${currentTime}`,
            date: new Date(),
            mode: session.mode,
            textType: session.textType,
            language: session.language,
            duration: session.duration || 0,
            wordsTyped: actualWordsTyped,
            cpm: session.cpm,
            wpm: session.wpm,
            accuracy: session.accuracy,
            consistency: session.consistency || 0,
            mistakes: session.mistakes.length,
            keystrokes: session.keystrokes.length,
          }

        set((state) => {
          // 최근 테스트 기록 업데이트 (최대 50개 유지)
          const recentTests = [newRecord, ...state.recentTests].slice(0, 50)

          // 최고 기록 업데이트
          const bestCPM = Math.max(state.bestCPM, session.cpm)
          const bestWPM = Math.max(state.bestWPM, session.wpm)
          const bestAccuracy = Math.max(state.bestAccuracy, session.accuracy)
          const bestConsistency = Math.max(state.bestConsistency, session.consistency || 0)

          // 누적 통계 업데이트
          const totalTests = state.totalTests + 1
          const totalTime = state.totalTime + (session.duration || 0)
          const totalWords = state.totalWords + Math.max(1, Math.floor((session.keystrokes.filter(k => k.correct).length + 1) / 5))
          const totalKeystrokes = state.totalKeystrokes + session.keystrokes.length
          const totalMistakes = state.totalMistakes + session.mistakes.length

          // 평균 통계 계산
          const averageCPM = totalTime > 0 ? totalKeystrokes / (totalTime / 60) : 0
          const averageWPM = totalTime > 0 ? totalWords / (totalTime / 60) : 0
          const averageAccuracy = totalKeystrokes > 0 ? ((totalKeystrokes - totalMistakes) / totalKeystrokes) * 100 : 0
          const averageConsistency = recentTests.length > 0 ? recentTests.reduce((sum, t) => sum + t.consistency, 0) / recentTests.length : 0

          // 향상도 추적 업데이트 (최근 10개)
          const improvementTrend = [session.wpm, ...state.improvementTrend].slice(0, 10)

          // 향상도 계산
          const improvementRate = (() => {
            if (improvementTrend.length < 2) return 0
            const recent = improvementTrend.slice(0, Math.min(5, improvementTrend.length))
            const older = improvementTrend.slice(Math.min(5, improvementTrend.length))
            if (older.length === 0) return 0
            const recentAvg = recent.reduce((sum, wpm) => sum + wpm, 0) / recent.length
            const olderAvg = older.reduce((sum, wpm) => sum + wpm, 0) / older.length
            return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
          })()

          // 인사이트 섹션용 데이터 계산
          const totalPracticeTime = totalTime // 총 연습시간 (초)
          const averageSpeed = Math.round(averageCPM) // 평균 타수 (CPM, 반올림)
          
          // 백분위 계산 (임시로 베스트 CPM 기반 계산)
          // 실제로는 전체 사용자 데이터와 비교해야 하지만, 여기서는 간단한 추정치 사용
          const ranking = (() => {
            if (bestCPM >= 400) return 95 // 상위 5%
            if (bestCPM >= 350) return 90 // 상위 10%
            if (bestCPM >= 300) return 80 // 상위 20%
            if (bestCPM >= 250) return 70 // 상위 30%
            if (bestCPM >= 200) return 60 // 상위 40%
            if (bestCPM >= 150) return 50 // 상위 50%
            if (bestCPM >= 100) return 40 // 상위 60%
            if (bestCPM >= 50) return 30  // 상위 70%
            return Math.max(10, Math.min(25, Math.round(bestCPM / 2))) // 최소 10%, 최대 25%
          })()

          // 마지막 테스트 결과 저장 (TestResultChart용)
          const lastTestResult = {
            cpm: session.cpm,
            wpm: session.wpm,
            accuracy: session.accuracy,
            timeElapsed: session.duration || 0,
            mistakes: session.mistakes.map(m => ({
              position: m.position,
              expected: m.expected,
              actual: m.actual
            })),
            targetText: session.targetText || '',
            userInput: session.userInput || ''
          }

          return {
            ...state,
            bestCPM,
            bestWPM,
            bestAccuracy,
            bestConsistency,
            totalTests,
            totalTime,
            totalWords,
            totalKeystrokes,
            totalMistakes,
            averageCPM,
            averageWPM,
            averageAccuracy,
            averageConsistency,
            improvementTrend,
            lastTestDate: new Date(),
            recentTests,
            improvementRate,
            totalPracticeTime,
            averageSpeed,
            ranking,
            lastTestResult,
          }
        })

        // 스트릭 업데이트
        get().updateStreak()

          // 서버에 저장 (오프라인 모드에서도 로컬 저장은 완료됨)
          const currentState = get();
          const { userId } = currentState;
          if (userId && !userId.startsWith('offline-')) {
            try {
              await axios.post(API_BASE, {
                userId,
                testRecord: newRecord
              })
              console.log('✅ UserProgressStore: 서버 저장 완료');
            } catch (error) {
              console.error('❌ UserProgressStore: 서버 저장 실패', error);
              // 서버 저장 실패해도 로컬은 유지
            }
          } else {
            console.log('📱 UserProgressStore: 오프라인 모드 - localStorage 저장만 수행');
          }

          console.log('✅ UserProgressStore: recordTest 완료');

        } catch (error) {
          console.error('❌ UserProgressStore: recordTest 실패', error);
          throw error;
        } finally {
          // 🔐 처리 완료 (락 해제)
          set({ isRecording: false });
        }
      },

      updateCharacterStats: (char: string, isCorrect: boolean, time: number) => {
        set((state) => {
          const weakCharacters = [...state.weakCharacters]
          const existingIndex = weakCharacters.findIndex(c => c.char === char)

          if (existingIndex >= 0) {
            const stats = weakCharacters[existingIndex]
            stats.totalAttempts++
            if (!isCorrect) stats.mistakes++
            stats.averageTime = (stats.averageTime * (stats.totalAttempts - 1) + time) / stats.totalAttempts
          } else {
            weakCharacters.push({
              char,
              totalAttempts: 1,
              mistakes: isCorrect ? 0 : 1,
              averageTime: time,
            })
          }

          // 실수율이 높은 순으로 정렬
          weakCharacters.sort((a, b) => {
            const errorRateA = a.mistakes / a.totalAttempts
            const errorRateB = b.mistakes / b.totalAttempts
            return errorRateB - errorRateA
          })

          return { ...state, weakCharacters: weakCharacters.slice(0, 50) } // 최대 50개 문자만 추적
        })
      },

      updateMistakePattern: (wrong: string, correct: string) => {
        set((state) => {
          const commonMistakes = [...state.commonMistakes]
          const existingIndex = commonMistakes.findIndex(
            m => m.wrong === wrong && m.correct === correct
          )

          if (existingIndex >= 0) {
            commonMistakes[existingIndex].count++
          } else {
            commonMistakes.push({ wrong, correct, count: 1 })
          }

          // 빈도 순으로 정렬
          commonMistakes.sort((a, b) => b.count - a.count)

          return { ...state, commonMistakes: commonMistakes.slice(0, 30) } // 최대 30개 패턴만 추적
        })
      },

      getWeakestCharacters: (limit = 10) => {
        const { weakCharacters } = get()
        return weakCharacters
          .filter(c => c.totalAttempts >= 5) // 최소 5번 이상 시도한 문자만
          .slice(0, limit)
      },

      getImprovementRate: () => {
        const { improvementTrend } = get()
        if (improvementTrend.length < 2) return 0

        const recent = improvementTrend.slice(0, 5)
        const older = improvementTrend.slice(5, 10)

        if (older.length === 0) return 0

        const recentAvg = recent.reduce((sum, wpm) => sum + wpm, 0) / recent.length
        const olderAvg = older.reduce((sum, wpm) => sum + wpm, 0) / older.length

        return ((recentAvg - olderAvg) / olderAvg) * 100
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const lastDate = state.lastStreakDate ? new Date(state.lastStreakDate) : null
          if (lastDate) lastDate.setHours(0, 0, 0, 0)

          let currentStreak = state.currentStreak
          let longestStreak = state.longestStreak

          if (!lastDate) {
            // 첫 번째 테스트
            currentStreak = 1
          } else {
            const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (dayDiff === 0) {
              // 같은 날 - 스트릭 유지
            } else if (dayDiff === 1) {
              // 연속된 날 - 스트릭 증가
              currentStreak++
            } else {
              // 연속이 끊김 - 스트릭 리셋
              currentStreak = 1
            }
          }

          longestStreak = Math.max(longestStreak, currentStreak)

          return {
            ...state,
            currentStreak,
            longestStreak,
            lastStreakDate: today,
          }
        })
      },

      syncWithServer: async () => {
        const state = get()
        const { userId } = state
        
        if (!userId || userId.startsWith('offline-')) return

        try {
          // 약점 분석 데이터 서버에 업데이트
          await axios.put(API_BASE, {
            userId,
            characterStats: state.weakCharacters,
            mistakePatterns: state.commonMistakes
          })
        } catch (error) {
          console.error('Failed to sync with server:', error)
        }
      },

      resetProgress: async () => {
        const { userId } = get()
        
        if (userId && !userId.startsWith('offline-')) {
          try {
            await axios.delete(`${API_BASE}?userId=${userId}`)
          } catch (error) {
            console.error('Failed to reset progress on server:', error)
          }
        }
        
        set(initialState)
      },
    }),
    {
      name: 'user-progress',
      partialize: (state) => ({
        // 🔐 중요: userId 포함하여 사용자 식별 유지
        userId: state.userId,
        
        // 기본 통계
        bestCPM: state.bestCPM,
        bestWPM: state.bestWPM,
        bestAccuracy: state.bestAccuracy,
        bestConsistency: state.bestConsistency,
        totalTests: state.totalTests,
        totalTime: state.totalTime,
        totalWords: state.totalWords,
        totalKeystrokes: state.totalKeystrokes,
        totalMistakes: state.totalMistakes,
        averageCPM: state.averageCPM,
        averageWPM: state.averageWPM,
        averageAccuracy: state.averageAccuracy,
        averageConsistency: state.averageConsistency,
        improvementTrend: state.improvementTrend,
        lastTestDate: state.lastTestDate,
        
        // 분석 데이터
        weakCharacters: state.weakCharacters,
        commonMistakes: state.commonMistakes,
        recentTests: state.recentTests,
        
        // 스트릭 데이터
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastStreakDate: state.lastStreakDate,
        
        // 인사이트 섹션 데이터 (누락되었던 부분)
        improvementRate: state.improvementRate,
        totalPracticeTime: state.totalPracticeTime,
        averageSpeed: state.averageSpeed,
        ranking: state.ranking,
        lastTestResult: state.lastTestResult,
      }),
    }
  )
)