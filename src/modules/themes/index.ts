import { Theme } from '@/types'
import { themeTokenMap } from '@/styles/design-tokens'
import { themeMetadata } from '@/styles/theme-provider'

// 레거시 Theme 인터페이스와 호환성 유지를 위한 변환
export const themes: Record<string, Theme> = Object.entries(themeTokenMap).reduce((acc, [id, tokens]) => {
  const metadata = themeMetadata[id as keyof typeof themeMetadata]
  
  acc[id] = {
    id,
    name: metadata?.name || id,
    colors: {
      background: tokens.background.primary,
      surface: tokens.background.secondary,
      text: tokens.text.primary,
      textSecondary: tokens.text.secondary,
      correct: tokens.typing.correct,
      incorrect: tokens.typing.incorrect,
      current: tokens.typing.current,
      accent: tokens.interactive.primary
    }
  }
  
  return acc
}, {} as Record<string, Theme>)

export const getTheme = (themeId: string): Theme | null => {
  return themes[themeId] || null
}

export const getAvailableThemes = (): string[] => {
  return Object.keys(themes)
}

// 새로운 디자인 토큰 기반 테마 적용 함수
export { applyThemeVariables as applyTheme } from '@/styles/theme-provider'

export type { Theme }