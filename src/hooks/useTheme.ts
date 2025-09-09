'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

// FOUC 방지를 위한 초기 테마 감지
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  
  // localStorage에서 저장된 테마 확인
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) return stored;
  
  return 'system';
};

// 시스템 테마 감지 함수
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 초기 해결된 테마 계산
const getInitialResolvedTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  
  return getSystemTheme();
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getInitialResolvedTheme);

  // 초기 로드 시 DOM에 즉시 클래스 적용 (FOUC 방지)
  useEffect(() => {
    const initialResolvedTheme = getInitialResolvedTheme();
    
    // 즉시 DOM에 적용
    if (initialResolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setResolvedTheme(initialResolvedTheme);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        effectiveTheme = prefersDark ? 'dark' : 'light';
      } else {
        effectiveTheme = theme as 'light' | 'dark';
      }

      setResolvedTheme(effectiveTheme);

      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
  };
};