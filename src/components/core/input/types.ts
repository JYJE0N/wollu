export interface IInputHandler {
  focus(): Promise<boolean>
  blur(): void
  handleActivation(): void
  isActive(): boolean
  cleanup(): void
}

export interface InputHandlerConfig {
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