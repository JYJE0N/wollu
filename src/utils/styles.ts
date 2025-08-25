/**
 * 공통 스타일 유틸리티
 * 재사용 가능한 스타일 클래스와 CSS 변수 매핑
 */

// 기본 레이아웃 스타일
export const layoutStyles = {
  container: "min-h-screen bg-background text-text-primary",
  main: "flex-1 flex flex-col bg-background",
  header: "border-b border-border bg-surface",
  footer: "mt-auto bg-background-secondary",
  sidebar: "border-l border-border bg-surface",
  panel: "bg-surface rounded-lg border border-border",
  card: "bg-surface rounded-lg p-4 border border-border",
}

// 버튼 스타일
export const buttonStyles = {
  primary: "px-4 py-2 bg-interactive-primary text-text-on-primary rounded-lg hover:bg-interactive-primary/90 transition-colors",
  secondary: "px-4 py-2 bg-interactive-secondary text-text-on-secondary rounded-lg hover:bg-interactive-secondary/90 transition-colors",
  outline: "px-4 py-2 border border-interactive-primary text-interactive-primary rounded-lg hover:bg-interactive-primary/10 transition-colors",
  ghost: "px-4 py-2 text-text-primary hover:bg-surface rounded-lg transition-colors",
  danger: "px-4 py-2 bg-feedback-error text-white rounded-lg hover:bg-feedback-error/90 transition-colors",
  success: "px-4 py-2 bg-feedback-success text-white rounded-lg hover:bg-feedback-success/90 transition-colors",
}

// 버튼 그룹 스타일
export const buttonGroupStyles = {
  container: "inline-flex rounded-lg overflow-hidden border border-border bg-background",
  button: {
    base: "relative font-medium whitespace-nowrap transition-all duration-150 ease-in-out focus:outline-none focus:z-10 cursor-pointer",
    sizes: {
      sm: "px-2 py-1 text-xs",     // 8px + 4px, text-xs (12px)
      md: "px-3 py-1.5 text-sm",   // 12px + 6px, text-sm (14px)
      lg: "px-4 py-2 text-base"     // 16px + 8px, text-base (16px)
    },
    states: {
      default: "bg-button-group-default text-text-secondary hover:bg-elevated",
      active: "bg-interactive-primary text-text-on-primary",
      disabled: "opacity-50 cursor-not-allowed"
    },
    divider: "border-l border-border",
    first: "", // 첫 번째 버튼용
    notFirst: "-ml-px" // 첫 번째가 아닌 버튼용
  }
}

// 텍스트 스타일
export const textStyles = {
  heading: "text-2xl font-bold text-text-primary",
  subheading: "text-lg font-semibold text-text-primary",
  body: "text-base text-text-primary",
  muted: "text-sm text-text-secondary",
  error: "text-feedback-error",
  success: "text-feedback-success",
  warning: "text-feedback-warning",
  info: "text-feedback-info",
}

// 입력 필드 스타일
export const inputStyles = {
  base: "w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-interactive-primary",
  error: "w-full px-3 py-2 bg-background border border-feedback-error rounded-lg focus:outline-none focus:ring-2 focus:ring-feedback-error",
  disabled: "w-full px-3 py-2 bg-surface border border-border rounded-lg opacity-50 cursor-not-allowed",
}

// 프로그레스 바 스타일
export const progressStyles = {
  bar: "w-full bg-muted rounded-full h-2",
  fill: "h-2 rounded-full transition-all duration-300",
  fillPrimary: "h-2 rounded-full transition-all duration-300 bg-interactive-primary",
  fillSuccess: "h-2 rounded-full transition-all duration-300 bg-feedback-success",
  fillError: "h-2 rounded-full transition-all duration-300 bg-feedback-error",
}

// 드롭다운/모달 스타일
export const overlayStyles = {
  backdrop: "fixed inset-0 bg-black/50 z-40",
  modal: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-surface rounded-lg shadow-xl z-50",
  dropdown: "absolute top-full mt-2 bg-background-elevated border border-border rounded-lg shadow-lg z-50",
  tooltip: "absolute bg-background-elevated text-text-primary px-2 py-1 rounded text-sm shadow-lg z-50",
}

// 애니메이션 클래스
export const animationStyles = {
  fadeIn: "animate-fade-in",
  fadeOut: "animate-fade-out",
  slideIn: "animate-slide-in",
  slideOut: "animate-slide-out",
  pulse: "animate-pulse",
  shake: "animate-shake",
  bounce: "animate-bounce",
}

// 스타일 조합 헬퍼 함수
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

// CSS 변수 값 가져오기 헬퍼
export function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

// 다이나믹 스타일 생성
export function createDynamicStyle(property: string, cssVariable: string): React.CSSProperties {
  return { [property]: `var(${cssVariable})` }
}