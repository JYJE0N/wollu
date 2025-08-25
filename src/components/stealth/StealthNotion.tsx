"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTypingStore } from '@/stores/typingStore'
import { useStatsStore } from '@/stores/statsStore'
import { 
  FileText, 
  Share, 
  MoreHorizontal, 
  Plus, 
  ChevronRight,
  Search,
  Settings,
  BarChart3
} from 'lucide-react'

interface StealthNotionProps {
  className?: string
}

export function StealthNotion({ className = "" }: StealthNotionProps) {
  const router = useRouter()
  const { isActive, isCompleted, targetText, currentIndex, mistakes } = useTypingStore()
  const { liveStats } = useStatsStore()
  
  // 홈으로 돌아가기 핸들러
  const handleHomeNavigation = () => {
    router.push('/')
  }
  
  const [currentTime, setCurrentTime] = useState('')
  const [cursorBlink, setCursorBlink] = useState(true)
  
  // 실시간 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // 커서 깜박임 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])
  
  // 진행률 계산
  const completionRate = targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0
  
  // 노션 스타일 문서 내용
  const documentContent = `# 프로젝트 진행 보고서

📅 **작성일**: ${currentTime}
🏢 **부서**: 개발팀
👤 **작성자**: 김개발자

---

## 📊 현재 진행 상황

우리 팀의 이번 주 개발 진척도를 살펴보면 다음과 같습니다:

- **전체 진행률**: ${Math.round(completionRate)}%
- **작업 효율성**: 분당 ${liveStats.cpm}자 처리
- **품질 지표**: ${liveStats.accuracy}% 정확도 달성

## 🎯 주요 성과

### 개발 속도 향상
팀원들의 타이핑 속도가 크게 개선되었으며, 특히 문서 작성 업무에서 뛰어난 성과를 보이고 있습니다.

### 품질 관리
코드 리뷰와 문서 검토 과정에서 높은 정확도를 유지하고 있어 전반적인 프로젝트 품질이 상승했습니다.

## 📝 실시간 작업 현황

현재 다음 작업이 진행 중입니다:`

  // 실제 타이핑 텍스트를 문서에 자연스럽게 삽입
  const renderDocumentWithTyping = () => {
    const lines = documentContent.split('\n')
    
    return lines.map((line, index) => {
      // 실시간 작업 현황 섹션에서 타이핑 영역 삽입
      if (line.includes('현재 다음 작업이 진행 중입니다:') && (isActive || isCompleted)) {
        return (
          <div key={index}>
            <p className="mb-4" style={{ color: 'var(--color-text-primary)' }}>{line}</p>
            <div className="ml-6 p-4 rounded-lg my-4" 
              style={{ 
                backgroundColor: 'var(--color-background-elevated)',
                border: '1px solid var(--color-border)'
              }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  실시간 입력 중...
                </span>
              </div>
              <div className="font-mono text-sm p-3 rounded bg-white border" 
                style={{ backgroundColor: 'var(--color-surface)' }}>
                {targetText.split('').map((char, charIndex) => {
                  const isCurrentChar = charIndex === currentIndex
                  const isTyped = charIndex < currentIndex
                  const isIncorrect = mistakes.some(m => m.position === charIndex)
                  
                  return (
                    <span
                      key={charIndex}
                      className={
                        isTyped
                          ? isIncorrect 
                            ? 'text-red-600 bg-red-50'
                            : 'text-gray-800'
                          : isCurrentChar
                          ? `bg-blue-500 text-white ${cursorBlink ? 'opacity-100' : 'opacity-70'} px-0.5 rounded`
                          : 'text-gray-400'
                      }
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )
                })}
                {currentIndex >= targetText.length && (
                  <span className={`inline-block w-0.5 h-5 bg-blue-500 ml-1 ${cursorBlink ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                )}
              </div>
            </div>
          </div>
        )
      }
      
      if (line.startsWith('#')) {
        return (
          <h1 key={index} className="text-3xl font-bold mb-6 mt-8" style={{ color: 'var(--color-text-primary)' }}>
            {line.substring(1).trim()}
          </h1>
        )
      }
      
      if (line.startsWith('##')) {
        return (
          <h2 key={index} className="text-2xl font-semibold mb-4 mt-6" style={{ color: 'var(--color-text-primary)' }}>
            {line.substring(2).trim()}
          </h2>
        )
      }
      
      if (line.startsWith('###')) {
        return (
          <h3 key={index} className="text-xl font-medium mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>
            {line.substring(3).trim()}
          </h3>
        )
      }
      
      if (line.startsWith('---')) {
        return <hr key={index} className="my-6" style={{ borderColor: 'var(--color-border)' }} />
      }
      
      if (line.startsWith('- **')) {
        return (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-interactive-primary)' }} />
            <span style={{ color: 'var(--color-text-primary)' }}>{line.substring(2)}</span>
          </div>
        )
      }
      
      return (
        <p key={index} className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {line}
        </p>
      )
    })
  }

  return (
    <div className={`min-h-screen ${className}`} style={{ backgroundColor: 'var(--color-background)' }}>
      {/* 노션 스타일 헤더 */}
      <div className="flex items-center justify-between p-4" 
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="cursor-pointer transition-opacity hover:opacity-80" 
              onClick={handleHomeNavigation}
              title="홈으로 돌아가기"
            >
              <FileText className="w-6 h-6" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            <span 
              className="font-medium cursor-pointer transition-opacity hover:opacity-80" 
              style={{ color: 'var(--color-text-primary)' }}
              onClick={handleHomeNavigation}
              title="홈으로 돌아가기"
            >
              비즈니스 전략 문서
            </span>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            2024년 4분기 전략 보고서
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-gray-100" 
            style={{ color: 'var(--color-text-secondary)' }}>
            <Search className="w-4 h-4" />
          </button>
          
          {/* 숨겨진 통계 버튼 */}
          <button 
            className="p-2 rounded hover:bg-gray-100" 
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => router.push('/stats')}
            title="통계 보기"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded hover:bg-gray-100" 
            style={{ color: 'var(--color-text-secondary)' }}>
            <Share className="w-4 h-4" />
          </button>
          
          {/* 숨겨진 설정 버튼 */}
          <button className="p-2 rounded hover:bg-gray-100" 
            style={{ color: 'var(--color-text-secondary)' }}
            title="설정"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded hover:bg-gray-100" 
            style={{ color: 'var(--color-text-secondary)' }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            김
          </div>
        </div>
      </div>

      {/* 사이드바 */}
      <div className="flex">
        <div className="w-64 p-4" 
          style={{ borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded" 
              style={{ backgroundColor: 'var(--color-background-elevated)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--color-interactive-primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                진행 보고서
              </span>
            </div>
            <button className="flex items-center gap-2 w-full p-2 text-left rounded hover:bg-gray-100">
              <Plus className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                새 페이지
              </span>
            </button>
          </div>
          
          {/* 실시간 상태 */}
          {isActive && (
            <div className="mt-6 p-3 rounded-lg" 
              style={{ backgroundColor: 'var(--color-background-elevated)' }}>
              <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                작업 상태
              </h4>
              <div className="space-y-1 text-xs">
                <div>속도: {liveStats.cpm} CPM</div>
                <div>정확도: {liveStats.accuracy}%</div>
                <div>진행률: {Math.round(completionRate)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {renderDocumentWithTyping()}
          </div>
        </div>
      </div>
    </div>
  )
}