'use client'

import { InputManager } from './input'
import { InputHandlerConfig } from './input/types'

interface InputHandlerProps extends Omit<InputHandlerConfig, 'className'> {
  className?: string
  forceMode?: 'desktop' | 'mobile' | 'tablet'
}

/**
 * 새로운 InputHandler - 관심사분리와 단일책임원칙을 적용한 리팩토링 버전
 * 
 * 개선사항:
 * - 플랫폼별 핸들러 분리 (Desktop/Mobile/Tablet)
 * - 통합 이벤트 처리 시스템
 * - 중복 입력 방지 로직 개선
 * - React 상태와 DOM 상태 동기화
 * - 명확한 활성화 플로우
 */
export function InputHandler({
  onKeyPress,
  onBackspace,
  onTestStart,
  onResume,
  onPause,
  onRestart,
  onCompositionChange,
  disabled = false,
  className = '',
  forceMode
}: InputHandlerProps) {
  const config: InputHandlerConfig = {
    onKeyPress,
    onBackspace,
    onTestStart,
    onResume,
    onPause,
    onRestart,
    onCompositionChange,
    disabled,
    className
  }

  return (
    <InputManager 
      {...config}
      forceMode={forceMode}
    />
  )
}

// 레거시 호환성을 위한 export (기존 InputHandler와 동일한 인터페이스 제공)
export { InputHandler as InputHandlerV2 }