'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { IMEHandler, isKoreanJamo, getBrowserType, isCompletedKorean } from '@/utils/koreanIME'
import { detectMobile } from '@/utils/mobileDetection'

interface InputHandlerProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onTestStart: () => void
  onResume?: () => void
  onPause?: () => void
  onRestart?: () => void
  onCompositionChange?: (isComposing: boolean) => void
  disabled?: boolean
  className?: string
}

export function InputHandler({
  onKeyPress,
  onBackspace,
  onTestStart,
  onResume,
  onPause,
  onRestart,
  onCompositionChange,
  disabled = false,
  className = ''
}: InputHandlerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const imeHandler = useRef(new IMEHandler())
  const processedInputRef = useRef<Set<string>>(new Set())
  const browserType = useRef(getBrowserType())
  
  // State for test start
  const [testStarted, setTestStarted] = useState(false)
  const [showStartHint, setShowStartHint] = useState(true)
  
  const { isCompleted, isActive, isCountingDown, isPaused, setCompositionState } = useTypingStore()

  // 모바일 감지를 한 번만 실행 (성능 최적화)
  const mobileInfo = useMemo(() => {
    const detection = detectMobile()
    return {
      isMobile: detection?.isMobile ?? false,
      isIOS: detection?.isIOS ?? false,
      isAndroid: detection?.isAndroid ?? false,
      isIPad: detection?.isIPad ?? false,
      isIPhone: detection?.isIPhone ?? false
    }
  }, [])

  // Focus management with iOS/iPad specific handling
  const maintainFocus = useCallback(() => {
    if (inputRef.current && !disabled && !isCompleted) {
      const { isMobile, isIOS } = mobileInfo
      
      if (isMobile) {
        const input = inputRef.current
        
        // 모바일 키보드 활성화 최적화
        input.removeAttribute('readonly')
        input.setAttribute('inputmode', 'text')
        input.setAttribute('autocomplete', 'off')
        input.setAttribute('autocorrect', 'off')
        input.setAttribute('spellcheck', 'false')
        
        // iOS와 Android 모두 type="text" 설정 (iOS 키보드 활성화 필수)
        input.setAttribute('type', 'text')
        
        // iOS 전용 추가 설정 (iPad 특별 처리 포함)
        if (isIOS) {
          // iOS 자동완성 관련 추가 속성
          input.setAttribute('autocapitalize', 'off')
          input.setAttribute('data-testid', 'typing-input')
          // iOS Safari 호환성을 위한 추가 속성
          input.setAttribute('webkit-user-select', 'text')
          
          // iPad 전용 추가 설정
          if (mobileInfo.isIPad) {
            // iPad는 키보드 활성화가 더 까다로우므로 추가 속성 필요
            input.setAttribute('enterkeyhint', 'done')
            input.setAttribute('pattern', '[\\s\\S]*') // 모든 문자 허용
            // iPad Safari에서 키보드 활성화를 위한 강제 편집 가능 상태
            input.setAttribute('contenteditable', 'true')
            input.style.webkitUserSelect = 'text'
            // TypeScript에서 인식하지 못하는 webkit 속성은 setAttribute로 설정
            input.style.setProperty('-webkit-touch-callout', 'default')
          }
        }
        
        // 포커스 시도 (재시도 횟수 제한으로 무한루프 방지)
        let attempts = 0
        const maxAttempts = 2
        
        const tryFocus = () => {
          if (attempts >= maxAttempts || !input) return
          
          input.focus()
          attempts++
          
          // 포커스 실패 시 재시도 (최대 2회)
          if (document.activeElement !== input && attempts < maxAttempts) {
            setTimeout(tryFocus, 100)
          }
        }
        
        tryFocus()
      } else {
        inputRef.current.focus()
      }
    }
  }, [disabled, isCompleted, mobileInfo])

  // Auto-start test on first valid input
  const handleTestStart = useCallback(() => {
    if (!testStarted && !isActive) {
      onTestStart()
      setTestStarted(true)
      setShowStartHint(false)
      
      // iOS에서 테스트 시작 시 hiddenInput으로 포커스 이동
      if (mobileInfo.isIOS && hiddenInputRef.current) {
        setTimeout(() => {
          hiddenInputRef.current?.focus()
          console.log('📱 iOS: 숨겨진 input으로 포커스 이동')
        }, 100)
      }
    }
  }, [testStarted, isActive, onTestStart, mobileInfo.isIOS])

  // Process character input (unified handler)
  const processCharacter = useCallback((char: string) => {
    // Skip only incomplete Korean jamo, allow completed Korean characters (가-힣)
    if (isKoreanJamo(char) && !isCompletedKorean(char)) {
      return
    }

    // Check for duplicate processing
    const now = Date.now()
    const charId = `${char}-${Math.floor(now / 100)}` // 100ms window
    if (processedInputRef.current.has(charId)) {
      return
    }

    // 모든 디바이스에서 자동 시작 - 버튼 제거로 인한 변경
    if (!testStarted && !isCountingDown && !isActive) {
      handleTestStart()
    }

    // 상태를 다시 한번 확인 (React 동기화 문제 해결)
    const currentStore = useTypingStore.getState()
    const actualIsActive = currentStore.isActive
    const actualIsCountingDown = currentStore.isCountingDown
    
    
    // 테스트가 활성화된 상태에만 키 입력 처리 (스토어 직접 확인)
    if (actualIsActive && !actualIsCountingDown) {
      onKeyPress(char)
    } else {
    }
    
    // Mark as processed (clear after 200ms to prevent memory leak)
    processedInputRef.current.add(charId)
    setTimeout(() => {
      processedInputRef.current.delete(charId)
    }, 200)
  }, [testStarted, onKeyPress, handleTestStart])

  // Handle direct input (모바일 최적화 포함)
  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return
    
    const target = event.target as HTMLInputElement
    const value = target.value
    
    // 🔧 모바일에서도 정확한 입력 처리
    if (mobileInfo.isMobile) {
      // IME 조합 중이면 무시 (composition 이벤트로 처리됨)
      if (imeHandler.current.isComposing()) {
        return
      }
      
      // 입력값이 있을 때만 처리
      if (value.length > 0) {
        // 마지막 입력된 부분만 처리 (이전 값과의 차이)
        const prevValue = inputRef.current?.getAttribute('data-prev-value') || ''
        const newInput = value.slice(prevValue.length)
        
        // 모바일에서도 자동 시작 - 버튼 제거로 인한 변경
        if (!testStarted && !isCountingDown && !isActive) {
          handleTestStart()
        }
        
        // 활성화 상태에서만 입력 처리
        const currentStore = useTypingStore.getState()
        if (currentStore.isActive && !currentStore.isCountingDown) {
          // 새로 입력된 문자들 처리
          for (const char of newInput) {
            // 완성된 한글이거나 한글이 아닌 경우만 처리
            if (isCompletedKorean(char) || !isKoreanJamo(char)) {
              onKeyPress(char)
            }
          }
        }
        
        // 값이 너무 길면 정리
        if (value.length > 5) {
          target.value = ''
          target.setAttribute('data-prev-value', '')
        } else {
          target.setAttribute('data-prev-value', value)
        }
      }
      return
    }
    
    // 데스크톱은 기존 로직 유지
    // Skip if IME is composing
    if (imeHandler.current.isComposing()) {
      // console.log('🎭 Skipping input during IME composition')
      return
    }
    
    // Process only the last character for direct input
    if (value.length > 0) {
      const lastChar = value[value.length - 1]
      
      // Only process if it's not an incomplete Korean jamo and is a valid character
      if (lastChar && lastChar.charCodeAt(0) >= 32 && !(isKoreanJamo(lastChar) && !isCompletedKorean(lastChar))) {
        processCharacter(lastChar)
      }
      
      // Clear input to prevent accumulation
      target.value = ''
    }
  }, [disabled, isCompleted, processCharacter, mobileInfo.isMobile, testStarted, onTestStart, onKeyPress, handleTestStart])

  // Handle keyboard events (전역 이벤트 처리 제외 문자만)
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return

    const key = event.key
    
    // ESC 키: 일시정지/중단 (직접 처리)
    if (key === 'Escape') {
      event.preventDefault();
      const currentState = useTypingStore.getState()
      
      if (currentState.isActive && !currentState.isPaused) {
        // 첫 번째 ESC: 일시정지
        // console.log('⏸️ ESC pressed - pausing test');
        if (onPause) {
          // console.log('✅ Calling onPause');
          onPause();
        } else {
          // console.log('❌ onPause is not available');
        }
      } else if (currentState.isPaused) {
        // 두 번째 ESC: 중단
        // console.log('⏹️ ESC pressed - stopping test');
        if (onRestart) {
          // console.log('✅ Calling onRestart');
          onRestart();
        } else {
          // console.log('❌ onRestart is not available');
        }
      } else if (currentState.isCountingDown) {
        // 카운트다운 중: 즉시 중단
        // console.log('⏹️ ESC pressed during countdown - stopping test');
        if (onRestart) {
          // console.log('✅ Calling onRestart during countdown');
          onRestart();
        } else {
          // console.log('❌ onRestart is not available during countdown');
        }
      } else {
        // console.log('⚠️ ESC pressed but no matching state');
      }
      return;
    }
    
    // Shift+Enter: 새로고침 (직접 처리)
    if (event.shiftKey && key === 'Enter') {
      event.preventDefault();
      if (onRestart) {
        onRestart();
      }
      return;
    }

    // Backspace 처리 - 활성화된 타이핑 중에도 가능
    if (key === 'Backspace') {
      event.preventDefault()
      // console.log(`🔙 Backspace pressed - isPaused: ${isPaused}, isActive: ${isActive}, isCountingDown: ${isCountingDown}`)
      
      // 일시정지 상태에서는 재개
      if (isPaused && onResume) {
        // console.log('▶️ Resuming from pause via backspace')
        onResume()
        return
      }
      
      // 활성화된 상태에서만 백스페이스 처리
      if (isActive && !isCountingDown) {
        // console.log('✅ Calling onBackspace()')
        onBackspace()
      } else {
        // console.log(`❌ Backspace blocked - isActive: ${isActive}, isCountingDown: ${isCountingDown}`)
      }
      
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    
    // Enter, Tab 처리
    if (key === 'Enter' || key === 'Tab') {
      event.preventDefault()
      
      if (isActive && !isCountingDown) {
        processCharacter(key === 'Enter' ? '\n' : '\t')
      }
      return
    }
    
    // 스페이스 처리  
    if (key === ' ') {
      event.preventDefault()
      
      if (isActive && !isCountingDown && !imeHandler.current.isComposing()) {
        processCharacter(' ')
      }
      return
    }
    
    // ASCII 문자 처리
    if (key.length === 1 && !imeHandler.current.isComposing()) {
      const charCode = key.charCodeAt(0)
      if (charCode < 128 && charCode >= 32) {
        event.preventDefault()
        
        if (isActive && !isCountingDown) {
          processCharacter(key)
        }
      }
    }
  }, [disabled, isCompleted, isPaused, onBackspace, onResume, onPause, onRestart, processCharacter])

  // Composition event handlers (for IME)
  const handleCompositionStart = useCallback((event: React.CompositionEvent) => {
    try {
      // console.log('🎭 Composition started:', event.data)
      imeHandler.current.startComposition()
      setCompositionState(true, event.data || '')
      onCompositionChange?.(true)
      
      // Hide start hint when user starts typing
      if (showStartHint) {
        setShowStartHint(false)
      }
    } catch (error) {
      console.error('❌ Error in handleCompositionStart:', error)
    }
  }, [onCompositionChange, showStartHint, setCompositionState])

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    try {
      // console.log('🎭 Composition update:', event.data)
      imeHandler.current.updateComposition(event.data || '')
      setCompositionState(true, event.data || '')
    } catch (error) {
      console.error('❌ Error in handleCompositionUpdate:', error)
    }
  }, [setCompositionState])

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    try {
      // console.log('🎭 Composition ended:', event.data)
      
      const composedText = event.data || ''
      
      // 모바일에서는 직접 처리
      if (mobileInfo.isMobile) {
        imeHandler.current.endComposition(composedText)
        setCompositionState(false, '')
        onCompositionChange?.(false)
        
        // 테스트 시작 확인
        if (!testStarted && composedText.length > 0) {
          handleTestStart()
        }
        
        // 활성화 상태 확인
        const currentStore = useTypingStore.getState()
        if (currentStore.isActive && !currentStore.isCountingDown && composedText) {
          // 완성된 한글 문자만 처리 (composition에서 온 전체 텍스트)
          for (const char of composedText) {
            // 완성된 한글이거나 한글 자모가 아닌 경우만
            if (isCompletedKorean(char) || !isKoreanJamo(char)) {
              onKeyPress(char)
            }
          }
        }
        
        // Clear input field and reset prev value
        if (inputRef.current) {
          inputRef.current.value = ''
          inputRef.current.setAttribute('data-prev-value', '')
        }
        return
      }
      
      // 데스크톱 기존 로직
      const newChars = imeHandler.current.endComposition(composedText)
      setCompositionState(false, '')
      onCompositionChange?.(false)
      
      // 모든 디바이스에서 자동 시작
      if (!testStarted && newChars.length > 0) {
        handleTestStart()
      }
      
      // Process each new character
      for (const char of newChars) {
        processCharacter(char)
      }
      
      // Clear input field
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (error) {
      console.error('❌ Error in handleCompositionEnd:', error)
    }
  }, [testStarted, onCompositionChange, mobileInfo.isMobile, handleTestStart, onKeyPress, processCharacter, setCompositionState])

  // Handle click to focus and start test (모바일 최적화)
  const handleContainerClick = useCallback((e?: React.MouseEvent) => {
    // console.log('🖱️ Container clicked!', { testStarted, isActive, disabled, isCompleted, isPaused })
    if (disabled || isCompleted) {
      // console.log('❌ Click blocked by disabled/completed check')
      return
    }
    
    // 일시정지 상태에서 클릭하면 해제
    if (isPaused && onResume) {
      // console.log('▶️ Resuming from pause via click')
      onResume()
      return
    }
    
    // 모바일 환경 감지
    const { isMobile, isIOS, isIPad } = mobileInfo
    
    if (isMobile && !testStarted && !isActive) {
      // 모바일에서도 클릭으로 시작 가능하도록 변경
      // console.log('📱 Mobile: Starting test from click')
      
      // iOS에서는 사용자 인터랙션 직후에 포커스해야 키보드 활성화
      if (isIOS && e && inputRef.current) {
        // 이벤트 전파 방지하지 않고 자연스러운 터치 이벤트 유지
        
        const input = inputRef.current
        
        // iOS는 화면 하단의 별도 input을 사용하므로 단순 포커스만
        input.focus()
      } else {
        maintainFocus()
      }
      
      handleTestStart() // 모바일에서도 클릭 시 시작
      if (showStartHint) {
        setShowStartHint(false)
      }
      return
    }
    
    maintainFocus()
    
    // 데스크톱에서도 클릭으로 시작 가능 (모바일 로직과 통합)
    if (!testStarted && !isActive) {
      // console.log('🚀 Starting test from click')
      handleTestStart()
    }
    
    // Hide hint when clicked
    if (showStartHint) {
      setShowStartHint(false)
    }
  }, [showStartHint, testStarted, isActive, isPaused, handleTestStart, onResume, mobileInfo, disabled, isCompleted, maintainFocus])

  // Reset when test state changes
  useEffect(() => {
    if (disabled || isCompleted) {
      setTestStarted(false)
      setShowStartHint(true)
      imeHandler.current.reset()
      processedInputRef.current.clear()
      
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } else if (!isActive) {
      setTestStarted(false)
      setShowStartHint(true)
    }
  }, [disabled, isCompleted, isActive])

  // Initial focus and maintain focus + Global ESC handler (모바일 최적화)
  useEffect(() => {
    const timer = setTimeout(() => {
      // iOS에서는 초기 자동 포커스 제한 (사용자 인터랙션 필요)
      if (!mobileInfo.isIOS) {
        maintainFocus()
        // console.log('🎯 Initial focus set')
      }
    }, 100)
    
    // 모바일 환경 감지
    const { isMobile, isIOS } = mobileInfo
    
    // 페이지 클릭 시에도 포커스 유지 (iOS 제외)
    const handlePageClick = () => {
      try {
        if (!disabled && !isCompleted && !isIOS) {
          const delay = isMobile ? 50 : 10; // 모바일에서는 더 긴 지연
          setTimeout(() => maintainFocus(), delay)
        }
      } catch (error) {
        console.error('❌ Error in handlePageClick:', error)
      }
    }
    
    // 더 강력한 전역 ESC 키 처리 (모든 키보드에서 동작)
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // ESC 키만 로깅 (다른 키는 무시)
      if (event.key === 'Escape') {
        // console.log('🎹 ESC key pressed:', event.key);
      }
      
      try {
        // ESC 키 체크 (event.key만 사용)
        if (event.key === 'Escape') {
          // console.log('🔥 GLOBAL ESC DETECTED!');
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          
          const currentState = useTypingStore.getState()
          // console.log('🔍 Global ESC state check:', {
          //   isActive: currentState.isActive,
          //   isPaused: currentState.isPaused,
          //   isCountingDown: currentState.isCountingDown,
          //   target: (event.target as HTMLElement)?.tagName || 'unknown'
          // });
          
          if (currentState.isActive && !currentState.isPaused) {
            // 첫 번째 ESC: 일시정지
            // console.log('⏸️ Global ESC - pausing test')
            if (onPause) {
              // console.log('✅ Global calling onPause');
              onPause()
            } else {
              // console.log('❌ Global onPause not available');
            }
          } else if (currentState.isPaused) {
            // 두 번째 ESC: 중단
            // console.log('⏹️ Global ESC - stopping test')
            if (onRestart) {
              // console.log('✅ Global calling onRestart');
              onRestart()
            } else {
              // console.log('❌ Global onRestart not available');
            }
          } else if (currentState.isCountingDown) {
            // 카운트다운 중: 즉시 중단
            // console.log('⏹️ Global ESC during countdown - stopping test')
            if (onRestart) {
              // console.log('✅ Global calling onRestart during countdown');
              onRestart()
            } else {
              // console.log('❌ Global onRestart not available during countdown');
            }
          } else {
            // console.log('⚠️ Global ESC but no matching state');
          }
        }
      } catch (error) {
        console.error('❌ Error in handleGlobalKeyDown:', error)
      }
    }
    
    // 다중 이벤트 리스너 등록 (최대 호환성)
    document.addEventListener('click', handlePageClick)
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handlePageClick)
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
    }
  }, [disabled, isCompleted, maintainFocus, mobileInfo, onPause, onRestart])

  // Browser-specific adjustments
  useEffect(() => {
    // console.log(`🌐 Browser detected: ${browserType.current}`)
    
    // Add browser-specific event listeners if needed
    if (browserType.current === 'firefox') {
      // Firefox-specific handling
      // console.log('🦊 Firefox-specific IME handling enabled')
    } else if (browserType.current === 'safari') {
      // Safari-specific handling
      // console.log('🧭 Safari-specific IME handling enabled')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 브라우저 타입 감지는 한번만 수행

  return (
    <div 
      className={`input-handler ${className} relative`} 
      style={{ pointerEvents: 'auto' }}
      onClick={handleContainerClick}
    >
      {/* 모바일 키보드 활성화를 위한 실제 보이는 input (투명도 조정) */}
      {mobileInfo.isMobile ? (
        <>
          {/* iOS는 텍스트와 완전히 분리된 고정 위치 input 필요 */}
          {(mobileInfo.isIOS || mobileInfo.isIPad || mobileInfo.isIPhone) ? (
            <>
              {/* iOS 전용: 화면 하단 고정 input */}
              <div 
                className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-center gap-2"
                style={{
                  display: testStarted || isActive ? 'none' : 'flex'
                }}
              >
                <div className="text-center text-sm px-4" style={{ color: 'var(--color-text-secondary)' }}>
                  아래 입력창을 터치하여 타이핑을 시작하세요
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="여기를 터치하세요"
                  className="w-full max-w-sm h-14 px-4 text-center rounded-xl border-2 text-lg font-medium shadow-lg"
                  style={{ 
                    fontSize: '16px', // iOS 줌 방지
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.6)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    backdropFilter: 'blur(10px)',
                    // iOS 터치 최적화
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    WebkitAppearance: 'none',
                    touchAction: 'manipulation'
                  }}
                  onClick={handleContainerClick}
                  onFocus={() => {
                    if (!testStarted && !isActive) {
                      handleTestStart()
                    }
                  }}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionUpdate={handleCompositionUpdate}
                  onCompositionEnd={handleCompositionEnd}
                  disabled={disabled || isCompleted}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="text"
                  data-testid="ios-typing-input"
                />
              </div>
              
              {/* iOS 타이핑 중 숨겨진 input */}
              {(testStarted || isActive) && (
                <input
                  ref={hiddenInputRef}
                  type="text"
                  className="fixed bottom-0 left-0 w-1 h-1 opacity-0"
                  style={{ 
                    fontSize: '16px',
                    pointerEvents: 'auto',
                    zIndex: 10
                  }}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionUpdate={handleCompositionUpdate}
                  onCompositionEnd={handleCompositionEnd}
                  disabled={disabled || isCompleted}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="text"
                  data-testid="ios-hidden-input"
                />
              )}
            </>
          ) : (
            // 안드로이드용 기존 방식
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <input
                  ref={inputRef}
                  type="text"
                  placeholder="터치하여 타이핑을 시작하세요"
                  className="w-full h-12 px-4 text-center rounded-lg border-2"
                  style={{ 
                    fontSize: '16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'var(--color-interactive-primary)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    zIndex: 60,
                    // 타이핑 시작 후에는 거의 숨김
                    opacity: testStarted || isActive ? 0.05 : 1,
                    pointerEvents: 'auto',
                    transition: 'opacity 0.3s ease',
                    WebkitUserSelect: 'text',
                    userSelect: 'text'
                  }}
            onClick={handleContainerClick}
            onFocus={() => {
              if (!testStarted && !isActive) {
                handleTestStart()
              }
            }}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            disabled={disabled || isCompleted}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="text"
            data-testid="android-typing-input"
              />
            </div>
          )}
        </>
      ) : (
        // 데스크톱용 숨김 input
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full opacity-0"
          style={{ 
            caretColor: 'transparent',
            outline: 'none',
            fontSize: '16px',
            zIndex: 50,
            cursor: 'text',
            pointerEvents: 'auto'
          }}
          onClick={handleContainerClick}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          disabled={disabled || isCompleted}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          tabIndex={0}
          aria-label="Typing input field"
          inputMode="text"
          data-testid="desktop-typing-input"
        />
      )}
      
    </div>
  )
}

