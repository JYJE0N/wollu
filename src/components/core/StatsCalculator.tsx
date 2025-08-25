'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { useStatsStore } from '@/stores/statsStore'

interface StatsCalculatorProps {
  className?: string
}

export function StatsCalculator({ className = '' }: StatsCalculatorProps) {
  const { 
    isActive, 
    startTime, 
    completedWords,
    textWords
  } = useTypingStore()
  
  const { 
    liveStats 
  } = useStatsStore()

  const [progress, setProgress] = useState(0)

  // 진행률 계산
  const progressPercentage = useMemo(() => {
    if (!isActive || !startTime) return 0
    
    // 단어 기반 진행률 계산
    const totalWords = textWords.length
    if (totalWords > 0) {
      return Math.min((completedWords / totalWords) * 100, 100)
    }
    
    return 0
  }, [isActive, startTime, completedWords, textWords.length])

  useEffect(() => {
    setProgress(progressPercentage)
  }, [progressPercentage])

  // 원형 프로그레스 바 계산
  const circumference = 2 * Math.PI * 45 // 반지름 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`stats-calculator ${className}`}>
      {/* 모바일용 컴팩트 레이아웃 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl backdrop-blur-xl border"
             style={{
               backgroundColor: 'var(--color-surface)',
               borderColor: 'var(--color-border)'
             }}>
          
          {/* 원형 프로그레스 */}
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16" width="64" height="64">
              <circle
                cx="32"
                cy="32"
                r="24"
                stroke="var(--color-border)"
                strokeWidth="3"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="32"
                cy="32"
                r="24"
                stroke="var(--color-interactive-primary)"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 ease-out"
                style={{ strokeLinecap: 'round' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" 
                    style={{ color: 'var(--color-text-primary)' }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="flex-1 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold" 
                   style={{ color: 'var(--color-interactive-primary)' }}>
                {Math.round(liveStats.cpm)}
              </div>
              <div className="text-xs opacity-70" 
                   style={{ color: 'var(--color-text-secondary)' }}>
                CPM
              </div>
            </div>
            <div>
              <div className="text-lg font-bold" 
                   style={{ color: 'var(--color-interactive-secondary)' }}>
                {Math.round(liveStats.accuracy)}%
              </div>
              <div className="text-xs opacity-70" 
                   style={{ color: 'var(--color-text-secondary)' }}>
                정확도
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱용 확장 레이아웃 */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 메인 진행률 */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center p-6 rounded-3xl backdrop-blur-xl border"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 borderColor: 'var(--color-border)'
               }}>
            <div className="relative w-24 h-24 mb-4">
              <svg className="transform -rotate-90 w-24 h-24" width="96" height="96">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="var(--color-border)"
                  strokeWidth="4"
                  fill="transparent"
                  className="opacity-20"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="var(--color-interactive-primary)"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 - (progress / 100) * (2 * Math.PI * 36)}
                  className="transition-all duration-500 ease-out"
                  style={{ strokeLinecap: 'round' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" 
                      style={{ color: 'var(--color-text-primary)' }}>
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <span className="text-sm font-medium" 
                  style={{ color: 'var(--color-text-secondary)' }}>
              진행률
            </span>
          </div>

          {/* CPM */}
          <div className="p-6 rounded-3xl backdrop-blur-xl border text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 borderColor: 'var(--color-border)'
               }}>
            <div className="text-3xl font-bold mb-2" 
                 style={{ color: 'var(--color-interactive-primary)' }}>
              {Math.round(liveStats.cpm)}
            </div>
            <div className="text-sm font-medium mb-1" 
                 style={{ color: 'var(--color-text-secondary)' }}>
              CPM
            </div>
            {liveStats.rawCpm > 0 && (
              <div className="text-xs opacity-60" 
                   style={{ color: 'var(--color-text-tertiary)' }}>
                원시: {Math.round(liveStats.rawCpm)}
              </div>
            )}
          </div>

          {/* 정확도 */}
          <div className="p-6 rounded-3xl backdrop-blur-xl border text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 borderColor: 'var(--color-border)'
               }}>
            <div className="text-3xl font-bold mb-2" 
                 style={{ color: 'var(--color-feedback-success)' }}>
              {Math.round(liveStats.accuracy)}%
            </div>
            <div className="text-sm font-medium" 
                 style={{ color: 'var(--color-text-secondary)' }}>
              정확도
            </div>
          </div>

          {/* 일관성 */}
          <div className="p-6 rounded-3xl backdrop-blur-xl border text-center"
               style={{
                 backgroundColor: 'var(--color-surface)',
                 borderColor: 'var(--color-border)'
               }}>
            <div className="text-3xl font-bold mb-2" 
                 style={{ color: 'var(--color-interactive-secondary)' }}>
              {Math.round(liveStats.consistency)}%
            </div>
            <div className="text-sm font-medium" 
                 style={{ color: 'var(--color-text-secondary)' }}>
              일관성
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}