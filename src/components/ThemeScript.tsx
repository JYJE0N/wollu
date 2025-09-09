'use client';

export const ThemeScript = () => {
  // FOUC를 방지하기 위한 인라인 스크립트
  // 페이지가 로드되기 전에 실행되어 테마를 즉시 적용
  const themeScript = `
    (function() {
      function getStoredTheme() {
        try {
          return localStorage.getItem('theme');
        } catch (e) {
          return null;
        }
      }
      
      function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      function applyTheme() {
        const stored = getStoredTheme();
        let theme = 'light';
        
        if (stored === 'dark' || stored === 'light') {
          theme = stored;
        } else if (stored === 'system' || !stored) {
          theme = getSystemTheme();
        }
        
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
        
        // CSS 변수 업데이트를 위한 이벤트 디스패치
        document.documentElement.setAttribute('data-theme', theme);
      }
      
      // DOM이 준비되기 전에 즉시 실행
      applyTheme();
      
      // 시스템 테마 변경 감지
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          const stored = getStoredTheme();
          if (!stored || stored === 'system') {
            applyTheme();
          }
        };
        
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange);
        } else {
          // 구형 브라우저 지원
          mediaQuery.addListener(handleChange);
        }
      }
    })();
  `;

  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
};