/**
 * 타이핑 앱 - 핵심 디자인 토큰 시스템
 * 테마별 토큰 정의 및 관리
 */

export type ThemeTokens = {
  background: {
    primary: string
    secondary: string
    elevated: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  interactive: {
    primary: string
    primaryHover: string
    secondary: string 
    secondaryHover: string
    disabled: string
  }
  feedback: {
    success: string
    warning: string
    error: string
    info: string
  }
  typing: {
    correct: string
    incorrect: string
    current: string
    cursor: string
  }
}

// 다크 테마 토큰 (드라큘라 스타일)
export const darkTokens: ThemeTokens = {
  background: {
    primary: '#282a36',
    secondary: '#44475a',
    elevated: '#6272a4'
  },
  text: {
    primary: '#f8f8f2',
    secondary: '#bd93f9',
    tertiary: '#8be9fd',
    inverse: '#282a36'
  },
  interactive: {
    primary: '#ff79c6',
    primaryHover: '#ffb3d9',
    secondary: '#bd93f9',
    secondaryHover: '#d4b5fd',
    disabled: '#6272a4'
  },
  feedback: {
    success: '#50fa7b',
    warning: '#ffb86c',
    error: '#ff5555',
    info: '#8be9fd'
  },
  typing: {
    correct: '#50fa7b',
    incorrect: '#ff5555',
    current: '#f1fa8c',
    cursor: '#ff79c6'
  }
}

// 라이트 테마 토큰
export const lightTokens: ThemeTokens = {
  background: {
    primary: '#f8faf9',
    secondary: '#e8f5f0',
    elevated: '#f9fafb'
  },
  text: {
    primary: '#2d5a41',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    inverse: '#f9fafb'
  },
  interactive: {
    primary: '#ec4899',
    primaryHover: '#db2777',
    secondary: '#a855f7',
    secondaryHover: '#9333ea',
    disabled: '#9ca3af'
  },
  feedback: {
    success: '#10b981',
    warning: '#d97706',
    error: '#f472b6',
    info: '#6366f1'
  },
  typing: {
    correct: '#10b981',
    incorrect: '#f472b6',
    current: '#2d5a41',
    cursor: '#ec4899'
  }
}

// 고대비 테마 토큰
export const highContrastTokens: ThemeTokens = {
  background: {
    primary: '#0a0a0a',
    secondary: '#1c1c1e',
    elevated: '#1f2937'
  },
  text: {
    primary: '#ffffff',
    secondary: '#e9d5ff',
    tertiary: '#d1d5db',
    inverse: '#111827'
  },
  interactive: {
    primary: '#ff9f0a',
    primaryHover: '#ffb442',
    secondary: '#d1d5db',
    secondaryHover: '#e5e7eb',
    disabled: '#4b5563'
  },
  feedback: {
    success: '#32d74b',
    warning: '#ff9f0a',
    error: '#ff453a',
    info: '#818cf8'
  },
  typing: {
    correct: '#32d74b',
    incorrect: '#ff453a',
    current: '#ffffff',
    cursor: '#ff9f0a'
  }
}

// 은밀모드 토큰들
export const stealthTokens = {
  kanban: {
    background: {
      primary: '#f7f8fc',
      secondary: '#ffffff',
      elevated: '#f9fafb'
    },
    text: {
      primary: '#172b4d',
      secondary: '#5e6c84',
      tertiary: '#6b7280',
      inverse: '#f9fafb'
    },
    interactive: {
      primary: '#0052cc',
      primaryHover: '#0052cc',
      secondary: '#6b7280',
      secondaryHover: '#4b5563',
      disabled: '#d1d5db'
    },
    feedback: {
      success: '#00875a',
      warning: '#d97706',
      error: '#de350b',
      info: '#0052cc'
    },
    typing: {
      correct: '#00875a',
      incorrect: '#de350b',
      current: '#0052cc',
      cursor: '#0052cc'
    }
  } satisfies ThemeTokens,
  
  docs: {
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      elevated: '#f9fafb'
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
      tertiary: '#6b7280',
      inverse: '#f9fafb'
    },
    interactive: {
      primary: '#1a73e8',
      primaryHover: '#1557c2',
      secondary: '#6b7280',
      secondaryHover: '#4b5563',
      disabled: '#d1d5db'
    },
    feedback: {
      success: '#34a853',
      warning: '#d97706',
      error: '#ea4335',
      info: '#1a73e8'
    },
    typing: {
      correct: '#34a853',
      incorrect: '#ea4335',
      current: '#1a73e8',
      cursor: '#1a73e8'
    }
  } satisfies ThemeTokens,
  
  slack: {
    background: {
      primary: '#f8f8f8',
      secondary: '#ffffff',
      elevated: '#f9fafb'
    },
    text: {
      primary: '#1d1c1d',
      secondary: '#616061',
      tertiary: '#6b7280',
      inverse: '#f9fafb'
    },
    interactive: {
      primary: '#1264a3',
      primaryHover: '#0f4c75',
      secondary: '#6b7280',
      secondaryHover: '#4b5563',
      disabled: '#d1d5db'
    },
    feedback: {
      success: '#2eb67d',
      warning: '#d97706',
      error: '#e01e5a',
      info: '#1264a3'
    },
    typing: {
      correct: '#2eb67d',
      incorrect: '#e01e5a',
      current: '#1264a3',
      cursor: '#1264a3'
    }
  } satisfies ThemeTokens
}

// 테마 토큰 맵
export const themeTokenMap = {
  dark: darkTokens,
  light: lightTokens,
  'high-contrast': highContrastTokens,
  stealth: stealthTokens.kanban,
  'stealth-docs': stealthTokens.docs,
  'stealth-slack': stealthTokens.slack,
  'stealth-notion': {
    background: {
      primary: '#ffffff',
      secondary: '#f7f6f3',
      elevated: '#f1f1ef'
    },
    text: {
      primary: '#37352f',
      secondary: '#6f6e69',
      tertiary: '#9b9a97',
      inverse: '#ffffff'
    },
    interactive: {
      primary: '#2383e2',
      primaryHover: '#1a6bb8',
      secondary: '#6f6e69',
      secondaryHover: '#57564f',
      disabled: '#e9e9e7'
    },
    feedback: {
      success: '#0f7b6c',
      warning: '#f79009',
      error: '#d83b01',
      info: '#2383e2'
    },
    typing: {
      correct: '#0f7b6c',
      incorrect: '#d83b01',
      current: '#37352f',
      cursor: '#2383e2'
    }
  } satisfies ThemeTokens
} as const

export type ThemeId = keyof typeof themeTokenMap