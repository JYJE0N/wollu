'use client'

import { useState, useEffect, useCallback } from 'react'

interface DebugLog {
  id: number
  timestamp: string
  message: string
  type: 'log' | 'warn' | 'error'
}

export function MobileDebugPanel() {
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [logId, setLogId] = useState(0)

  // 콘솔 메시지 캐치
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    const addLog = (message: string, type: 'log' | 'warn' | 'error') => {
      const timestamp = new Date().toLocaleTimeString()
      setLogs(prev => [...prev.slice(-50), { // 최대 50개만 유지
        id: logId,
        timestamp,
        message: typeof message === 'object' ? JSON.stringify(message) : String(message),
        type
      }])
      setLogId(prev => prev + 1)
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog(args.join(' '), 'log')
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog(args.join(' '), 'warn')
    }

    console.error = (...args) => {
      originalError(...args)
      addLog(args.join(' '), 'error')
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [logId])

  // 터치로 토글 (아이패드용)
  const handleToggle = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
    setLogId(0)
  }, [])

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={handleToggle}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-2 rounded text-sm shadow-lg"
        style={{ zIndex: 9999 }}
      >
        🐛 {isVisible ? '숨기기' : '디버그'}
      </button>

      {/* 디버그 패널 */}
      {isVisible && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 z-40 p-4"
          style={{ zIndex: 9998 }}
        >
          <div className="bg-white rounded-lg h-full flex flex-col">
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">🔍 모바일 디버그 콘솔</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearLogs}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  지우기
                </button>
                <button
                  onClick={handleToggle}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                >
                  닫기
                </button>
              </div>
            </div>

            {/* 로그 목록 */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  콘솔 로그가 여기에 표시됩니다
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className={`mb-2 p-2 rounded text-xs border-l-4 ${
                      log.type === 'error' 
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : log.type === 'warn'
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                        : 'bg-gray-50 border-blue-500 text-gray-800'
                    }`}
                  >
                    <div className="text-gray-500 mb-1">[{log.timestamp}]</div>
                    <div className="whitespace-pre-wrap break-words">
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 상태 표시 */}
            <div className="border-t p-3 text-sm text-gray-600">
              총 {logs.length}개 로그 • {navigator.userAgent.includes('iPad') ? 'iPad' : 'Mobile'} 감지됨
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// 개발 환경에서만 표시 (Hydration safe)
export function ConditionalMobileDebugPanel() {
  return <MobileDebugPanel />
}