"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTypingStore } from '@/stores/typingStore'
import { useStatsStore } from '@/stores/statsStore'
import { 
  Hash, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile,
  Paperclip,
  Send,
  Star,
  Circle,
  BarChart3,
  Settings
} from 'lucide-react'

interface MessageProps {
  user: string
  time: string
  message: string
  isOwn?: boolean
  isTyping?: boolean
}

function Message({ user, time, message, isOwn = false, isTyping = false }: MessageProps) {
  const [cursorBlink, setCursorBlink] = useState(true)
  
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setCursorBlink(prev => !prev)
      }, 530)
      return () => clearInterval(interval)
    }
  }, [isTyping])

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
        isOwn ? 'bg-green-500' : user === '김철수' ? 'bg-blue-500' : 'bg-purple-500'
      }`}>
        {user[0]}
      </div>
      <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{user}</span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {isTyping ? (
            <span className="font-mono">
              {message}
              <span className={`inline-block w-0.5 h-4 bg-current ml-1 ${cursorBlink ? 'opacity-100' : 'opacity-0'}`} />
            </span>
          ) : (
            message
          )}
        </div>
      </div>
    </div>
  )
}

interface StealthSlackProps {
  className?: string
}

export function StealthSlack({ className = "" }: StealthSlackProps) {
  const router = useRouter()
  const { isActive, isCompleted, targetText, currentIndex } = useTypingStore()
  const { liveStats } = useStatsStore()
  
  // 홈으로 돌아가기 핸들러
  const handleHomeNavigation = () => {
    router.push('/')
  }
  
  const [currentTime, setCurrentTime] = useState('')
  
  // 실시간 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // 진행률 계산
  const completionRate = targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0
  
  // 타이핑된 텍스트
  const typedText = targetText.slice(0, currentIndex)
  
  // 가짜 채널 목록
  const channels = [
    { name: 'general', unread: 0 },
    { name: '프로젝트-알파', unread: 3 },
    { name: '마케팅-팀', unread: 0 },
    { name: '개발-논의', unread: 1 },
    { name: '공지사항', unread: 0 }
  ]
  
  // 가짜 메시지 내용
  const messages = [
    {
      user: '김철수',
      time: '10:30',
      message: '안녕하세요! 오늘 회의 준비는 어떻게 되어가고 있나요?'
    },
    {
      user: '박영희',
      time: '10:32',
      message: '네, 거의 준비가 끝났습니다. 자료 검토만 남았어요.'
    },
    {
      user: '이민수',
      time: '10:35',
      message: '저도 준비 완료했습니다. 오후 2시 맞죠?'
    },
    {
      user: '본인',
      time: currentTime,
      message: isActive || isCompleted ? typedText : '네, 맞습니다. 모두 수고하셨어요!',
      isOwn: true,
      isTyping: isActive && !isCompleted
    }
  ]

  return (
    <div className={`min-h-screen bg-white flex ${className}`}>
      {/* 사이드바 */}
      <div className="w-64 bg-[#3f0e40] text-white flex-shrink-0">
        {/* 워크스페이스 헤더 */}
        <div className="p-4 border-b border-purple-600">
          <h1 className="text-lg font-bold">DevTeam 워크스페이스</h1>
          <div className="flex items-center mt-2">
            <Circle size={8} className="text-green-400 fill-current mr-2" />
            <span className="text-sm">김동현</span>
          </div>
        </div>
        
        {/* 채널 목록 */}
        <div className="p-4">
          <div className="text-sm font-semibold text-purple-200 mb-2">채널</div>
          <div className="space-y-1">
            {channels.map((channel) => (
              <div 
                key={channel.name}
                className={`flex items-center justify-between p-2 rounded hover:bg-purple-600 cursor-pointer ${
                  channel.name === '프로젝트-알파' ? 'bg-purple-600' : ''
                }`}
              >
                <div className="flex items-center">
                  <Hash size={16} className="mr-2" />
                  <span className="text-sm">{channel.name}</span>
                </div>
                {channel.unread > 0 && (
                  <span className="bg-red-500 text-xs px-1.5 py-0.5 rounded-full">
                    {channel.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* 다이렉트 메시지 */}
          <div className="text-sm font-semibold text-purple-200 mb-2 mt-6">다이렉트 메시지</div>
          <div className="space-y-1">
            <div className="flex items-center p-2 rounded hover:bg-purple-600 cursor-pointer">
              <Circle size={8} className="text-green-400 fill-current mr-2" />
              <span className="text-sm">김철수</span>
            </div>
            <div className="flex items-center p-2 rounded hover:bg-purple-600 cursor-pointer">
              <Circle size={8} className="text-yellow-400 fill-current mr-2" />
              <span className="text-sm">박영희</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 채팅 헤더 */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="cursor-pointer transition-opacity hover:opacity-80" 
                onClick={handleHomeNavigation}
                title="홈으로 돌아가기"
              >
                <Hash size={20} className="text-gray-600" />
              </div>
              <h2 
                className="text-lg font-semibold text-gray-900 cursor-pointer transition-opacity hover:opacity-80" 
                onClick={handleHomeNavigation}
                title="홈으로 돌아가기"
              >
                마케팅-전략회의
              </h2>
              <Star size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">8명</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone size={18} className="text-gray-600 hover:text-gray-900 cursor-pointer" />
              <Video size={18} className="text-gray-600 hover:text-gray-900 cursor-pointer" />
              
              {/* 숨겨진 통계 버튼 */}
              <div 
                className="cursor-pointer transition-colors" 
                onClick={() => router.push('/stats')}
                title="통계 보기"
              >
                <BarChart3 
                  size={18} 
                  className="text-gray-600 hover:text-gray-900 transition-colors" 
                />
              </div>
              
              <Search size={18} className="text-gray-600 hover:text-gray-900 cursor-pointer" />
              
              {/* 숨겨진 설정 버튼 */}
              <div 
                className="cursor-pointer transition-colors" 
                title="설정"
              >
                <Settings 
                  size={18} 
                  className="text-gray-600 hover:text-gray-900 transition-colors" 
                />
              </div>
              
              <MoreVertical size={18} className="text-gray-600 hover:text-gray-900 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="max-w-4xl">
            {/* 채널 정보 */}
            <div className="text-center py-8 border-b border-gray-100 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                #
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">마케팅-전략회의 채널에 오신 것을 환영합니다!</h3>
              <p className="text-gray-600">이 채널은 2024년 4분기 마케팅 전략 수립을 위한 업무 공간입니다.</p>
            </div>
            
            {/* 메시지 목록 */}
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  user={msg.user}
                  time={msg.time}
                  message={msg.message}
                  isOwn={msg.isOwn}
                  isTyping={msg.isTyping}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <div className="bg-white border border-gray-300 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">메시지 작성 중...</span>
                      {isActive && (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Paperclip size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                      <Smile size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                    </div>
                  </div>
                  
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded border min-h-[60px]">
                    {isActive || isCompleted ? (
                      targetText.split('').map((char, index) => (
                        <span
                          key={index}
                          className={
                            index < currentIndex
                              ? 'text-gray-900'
                              : index === currentIndex
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-300'
                          }
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">메시지를 입력하세요...</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                className={`p-2 rounded-lg transition-colors ${
                  currentIndex > 0 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-400'
                }`}
                disabled={currentIndex === 0}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 통계 패널 (우측 하단) */}
        {(isActive || isCompleted) && (
          <div className="fixed bottom-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">입력 통계</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">타이핑 속도</span>
                <span className="font-medium text-green-600">{liveStats.cpm} CPM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">정확도</span>
                <span className="font-medium text-blue-600">{liveStats.accuracy}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">경과 시간</span>
                <span className="font-medium">{Math.round(liveStats.timeElapsed)}초</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">진행률</span>
                <span className="font-medium text-purple-600">{Math.round(completionRate)}%</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 flex items-center">
                <Circle size={6} className="text-green-400 fill-current mr-1" />
                실시간 협업 중
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}