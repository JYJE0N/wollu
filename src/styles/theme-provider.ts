/**
 * 테마별 CSS Variables 관리
 * Tailwind와 연동되는 런타임 테마 시스템
 */

import { themeTokenMap, type ThemeId, type ThemeTokens } from './design-tokens'

/**
 * 테마를 DOM에 적용하는 함수 (CSS 선택자 기반)
 */
export function applyThemeVariables(themeId: ThemeId) {
  if (typeof document === 'undefined') return

  const tokens = themeTokenMap[themeId]
  if (!tokens) {
    console.warn(`Theme "${themeId}" not found`)
    return
  }

  const root = document.documentElement

  // 테마 ID를 데이터 어트리뷰트로 설정 (CSS 선택자가 자동으로 적용됨)
  root.setAttribute('data-theme', themeId)
  
  // 은밀모드 여부 설정
  if (themeId.startsWith('stealth')) {
    root.setAttribute('data-stealth', 'true')
  } else {
    root.removeAttribute('data-stealth')
  }

}

/**
 * CSS 변수 헬퍼 함수 (사용 중단됨 - CSS 선택자 사용)
 */
// function setCSSVariables(element: HTMLElement, variables: Record<string, string>) {
//   Object.entries(variables).forEach(([property, value]) => {
//     element.style.setProperty(property, value)
//   })
// }

/**
 * 현재 테마의 토큰 가져오기
 */
export function getThemeTokens(themeId: ThemeId): ThemeTokens | null {
  return themeTokenMap[themeId] || null
}

/**
 * 사용 가능한 모든 테마 ID 목록
 */
export function getAvailableThemes(): ThemeId[] {
  return Object.keys(themeTokenMap) as ThemeId[]
}

/**
 * 테마 그룹별 분류
 */
export function getThemesByCategory() {
  const themes = getAvailableThemes()
  
  return {
    standard: themes.filter(id => !id.startsWith('stealth')),
    stealth: themes.filter(id => id.startsWith('stealth'))
  }
}

/**
 * 테마 메타데이터
 */
export const themeMetadata = {
  light: {
    name: '☀️ 화이트-블루',
    description: '깔끔한 화이트 배경과 블루 액센트',
    category: 'standard'
  },
  dark: {
    name: '🌙 퍼플-청록 드라큘라',
    description: '퍼플과 청록색이 조화로운 다크 테마',
    category: 'standard'
  },
  'high-contrast': {
    name: '⚡ 네온 오렌지-블랙',
    description: '네온 오렌지와 블랙의 강렬한 대비',
    category: 'standard'
  },
  stealth: {
    name: '📋 칸반보드 스타일',
    description: 'Trello 트렐로 테마 컬러',
    category: 'stealth'
  },
  'stealth-docs': {
    name: '📝 에디터 스타일',
    description: 'Google Docs 구글 독스 테마 컬러',
    category: 'stealth'
  },
  'stealth-slack': {
    name: '💬 메신저 스타일',
    description: 'Slack 슬랙 테마 컬러',
    category: 'stealth'
  },
  'stealth-notion': {
    name: '📄 노션 스타일',
    description: 'Notion 노션 테마 컬러',
    category: 'stealth'
  }
} as const

/**
 * 시스템 테마 감지
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 시스템 테마 변경 감지
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }
  
  mediaQuery.addEventListener('change', handler)
  
  return () => {
    mediaQuery.removeEventListener('change', handler)
  }
}