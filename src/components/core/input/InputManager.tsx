import { useCallback } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { InputHandlerConfig } from './types'
import { DesktopInputComponent } from './DesktopInputHandler'

interface InputManagerProps extends InputHandlerConfig {
  forceMode?: 'desktop' | 'mobile' | 'tablet'
}

/**
 * 단순화된 입력 관리자
 * 모든 플랫폼에서 동일한 입력 핸들러 사용 (브라우저 IME 표준 의존)
 */
export function InputManager(props: InputManagerProps) {
  // 향상된 설정으로 입력 핸들러에 전달
  const enhancedProps: InputHandlerConfig = {
    ...props,
    onKeyPress: useCallback((key: string) => {
      const currentState = useTypingStore.getState()
      
      // 완료되었거나 비활성 상태에서는 입력 무시
      if (currentState.isCompleted || (!currentState.isActive && !currentState.isPaused)) {
        return
      }
      
      props.onKeyPress(key)
    }, [props]),
    
    onBackspace: useCallback(() => {
      const currentState = useTypingStore.getState()
      
      // 완료되었거나 비활성 상태에서는 백스페이스 무시
      if (currentState.isCompleted || (!currentState.isActive && !currentState.isPaused)) {
        return
      }
      
      props.onBackspace()
    }, [props]),
    
    onTestStart: useCallback(() => {
      const currentState = useTypingStore.getState()
      
      // 이미 활성화된 상태가 아닐 때만 테스트 시작
      if (!currentState.isActive && !currentState.isCompleted) {
        props.onTestStart()
      }
    }, [props])
  }

  // 모든 플랫폼에서 동일한 입력 핸들러 사용
  return <DesktopInputComponent {...enhancedProps} />
}

// 개발자 도구 (개발 환경에서만)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).inputManagerDebug = {
    info: () => console.log('🖥️ Single universal input handler for all platforms'),
    getCurrentHandler: () => 'DesktopInputComponent (universal)'
  }
}

// 단순화된 디버그 훅
export function useInputManagerDebug() {
  const logInfo = useCallback(() => {
    console.log('🖥️ Universal input handler - no platform-specific logic needed')
  }, [])

  return { logInfo }
}