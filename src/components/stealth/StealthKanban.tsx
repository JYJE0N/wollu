"use client"

import { useStealthCommon } from '@/hooks/useStealthCommon'
import { Header } from '@/components/ui/Header'
import { CheckSquare, Circle, Clock, User } from 'lucide-react'

interface KanbanCardProps {
  title: string
  status: 'todo' | 'progress' | 'done'
  progress?: number
  assignee?: string
  isTyping?: boolean
}

function KanbanCard({ title, status, progress = 0, assignee, isTyping }: KanbanCardProps) {
  const statusConfig = {
    todo: { icon: Circle, color: '#5e6c84', bgColor: '#ddd' },
    progress: { icon: Clock, color: '#0052cc', bgColor: '#deebff' },
    done: { icon: CheckSquare, color: '#00875a', bgColor: '#e3fcef' }
  }
  
  const { icon: StatusIcon, color } = statusConfig[status]

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 transition-all duration-200 ${
        isTyping ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-800 leading-relaxed">
          {title}
        </h4>
        <StatusIcon size={16} style={{ color }} />
      </div>
      
      {progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      )}
      
      {assignee && (
        <div className="flex items-center mt-3">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            <User size={12} />
          </div>
          <span className="text-xs text-gray-600 ml-2">{assignee}</span>
        </div>
      )}
    </div>
  )
}

interface StealthKanbanProps {
  className?: string
}

export function StealthKanban({ className = "" }: StealthKanbanProps) {
  const {
    handleHomeNavigation,
    isActive,
    isCompleted,
    text: targetText,
    currentIndex,
    completionRate,
    cpm,
    accuracy,
    elapsedTime
  } = useStealthCommon()
  
  // 가짜 업무 항목들
  const todoItems = [
    "Q3 마케팅 전략 수립",
    "고객 피드백 분석 보고서",
    "신규 프로젝트 일정 검토"
  ]
  
  const progressItems = [
    {
      title: isActive || isCompleted ? "문서 검토 및 수정작업" : "팀 미팅 자료 준비",
      progress: isActive || isCompleted ? completionRate : 45,
      isTyping: isActive && !isCompleted
    },
    {
      title: "데이터베이스 최적화",
      progress: 23
    }
  ]
  
  const doneItems = [
    "일일 보고서 작성 완료",
    "클라이언트 미팅 참석",
    isCompleted ? "문서 검토 작업 완료" : "이메일 답변 처리"
  ]

  return (
    <div className={`min-h-screen bg-[#f7f8fc] ${className}`}>
      <Header 
        mode="stealth-kanban"
        onHomeClick={handleHomeNavigation}
        style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
      />

      {/* 칸반보드 */}
      <div className="flex gap-6 p-6 overflow-x-auto">
        {/* TODO 컬럼 */}
        <div className="flex-shrink-0 w-80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              할 일 ({todoItems.length})
            </h2>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            {todoItems.map((item, index) => (
              <KanbanCard
                key={index}
                title={item}
                status="todo"
                assignee={index === 0 ? "김철수" : undefined}
              />
            ))}
          </div>
        </div>

        {/* PROGRESS 컬럼 */}
        <div className="flex-shrink-0 w-80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              진행중 ({progressItems.length})
            </h2>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            {progressItems.map((item, index) => (
              <KanbanCard
                key={index}
                title={item.title}
                status="progress"
                progress={item.progress}
                assignee="본인"
                isTyping={item.isTyping}
              />
            ))}
          </div>
        </div>

        {/* DONE 컬럼 */}
        <div className="flex-shrink-0 w-80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              완료 ({doneItems.length})
            </h2>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            {doneItems.map((item, index) => (
              <KanbanCard
                key={index}
                title={item}
                status="done"
                progress={100}
                assignee={index === 0 ? "본인" : "팀원"}
              />
            ))}
          </div>
        </div>

        {/* 통계 카드 (숨김) */}
        {(isActive || isCompleted) && (
          <div className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                작업 현황
              </h2>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-3">실시간 생산성 지표</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">작업 속도</span>
                  <span className="font-medium">{cpm} CPM</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">정확도</span>
                  <span className="font-medium">{accuracy}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">소요시간</span>
                  <span className="font-medium">{Math.round(elapsedTime)}초</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 숨겨진 타이핑 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4" 
           style={{ opacity: isActive ? 0.05 : 0 }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-sm text-gray-600 mb-2">진행 중인 작업: 문서 검토</div>
          <div className="bg-gray-50 rounded p-3 font-mono text-sm">
            {targetText.split('').map((char, index) => (
              <span
                key={index}
                className={
                  index < currentIndex
                    ? 'text-green-600'
                    : index === currentIndex
                    ? 'bg-blue-200 text-blue-800'
                    : 'text-gray-400'
                }
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}