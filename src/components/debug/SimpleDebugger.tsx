'use client'

import { useEffect } from 'react'

export function SimpleDebugger() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 간단한 alert 기반 디버거
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    let logBuffer: string[] = []
    let logCount = 0

    const showAlert = (message: string, type: string) => {
      logCount++
      logBuffer.push(`[${type}] ${message}`)
      
      // 5개마다 한 번씩 alert로 표시
      if (logCount % 5 === 0) {
        alert(`디버그 로그 (최근 5개):\n\n${logBuffer.slice(-5).join('\n\n')}`)
      }
    }

    // 한글 관련 로그만 필터링
    console.log = (...args) => {
      originalLog(...args)
      const message = args.join(' ')
      if (message.includes('🔤') || message.includes('✅') || message.includes('🎯') || 
          message.includes('composition') || message.includes('Korean') || 
          message.includes('Space') || message.includes('IME')) {
        showAlert(message, 'LOG')
      }
    }

    console.warn = (...args) => {
      originalWarn(...args)
      const message = args.join(' ')
      showAlert(message, 'WARN')
    }

    console.error = (...args) => {
      originalError(...args)
      const message = args.join(' ')
      showAlert(message, 'ERROR')
    }

    // 디버그 정보 표시
    const userAgent = navigator.userAgent
    const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    setTimeout(() => {
      alert(`🔍 디버거 활성화됨!\n\n기기: ${isIPad ? 'iPad' : 'Other'}\nUser Agent: ${userAgent.substring(0, 50)}...\n\n한글 입력 관련 로그만 표시됩니다.`)
    }, 2000)

    return () => {
      console.log = originalLog
      console.warn = originalWarn  
      console.error = originalError
    }
  }, [])

  return null
}