"use client"

import { useEffect, useState, ReactNode, lazy, Suspense } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

// Stealth 컴포넌트들 동적 임포트 - stealth 모드에서만 필요
const StealthKanban = lazy(() => 
  import('./StealthKanban').then(module => ({
    default: module.StealthKanban
  }))
);
const StealthDocs = lazy(() => 
  import('./StealthDocs').then(module => ({
    default: module.StealthDocs
  }))
);
const StealthSlack = lazy(() => 
  import('./StealthSlack').then(module => ({
    default: module.StealthSlack
  }))
);

interface StealthManagerProps {
  children: ReactNode
}

export function StealthManager({ children }: StealthManagerProps) {
  const { theme } = useSettingsStore()
  const [isStealthMode, setIsStealthMode] = useState(false)
  const [lastToggleTime, setLastToggleTime] = useState(0)
  
  // ESC 키 토글 기능 (은밀모드 테마일 때만)
  useEffect(() => {
    // 은밀모드 테마가 아니면 키보드 이벤트 리스너 등록하지 않음
    if (!theme.startsWith('stealth')) {
      return
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      const now = Date.now()
      
      // ESC 키 눌렸을 때만 처리
      if (event.key === 'Escape') {
        // 너무 빠른 연속 토글 방지 (300ms 쿨다운)
        if (now - lastToggleTime < 300) return
        
        setLastToggleTime(now)
        setIsStealthMode(prev => !prev)
        event.preventDefault()
        event.stopPropagation()
      }
    }

    // 은밀모드일 때만 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyPress, { capture: true })
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress, { capture: true })
    }
  }, [theme, lastToggleTime])

  // 은밀모드 테마가 아니면 일반 화면
  if (!theme.startsWith('stealth')) {
    return <>{children}</>
  }

  // 은밀모드이면서 스텔스 활성화된 경우 테마별 위장 화면 표시
  if (isStealthMode) {
    let StealthComponent
    
    switch (theme) {
      case 'stealth-docs':
        StealthComponent = StealthDocs
        break
      case 'stealth-slack':
        StealthComponent = StealthSlack
        break
      case 'stealth':
      default:
        StealthComponent = StealthKanban
        break
    }
    
    return (
      <div className="relative">
        <Suspense fallback={
          <div className="w-full h-screen bg-white flex items-center justify-center">
            <div className="text-gray-600">Loading...</div>
          </div>
        }>
          <StealthComponent />
        </Suspense>
        
        {/* ESC 키 힌트 (희미하게) */}
        <div className="fixed top-4 right-4 text-xs text-gray-400 opacity-30 hover:opacity-100 transition-opacity z-50">
          ESC키로 복원
        </div>
      </div>
    )
  }

  // 일반 타이핑 화면이지만 은밀모드 UI 스타일 적용
  return (
    <div className="relative">
      {children}
      
      {/* ESC 키 힌트 */}
      <div className="fixed top-4 right-4 text-xs text-gray-400 opacity-30 hover:opacity-100 transition-opacity z-50">
        ESC키로 위장모드
      </div>
    </div>
  )
}

/**
 * 은밀모드 상태 관리를 위한 커스텀 훅
 */
export function useStealthMode() {
  const { theme, setTheme } = useSettingsStore()
  
  const isStealthTheme = theme.startsWith('stealth')
  
  const toggleStealthTheme = () => {
    if (isStealthTheme) {
      setTheme('light') // 일반 모드로 복귀
    } else {
      setTheme('stealth') // 기본 칸반보드 은밀모드
    }
  }
  
  const setStealthVariant = (variant: 'stealth' | 'stealth-docs' | 'stealth-slack') => {
    setTheme(variant)
  }
  
  return {
    isStealthTheme,
    currentStealthTheme: isStealthTheme ? theme : null,
    toggleStealthTheme,
    setStealthVariant
  }
}