import { create } from 'zustand'
import { Keystroke, Mistake } from '@/types'
import { isKoreanJamo } from '@/utils/koreanIME'
// import { eventBus } from '@/utils/eventBus' // EventBus 제거 - 순환참조 방지
import { typingEffectsManager } from '@/utils/typingEffects'

interface TypingStore {
  // State
  isActive: boolean
  isPaused: boolean
  isCompleted: boolean
  isCountingDown: boolean
  countdownValue: number
  currentIndex: number
  targetText: string
  userInput: string
  startTime: Date | null
  firstKeystrokeTime: Date | null  // 실제 첫 키 입력 시점 (몽키타입 스타일)
  endTime: Date | null
  keystrokes: Keystroke[]
  mistakes: Mistake[]
  
  // Tracking for duplicate prevention
  lastProcessedChar: string | null
  lastProcessedTime: number

  // MonkeyType 스타일 단어 추적
  textWords: string[]
  completedWords: number
  currentWordIndex: number
  
  // IME composition state
  isComposing: boolean
  composingText: string

  // Actions
  setTargetText: (text: string) => void
  startCountdown: () => void
  startTest: () => void
  pauseTest: () => void
  resumeTest: () => void
  stopTest: () => void
  resetTest: () => void
  completeTest: () => void
  handleKeyPress: (key: string) => void
  handleBackspace: () => void
  getCurrentChar: () => string
  getProgress: () => number
  isCurrentCharCorrect: () => boolean
  setCompositionState: (isComposing: boolean, text?: string) => void
}

// Utility to check if this is a duplicate input (더 관대하게 수정)
function isDuplicateInput(state: TypingStore, key: string): boolean {
  const now = Date.now()
  const timeDiff = now - state.lastProcessedTime
  
  // 띄어쓰기는 더 관대하게, 다른 키는 엄격하게
  const duplicateThreshold = key === ' ' ? 1 : 3  // 띄어쓰기는 1ms, 다른 키는 3ms
  
  if (state.lastProcessedChar === key && timeDiff < duplicateThreshold) {
    console.log(`⚠️ Duplicate input detected: "${key}" within ${timeDiff}ms`)
    return true
  }
  
  return false
}

// Check completed words (MonkeyType style)
function checkCompletedWords(state: TypingStore): number {
  if (state.textWords.length === 0) return 0
  
  let completedWords = 0
  let currentPos = 0
  
  for (const word of state.textWords) {
    const wordEnd = currentPos + word.length
    
    // 현재 단어가 완전히 타이핑되었는지 확인
    if (state.currentIndex >= wordEnd) {
      const typedWord = state.userInput.substring(currentPos, wordEnd)
      if (typedWord === word) {
        completedWords++
      }
    } else {
      break // 아직 완성되지 않은 단어가 나오면 중단
    }
    
    currentPos = wordEnd + 1 // 공백 포함
  }
  
  return completedWords
}

// Process a valid keystroke
function processKeystroke(
  state: TypingStore, 
  key: string, 
  expectedChar: string, 
  isCorrect: boolean
): Partial<TypingStore> {
  const currentTime = Date.now()
  const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
  const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0

  // 🎯 첫 키 입력 시점 기록 (몽키타입 스타일)
  const firstKeystrokeTime = state.firstKeystrokeTime || new Date(currentTime)

  // Create keystroke record
  const keystroke: Keystroke = {
    key,
    timestamp: currentTime,
    correct: isCorrect,
    timeDelta
  }

  // Create mistake record if incorrect
  const mistakes = isCorrect ? state.mistakes : [
    ...state.mistakes,
    {
      position: state.currentIndex,
      expected: expectedChar,
      actual: key,
      timestamp: currentTime
    }
  ]

  // Update state
  return {
    keystrokes: [...state.keystrokes, keystroke],
    mistakes,
    currentIndex: state.currentIndex + 1,
    userInput: state.userInput + key,
    firstKeystrokeTime, // 첫 키 입력 시점 기록
    lastProcessedChar: key,
    lastProcessedTime: currentTime
  }
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  // Initial state
  isActive: false,
  isPaused: false,
  isCompleted: false,
  isCountingDown: false,
  countdownValue: 3,
  currentIndex: 0,
  targetText: '',
  userInput: '',
  startTime: null,
  firstKeystrokeTime: null,
  endTime: null,
  keystrokes: [],
  mistakes: [],
  lastProcessedChar: null,
  lastProcessedTime: 0,
  textWords: [],
  completedWords: 0,
  currentWordIndex: 0,
  isComposing: false,
  composingText: '',

  // Set target text
  setTargetText: (text: string) => {
    // 텍스트를 단어로 분할 (MonkeyType 방식)
    const words = text.split(' ').filter(word => word.trim().length > 0)
    
    set({ 
      targetText: text,
      currentIndex: 0,
      userInput: '',
      keystrokes: [],
      mistakes: [],
      lastProcessedChar: null,
      lastProcessedTime: 0,
      textWords: words,
      completedWords: 0,
      currentWordIndex: 0
    })
    
    // console.log('📝 텍스트 설정:', {
    //   text: text.substring(0, 50) + '...',
    //   totalWords: words.length,
    //   words: words.slice(0, 5)
    // })
  },

  // Start countdown
  startCountdown: () => {
    const state = get()
    if (state.isActive || state.isCountingDown) {
      console.log('⚠️ Test already running or counting down')
      return
    }
    
    set({ isCountingDown: true, countdownValue: 3 })
    console.log('⏰ Countdown started')
    
    // 카운트다운 로직
    const countdownInterval = setInterval(() => {
      const currentState = get()
      
      if (currentState.countdownValue <= 1) {
        clearInterval(countdownInterval)
        // 바로 테스트 시작! 박진감 있게
        set({
          isCountingDown: false,
          isActive: true,
          isPaused: false,
          startTime: new Date(),
          endTime: null
        })
        console.log('🚀 Test started immediately after countdown!')
      } else {
        set({ countdownValue: currentState.countdownValue - 1 })
        console.log(`⏰ Countdown: ${currentState.countdownValue - 1}`)
      }
    }, 1000)
  },

  // Start test (직접 시작, 카운트다운 없이)
  startTest: () => {
    const state = get()
    if (state.isActive) {
      console.log('⚠️ Test already active, skipping start')
      return
    }
    
    set({ 
      isActive: true,
      isPaused: false,
      isCountingDown: false,
      startTime: new Date(),
      endTime: null
    })
    
    console.log('✅ Test started')
  },

  // Pause test
  pauseTest: () => {
    console.log('⏸️ Test paused')
    set({ isPaused: true })
  },

  // Resume test
  resumeTest: () => {
    console.log('▶️ Test resumed')
    set({ isPaused: false })
  },

  // Stop test (완전 중단)
  stopTest: () => {
    console.log('⏹️ Test stopped')
    set({
      isActive: false,
      isPaused: false,
      isCountingDown: false,
      isCompleted: false
    })
  },

  // Reset test
  resetTest: () => set({
    isActive: false,
    isPaused: false,
    isCompleted: false,
    isCountingDown: false,
    countdownValue: 3,
    currentIndex: 0,
    userInput: '',
    startTime: null,
    firstKeystrokeTime: null,
    endTime: null,
    keystrokes: [],
    mistakes: [],
    lastProcessedChar: null,
    lastProcessedTime: 0,
    completedWords: 0,
    currentWordIndex: 0,
    isComposing: false,
    composingText: ''
  }),

  // Complete test
  completeTest: () => {
    const _state = get()
    const endTime = new Date()
    
    // eventBus 호출 제거 - 무한 루프 방지
    console.log('✅ Test completed - eventBus 호출 제거됨')
    
    set({
      isActive: false,
      isPaused: false,
      isCompleted: true,
      endTime
    })
  },

  // Handle key press
  handleKeyPress: (key: string) => {
    const state = get()
    
    // Check test state
    if (state.isCompleted || state.isPaused || state.isCountingDown) {
      console.log('❌ Input blocked: test completed, paused, or counting down')
      return
    }

    // 한글 자모는 기록하되, 진행은 하지 않음 (CPM 계산용)
    if (isKoreanJamo(key)) {
      console.log(`🔤 Recording Korean jamo for CPM: "${key}"`)
      const currentTime = Date.now()
      const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
      const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0
      
      // 한글 자모도 키스트로크로 기록 (타이핑 노력으로 인정)
      const jamoKeystroke: Keystroke = {
        key,
        timestamp: currentTime,
        correct: true, // 한글 조합 과정의 모든 키스트로크를 유효한 타이핑으로 인정
        timeDelta
      }
      
      set({ 
        keystrokes: [...state.keystrokes, jamoKeystroke],
        lastProcessedChar: key,
        lastProcessedTime: currentTime
      })
      
      // 통계 업데이트 제거 - 무한 루프 방지
      return
    }

    // Check for duplicate input
    if (isDuplicateInput(state, key)) {
      return
    }

    // Auto-start 완전 비활성화 - 무한 루프 방지
    // if (!state.isActive && !state.startTime) {
    //   console.log('🚀 Auto-starting test')
    //   get().startTest()
    // }

    // Get expected character
    const expectedChar = state.targetText[state.currentIndex]
    if (!expectedChar) {
      console.log('⚠️ No more characters to type')
      
      // 텍스트 끝 완료 로직 제거 - 무한 루프 방지
      // if (key === '\n' || key === ' ') {
      //   console.log(`🏁 Text completed with ${key === '\n' ? 'Enter' : 'Space'} key at end`)
      //   setTimeout(() => get().completeTest(), 50)
      // }"}
      return
    }

    // Check if correct
    const isCorrect = key === expectedChar
    
    console.log('🔤 Processing keystroke:', { 
      key: `"${key}"`,
      expected: `"${expectedChar}"`,
      isCorrect,
      currentIndex: state.currentIndex
    })
    
    // Process the keystroke
    const updates = processKeystroke(state, key, expectedChar, isCorrect)
    set(updates)
    
    // 마지막 글자 완료 로직도 제거 - 무한 루프 방지  
    const newIndex = updates.currentIndex || state.currentIndex
    if (newIndex >= state.targetText.length) {
      console.log('🏁 Test reached end - 자동 완료 비활성화')
      // setTimeout(() => get().completeTest(), 50)  
      return
    }
    
    // 타이핑 이펙트 트리거
    const effectsTimeElapsed = (Date.now() - (state.startTime?.getTime() || Date.now())) / 1000
    const effectsMinutes = effectsTimeElapsed / 60
    const currentCPM = effectsMinutes > 0 ? Math.round(state.currentIndex / effectsMinutes) : 0
    const currentAccuracy = state.keystrokes.length > 0 
      ? Math.round((state.keystrokes.filter(k => k.correct).length / state.keystrokes.length) * 100)
      : 100
      
    if (isCorrect) {
      // 정확한 키 입력 시 이펙트 트리거
      typingEffectsManager.onCorrectKeystroke(currentCPM, currentAccuracy)
    } else {
      // 실수 시 콤보 리셋
      typingEffectsManager.onIncorrectKeystroke()
    }
    
    // 단어 완성 체크
    const newState = { ...state, ...updates }
    const newCompletedWords = checkCompletedWords(newState)
    
    if (newCompletedWords > state.completedWords) {
      console.log(`🎯 단어 완성! ${state.completedWords} → ${newCompletedWords}`)
      set({ completedWords: newCompletedWords })
      newState.completedWords = newCompletedWords
    }
    
    // 간단한 통계 계산
    const timeElapsed = (Date.now() - (state.startTime?.getTime() || Date.now())) / 1000
    const minutes = timeElapsed / 60
    
    // 기본 WPM/CPM 계산
    const simpleWPM = minutes > 0 ? Math.round(newState.completedWords / minutes) : 0
    const simpleCPM = minutes > 0 ? Math.round(newState.currentIndex / minutes) : 0
    
    // 기존 통계도 유지하면서 MonkeyType 스타일도 같이 계산 - EventBus 제거로 비활성화
    // eventBus.emit('stats:update', {
    //   keystrokes: newState.keystrokes,
    //   mistakes: newState.mistakes,
    //   startTime: newState.startTime,
    //   currentIndex: newState.currentIndex,
    //   userInput: newState.userInput,
    //   firstKeystrokeTime: newState.firstKeystrokeTime
    // })
    
    console.log(`📊 간단한 통계: CPM ${simpleCPM}, WPM ${simpleWPM}`)
  },

  // Handle backspace - 완전한 수정 기능
  handleBackspace: () => {
    const state = get()
    
    if (state.currentIndex <= 0 || state.isCompleted || state.isCountingDown) {
      console.log('❌ Cannot backspace: at start, completed, or counting down')
      return
    }

    const currentTime = Date.now()
    const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
    const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0

    // Create backspace keystroke
    const keystroke: Keystroke = {
      key: 'Backspace',
      timestamp: currentTime,
      correct: false,
      timeDelta
    }

    // 삭제할 문자의 위치 (현재 인덱스 - 1)
    const deletePosition = state.currentIndex - 1
    
    // 해당 위치의 실수 기록 제거 (가장 최근 실수만)
    const updatedMistakes = state.mistakes.filter((mistake, index) => {
      // 같은 위치의 가장 마지막 실수만 제거
      if (mistake.position === deletePosition) {
        // findLastIndex 대신 역순 검색으로 마지막 인덱스 찾기
        let lastMistakeIndex = -1
        for (let i = state.mistakes.length - 1; i >= 0; i--) {
          if (state.mistakes[i].position === deletePosition) {
            lastMistakeIndex = i
            break
          }
        }
        return index !== lastMistakeIndex
      }
      return true
    })

    console.log('🔙 Processing backspace:', {
      fromIndex: state.currentIndex,
      toIndex: state.currentIndex - 1,
      deletedChar: state.userInput[deletePosition],
      mistakesBefore: state.mistakes.length,
      mistakesAfter: updatedMistakes.length
    })

    set(state => ({
      keystrokes: [...state.keystrokes, keystroke],
      currentIndex: Math.max(0, state.currentIndex - 1),
      userInput: state.userInput.slice(0, -1),
      mistakes: updatedMistakes, // 실수 기록도 업데이트
      lastProcessedChar: 'Backspace',
      lastProcessedTime: currentTime
    }))

    // 통계 업데이트
    const _newState = get()
    // eventBus.emit('stats:update', {
    //   keystrokes: newState.keystrokes,
    //   mistakes: newState.mistakes,
    //   startTime: newState.startTime,
    //   currentIndex: newState.currentIndex,
    //   userInput: newState.userInput,
    //   firstKeystrokeTime: newState.firstKeystrokeTime
    // })
  },

  // Get current character
  getCurrentChar: () => {
    const { targetText, currentIndex } = get()
    return targetText[currentIndex] || ''
  },

  // Get progress
  getProgress: () => {
    const { currentIndex, targetText } = get()
    return targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0
  },

  // Check if current character is correct
  isCurrentCharCorrect: () => {
    const { targetText, userInput, currentIndex } = get()
    if (currentIndex >= userInput.length) return true
    return targetText[currentIndex] === userInput[currentIndex]
  },

  // Set composition state
  setCompositionState: (isComposing: boolean, text = '') => {
    set({ isComposing, composingText: text })
  }
}))