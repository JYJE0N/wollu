import { useRef, useCallback, useEffect } from 'react'
import { IInputHandler, InputHandlerConfig } from './types'
import Hangul from 'hangul-js'

export class DesktopInputHandler implements IInputHandler {
  private inputRef: HTMLInputElement | null = null
  private config: InputHandlerConfig
  private isComposing = false
  private isIPad = false
  private koreanBuffer: string[] = [] // 아이패드 한글 조합을 위한 버퍼
  private bufferTimer: NodeJS.Timeout | null = null // 버퍼 자동 flush 타이머

  constructor(config: InputHandlerConfig) {
    this.config = config
    
    // 아이패드 감지
    if (typeof navigator !== 'undefined') {
      this.isIPad = /iPad/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    }
    
    console.log('🏗️ DesktopInputHandler created', { isIPad: this.isIPad })
  }

  updateConfig(config: InputHandlerConfig): void {
    this.config = config
    console.log('🔧 DesktopInputHandler config updated')
  }

  setInputRef(ref: HTMLInputElement | null): void {
    this.inputRef = ref
  }

  async focus(): Promise<boolean> {
    if (!this.inputRef) {
      console.warn('⚠️ inputRef is null, waiting for initialization...')
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        if (this.inputRef) {
          console.log('✅ inputRef initialized after waiting')
          break
        }
      }
      
      if (!this.inputRef) {
        console.error('❌ Cannot focus: inputRef is still null after waiting')
        return false
      }
    }
    
    try {
      console.log('🎯 Attempting to focus input element:', this.inputRef)
      this.inputRef.focus()
      const isFocused = this.inputRef === document.activeElement
      console.log(`🎯 Focus result: ${isFocused ? '✅ SUCCESS' : '❌ FAILED'}`)
      return isFocused
    } catch (error) {
      console.warn('❌ Desktop focus failed:', error)
      return false
    }
  }

  blur(): void {
    if (this.inputRef) {
      this.inputRef.blur()
    }
  }

  handleActivation(): void {
    if (!this.config.disabled) {
      this.focus()
    }
  }

  isActive(): boolean {
    return this.inputRef === document.activeElement
  }

  /**
   * hangul-js를 사용한 아이패드 한글 자모 조합
   */
  private combineKoreanJamo(jamo: string): string | null {
    // 기존 타이머 클리어
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer)
      this.bufferTimer = null
    }

    // 스페이스바 특별 처리
    if (jamo === ' ') {
      if (this.koreanBuffer.length > 0) {
        const buffered = this.koreanBuffer.join('')
        const assembled = this.assembleKorean(buffered)
        this.koreanBuffer = []
        console.log(`🔤 Space received, flushing Korean buffer: "${assembled}"`)
        // 한글을 먼저 처리
        this.config.onKeyPress(assembled)
        // 짧은 지연 후 스페이스 처리로 순서 보장
        setTimeout(() => {
          this.config.onKeyPress(' ')
        }, 1)
        return null // 이미 처리했으므로 null 반환
      }
      return ' '
    }

    // 한글 자모인지 확인
    const isKoreanJamo = Hangul.isConsonant(jamo) || Hangul.isVowel(jamo)

    if (!isKoreanJamo) {
      // 한글 자모가 아니면 버퍼 비우고 현재 문자와 함께 처리
      if (this.koreanBuffer.length > 0) {
        const buffered = this.koreanBuffer.join('')
        this.koreanBuffer = []
        const assembled = this.assembleKorean(buffered)
        console.log(`📝 Non-jamo received, flushing buffer: "${assembled}"`)
        // 버퍼 내용을 먼저 처리
        this.config.onKeyPress(assembled)
        // 짧은 지연 후 현재 문자 처리
        setTimeout(() => {
          this.config.onKeyPress(jamo)
        }, 1)
        return null
      }
      return jamo
    }

    // 한글 자모를 버퍼에 추가
    this.koreanBuffer.push(jamo)
    const currentBuffer = this.koreanBuffer.join('')
    console.log(`🔤 Korean jamo buffered: "${jamo}", buffer: "${currentBuffer}"`)

    // hangul-js로 조합 시도
    const assembled = this.assembleKorean(currentBuffer)
    
    // 조합된 결과가 완성형 한글인지 확인
    if (this.isCompleteKorean(assembled)) {
      console.log(`✅ Korean character composed: "${assembled}" from "${currentBuffer}"`)
      this.koreanBuffer = []
      return assembled
    }

    // 버퍼가 너무 길어지면 강제로 비움
    if (this.koreanBuffer.length >= 4) {
      const result = assembled
      this.koreanBuffer = []
      console.log(`🔄 Buffer overflow, flushing: "${result}"`)
      return result
    }

    // 버퍼 자동 flush 타이머 설정 (300ms 후)
    this.bufferTimer = setTimeout(() => {
      if (this.koreanBuffer.length > 0) {
        const buffered = this.koreanBuffer.join('')
        const assembled = this.assembleKorean(buffered)
        this.koreanBuffer = []
        console.log(`⏰ Buffer auto-flushed: "${assembled}"`)
        this.config.onKeyPress(assembled)
      }
    }, 300)

    // 아직 조합 중
    return null
  }

  /**
   * hangul-js를 사용해 한글 자모 조합
   */
  private assembleKorean(jamos: string): string {
    try {
      return Hangul.assemble(jamos.split(''))
    } catch (error) {
      console.warn('⚠️ Hangul assembly failed:', error)
      return jamos
    }
  }

  /**
   * 완성된 한글 문자인지 확인
   */
  private isCompleteKorean(text: string): boolean {
    if (text.length !== 1) return false
    const code = text.charCodeAt(0)
    return code >= 0xAC00 && code <= 0xD7A3 // 한글 완성형 범위
  }

  /**
   * 백스페이스 키만 별도 처리 (브라우저 기본동작 방지 필요)
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this.config.disabled) return
    
    if (e.key === 'Backspace') {
      console.log('🔙 Backspace key detected')
      e.preventDefault()
      this.config.onBackspace()
    }
    // 다른 모든 키는 브라우저 IME가 처리하도록 방치
  }

  /**
   * Composition 시작 - 한글 입력 시작
   */
  private handleCompositionStart = (): void => {
    console.log('🎯 IME composition started')
    this.isComposing = true
    this.config.onCompositionChange?.(true)
  }

  /**
   * Composition 종료 - 완성된 한글 문자 처리
   */
  private handleCompositionEnd = (e: CompositionEvent): void => {
    console.log(`✅ IME composition completed: "${e.data}"`)
    this.isComposing = false
    this.config.onCompositionChange?.(false)
    
    if (e.data && e.data.length > 0) {
      // 완성된 모든 문자를 개별적으로 처리 (한글+공백 등)
      for (let i = 0; i < e.data.length; i++) {
        const char = e.data[i]
        console.log(`📝 Processing composed character: "${char}"`)
        this.config.onKeyPress(char)
      }
    }
    
    // 입력 필드 정리
    if (this.inputRef) {
      this.inputRef.value = ''
    }
  }

  /**
   * 일반 입력 처리 - 영문 등 composition 없는 문자 + 아이패드 한글 분리 문자
   */
  private handleInput = (e: Event): void => {
    const target = e.target as HTMLInputElement
    const value = target.value
    
    // Composition 중이 아닐 때만 처리 (한글은 compositionend에서 처리)
    if (!this.isComposing && value) {
      console.log(`📝 Input event (non-composition): "${value}" (iPad: ${this.isIPad})`)
      
      // 입력된 모든 문자 처리
      for (let i = 0; i < value.length; i++) {
        const char = value[i]
        
        if (this.isIPad) {
          // 아이패드에서는 한글 자모 조합 처리
          const composedChar = this.combineKoreanJamo(char)
          if (composedChar !== null) {
            console.log(`📝 Processing composed character: "${composedChar}"`)
            this.config.onKeyPress(composedChar)
          }
          // null이면 아직 조합 중이므로 처리하지 않음
        } else {
          // 일반 환경에서는 바로 처리
          console.log(`📝 Processing input character: "${char}"`)
          this.config.onKeyPress(char)
        }
      }
      
      // 입력 필드 정리
      target.value = ''
    }
  }

  setupEventListeners(): void {
    if (!this.inputRef) {
      console.error('❌ Desktop: inputRef is null, cannot setup event listeners')
      return
    }

    console.log('🎧 Setting up simplified event listeners')
    
    // 백스페이스만 keydown에서 처리
    this.inputRef.addEventListener('keydown', this.handleKeyDown)
    
    // IME 이벤트
    this.inputRef.addEventListener('compositionstart', this.handleCompositionStart)
    this.inputRef.addEventListener('compositionend', this.handleCompositionEnd)
    
    // 일반 입력 이벤트
    this.inputRef.addEventListener('input', this.handleInput)
    
    console.log('✅ Simplified event listeners setup complete')
  }

  removeEventListeners(): void {
    if (!this.inputRef) return

    this.inputRef.removeEventListener('keydown', this.handleKeyDown)
    this.inputRef.removeEventListener('compositionstart', this.handleCompositionStart)
    this.inputRef.removeEventListener('compositionend', this.handleCompositionEnd)
    this.inputRef.removeEventListener('input', this.handleInput)
  }

  cleanup(): void {
    console.log('🗑️ DesktopInputHandler cleanup called')
    
    // 버퍼 타이머 정리
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer)
      this.bufferTimer = null
    }
    
    // 아이패드 한글 버퍼 정리
    if (this.koreanBuffer.length > 0) {
      const remaining = this.koreanBuffer.join('')
      console.log(`🧹 Cleaning up Korean buffer: "${remaining}"`)
      this.koreanBuffer = []
    }
    
    this.removeEventListeners()
    this.inputRef = null
  }
}

type DesktopInputComponentProps = InputHandlerConfig

export function DesktopInputComponent(props: DesktopInputComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handlerRef = useRef<DesktopInputHandler | null>(null)

  const initHandler = useCallback(() => {
    console.log('🔄 initHandler called, inputRef.current:', inputRef.current)
    
    if (!inputRef.current) {
      console.warn('⚠️ inputRef.current is null, retrying...')
      let retryCount = 0
      const maxRetries = 10
      
      const retryInit = () => {
        if (inputRef.current) {
          console.log('✅ inputRef.current available after retry')
          initHandler()
          return
        }
        
        retryCount++
        if (retryCount < maxRetries) {
          setTimeout(retryInit, 50)
        } else {
          console.error('❌ Failed to initialize: inputRef.current is still null after max retries')
        }
      }
      
      setTimeout(retryInit, 50)
      return
    }
    
    // 핸들러가 이미 존재하면 config만 업데이트
    if (handlerRef.current) {
      console.log('🔧 Updating existing handler config')
      handlerRef.current.updateConfig(props)
      handlerRef.current.setInputRef(inputRef.current)
      return
    }
    
    console.log('🔄 Creating new simplified DesktopInputHandler')
    handlerRef.current = new DesktopInputHandler(props)
    
    console.log('🔗 Setting inputRef and event listeners')
    handlerRef.current.setInputRef(inputRef.current)
    handlerRef.current.setupEventListeners()
    
    // 자동 포커스
    setTimeout(async () => {
      if (handlerRef.current && !props.disabled) {
        console.log('⏰ Auto-focus attempt')
        await handlerRef.current.focus()
      }
    }, 100)
  }, [props.disabled])

  const handleClick = useCallback(async () => {
    console.log('👆 Desktop: Input clicked')
    if (handlerRef.current && !props.disabled) {
      const focused = await handlerRef.current.focus()
      console.log(`👆 Click focus result: ${focused ? '✅' : '❌'}`)
    }
  }, [props.disabled])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      initHandler()
    }, 0)
    
    return () => {
      clearTimeout(timeoutId)
      handlerRef.current?.cleanup()
    }
  }, [initHandler])

  return (
    <input
      ref={inputRef}
      type="text"
      className={`absolute inset-0 w-full h-full opacity-0 cursor-default ${props.className}`}
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        zIndex: 10
      }}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      readOnly={props.disabled}
      onClick={handleClick}
    />
  )
}