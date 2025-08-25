import { Keystroke, Mistake, TextType } from '@/types'

// 이벤트 타입 정의
export interface StatsUpdateEvent {
  keystrokes: Keystroke[]
  mistakes: Mistake[]
  startTime: Date | null
  currentIndex?: number
  currentTime?: Date
  textType?: TextType
  currentText?: string
  userInput?: string
  firstKeystrokeTime?: Date | null
}

// 이벤트 타입 매핑
interface EventMap {
  'stats:update': StatsUpdateEvent
  'test:completed': StatsUpdateEvent
}

// 간단한 이벤트 버스 구현
class EventBus {
  private listeners: { [K in keyof EventMap]?: Array<(data: EventMap[K]) => void> } = {}

  on<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event]!.push(listener)
  }

  off<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): void {
    if (!this.listeners[event]) return
    
    const index = this.listeners[event]!.indexOf(listener)
    if (index > -1) {
      this.listeners[event]!.splice(index, 1)
    }
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (!this.listeners[event]) return
    
    this.listeners[event]!.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }
}

// 싱글톤 인스턴스 내보내기
export const eventBus = new EventBus()