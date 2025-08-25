"use client"

import { useStealthCommon, stealthStyles } from '@/hooks/useStealthCommon'
import { Header } from '@/components/ui/Header'
import { 
  Edit3, 
  Eye,
  MessageCircle,
  Clock,
  BarChart3
} from 'lucide-react'

interface StealthDocsProps {
  className?: string
}

export function StealthDocs({ className = "" }: StealthDocsProps) {
  const {
    handleHomeNavigation,
    currentTime,
    formatTime,
    isBlinking,
    text,
    currentIndex,
    userInput,
    mistakes,
    isActive,
    isCompleted,
    completionRate,
    cpm,
    wpm,
    accuracy,
  } = useStealthCommon()
  
  // 가짜 문서 내용
  const fakeDocumentContent = `
회의록: 팀 프로젝트 진행사항 논의

일시: 2024년 8월 20일 ${formatTime(currentTime)}
참석자: 김철수, 박영희, 이민수, 정수진

1. 주요 안건
   - 3분기 목표 달성률 검토
   - 신규 프로젝트 일정 조율
   - 클라이언트 피드백 반영 사항

2. 논의 내용
   현재 진행 중인 프로젝트의 완료율은 ${Math.round(completionRate)}%입니다.
   
   팀원들의 작업 효율성이 크게 향상되었으며, 특히 문서 작성 속도가 
   분당 ${cpm}자로 측정되어 목표치를 상회하고 있습니다.
   
   정확도 또한 ${accuracy}%로 매우 우수한 수준을 유지하고 있어,
   품질 관리 측면에서도 긍정적인 결과를 보이고 있습니다.

3. 다음 액션 아이템
   - 프로젝트 일정 재검토
   - 품질 관리 프로세스 개선
   - 팀 협업 도구 업그레이드

`.trim()

  // 실제 타이핑 텍스트를 문서에 자연스럽게 삽입
  const renderDocumentWithTyping = () => {
    if (!isActive && !isCompleted) {
      return fakeDocumentContent.split('\n').map((line, index) => (
        <p key={index} className="mb-4 leading-relaxed text-text-primary">
          {line || '\u00A0'}
        </p>
      ))
    }

    // 타이핑 중이거나 완료된 경우
    const lines = fakeDocumentContent.split('\n')
    const insertPosition = 7 // "2. 논의 내용" 다음 줄에 삽입
    
    return lines.map((line, lineIndex) => {
      if (lineIndex === insertPosition) {
        // 실제 타이핑 텍스트 삽입
        return (
          <div key={lineIndex}>
            <p className="mb-4 leading-relaxed text-text-primary">
              {line || '\u00A0'}
            </p>
            <div className="mb-4 p-4 bg-interactive-primary/5 rounded-lg border border-interactive-primary/20">
              <p className="text-sm text-text-secondary mb-2">실시간 입력 중...</p>
              <p className="leading-relaxed font-mono text-sm">
                {text.split('').map((char: string, index: number) => {
                  const isTyped = index < currentIndex
                  const isCorrect = isTyped && userInput[index] === char
                  const isCurrent = index === currentIndex
                  const isMistake = mistakes.some(m => m.position === index)
                  
                  let charClass = 'text-text-secondary/50'
                  if (isCurrent) {
                    charClass = isBlinking 
                      ? 'bg-interactive-primary text-text-on-primary' 
                      : 'text-interactive-primary'
                  } else if (isTyped) {
                    charClass = isCorrect && !isMistake
                      ? 'text-feedback-success' 
                      : 'text-feedback-error bg-feedback-error/10'
                  }
                  
                  return (
                    <span key={index} className={charClass}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  )
                })}
              </p>
            </div>
          </div>
        )
      }
      
      return (
        <p key={lineIndex} className="mb-4 leading-relaxed text-text-primary">
          {line || '\u00A0'}
        </p>
      )
    })
  }

  return (
    <div className={`${stealthStyles.container} ${className}`}>
      <Header 
        mode="stealth-docs"
        onHomeClick={handleHomeNavigation}
      />

      <div className="flex h-[calc(100vh-60px)]">
        {/* 메인 콘텐츠 */}
        <main className={`${stealthStyles.content} p-8`}>
          <div className="max-w-4xl mx-auto">
            {/* 도구 모음 */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface rounded transition-colors">
                <Edit3 className="w-4 h-4" />
                <span className="text-text-primary">편집</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface rounded transition-colors">
                <Eye className="w-4 h-4" />
                <span className="text-text-primary">미리보기</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface rounded transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-text-primary">댓글</span>
              </button>
            </div>

            {/* 문서 내용 */}
            <article className="prose prose-gray max-w-none">
              {renderDocumentWithTyping()}
            </article>
          </div>
        </main>

        {/* 사이드바 - 통계 표시 */}
        {(isActive || isCompleted) && (
          <aside className={`${stealthStyles.sidebar} w-80 p-6`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-text-primary">
              <BarChart3 className="w-4 h-4" />
              문서 작성 통계
            </h3>
            
            <div className="space-y-4">
              <div className={stealthStyles.statsCard}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">작성 속도</span>
                  <Clock className="w-4 h-4 text-text-secondary" />
                </div>
                <p className={stealthStyles.statValue}>{cpm} CPM</p>
                <p className="text-xs text-text-secondary mt-1">{wpm} WPM</p>
              </div>
              
              <div className={stealthStyles.statsCard}>
                <p className="text-sm text-text-secondary mb-2">정확도</p>
                <p className={stealthStyles.statValue}>{accuracy}%</p>
                <div className={stealthStyles.progressBar}>
                  <div 
                    className={`${stealthStyles.progressFill} bg-feedback-success`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
              
              <div className={stealthStyles.statsCard}>
                <p className="text-sm text-text-secondary mb-2">진행률</p>
                <p className={stealthStyles.statValue}>{Math.round(completionRate)}%</p>
                <div className={stealthStyles.progressBar}>
                  <div 
                    className={`${stealthStyles.progressFill} bg-interactive-primary`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              
              <div className={stealthStyles.statsCard}>
                <p className="text-sm text-text-secondary mb-2">오타</p>
                <p className="text-2xl font-bold text-feedback-error">{mistakes.length}</p>
                <p className={stealthStyles.statLabel}>총 {mistakes.length}개 발견</p>
              </div>
            </div>
            
            <button 
              onClick={handleHomeNavigation}
              className="w-full mt-6 px-4 py-2 bg-interactive-primary text-text-on-primary rounded-lg hover:bg-interactive-primary/90 transition-colors"
            >
              타이핑 화면으로
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}