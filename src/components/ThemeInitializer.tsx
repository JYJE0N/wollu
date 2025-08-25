'use client'

import { useEffect } from 'react'
import { initializeTheme } from '@/stores/settingsStore'

export function ThemeInitializer() {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    initializeTheme()
    
    // 테마가 적용된 후 화면 표시 표시
    document.documentElement.setAttribute('data-theme-loaded', 'true')
    document.documentElement.style.visibility = 'visible'
  }, [])

  return null
}