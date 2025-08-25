/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // 다크모드 클래스 기반 
  darkMode: 'class',
  
  theme: {
    // 기본 설정 확장
    extend: {
      // 🎨 디자인 토큰 기반 컬러 시스템  
      colors: {
        // 그레이 스케일 (하드코딩 - 토큰 파일에서 가져올 수 없음)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6', 
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        
        // 브랜드 컬러
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff', 
          200: '#e9d5ff',
          300: '#d946ef',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        },
        
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8', 
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843'
        },
        
        // CSS 변수 기반 테마 컬러 (런타임 변경용)
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          elevated: 'var(--color-background-elevated)'
        },
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)', 
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          muted: 'var(--color-text-muted)'
        },
        interactive: {
          primary: 'var(--color-interactive-primary)',
          'primary-hover': 'var(--color-interactive-primary-hover)',
          secondary: 'var(--color-interactive-secondary)',
          'secondary-hover': 'var(--color-interactive-secondary-hover)',
          disabled: 'var(--color-interactive-disabled)'
        },
        feedback: {
          success: 'var(--color-feedback-success)',
          warning: 'var(--color-feedback-warning)',
          error: 'var(--color-feedback-error)',
          info: 'var(--color-feedback-info)'
        },
        typing: {
          correct: 'var(--color-typing-correct)',
          incorrect: 'var(--color-typing-incorrect)',
          current: 'var(--color-typing-current)',
          cursor: 'var(--color-typing-cursor)'
        },
        'button-group-default': 'var(--color-button-group-default)',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        'text-on-primary': 'var(--color-text-inverse)'
      },
      backgroundColor: {
        'button-group-default': 'var(--color-button-group-default)',
        'elevated': 'var(--color-elevated)',
        'interactive-primary': 'var(--color-interactive-primary)',
        'feedback-success': 'var(--color-feedback-success)',
        'feedback-error': 'var(--color-feedback-error)',
        'interactive-secondary': 'var(--color-interactive-secondary)'
      },
      textColor: {
        'text-on-primary': 'var(--color-text-inverse)'
      },
      borderColor: {
        'border': 'var(--color-border)'
      },

      // 🔤 타이포그래피
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        korean: ['Pretendard', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif']
      },
      
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem'  // 36px
      },
      
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      },

      // 📏 스페이싱 
      spacing: {
        0: '0',
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        10: '2.5rem',   // 40px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
        20: '5rem',     // 80px
        24: '6rem'      // 96px
      },

      // 🔳 보더
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem', 
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
      },
      
      borderWidth: {
        0: '0px',
        1: '1px',
        2: '2px',
        4: '4px'
      },

      // 🌑 그림자
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        
        // 컬러별 그림자
        purple: '0 4px 14px 0 rgb(168 85 247 / 0.39)',
        pink: '0 4px 14px 0 rgb(244 114 182 / 0.39)',
        blue: '0 4px 14px 0 rgb(99 102 241 / 0.39)',
        
        // 커스텀 그림자
        'typing-focus': '0 0 0 2px var(--color-typing-cursor)',
        'card-hover': '0 4px 12px rgb(0 0 0 / 0.08)',
        'button-primary': '0 2px 8px var(--color-interactive-primary)',
      },

      // ⚡ 애니메이션
      transitionDuration: {
        fast: '150ms',
        base: '200ms', 
        slow: '300ms',
        slower: '500ms'
      },
      
      transitionTimingFunction: {
        linear: 'linear',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },

      // 💫 키프레임
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-cursor': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0.3' }
        },
        'typing-wave': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.2)' }
        }
      },
      
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'pulse-cursor': 'pulse-cursor 1s ease-in-out infinite',
        'typing-wave': 'typing-wave 0.6s ease-in-out infinite'
      },

      // 📱 반응형 브레이크포인트 (기본값 유지 + 추가)
      screens: {
        'xs': '475px',
        // 기본: sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
        '3xl': '1920px'
      },

      // 🎯 타이핑 특화 유틸리티 (typography 플러그인용)
      typography: {
        'typing': {
          css: {
            fontFamily: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'].join(', '),
            fontSize: '1.125rem',
            lineHeight: '1.75',
            letterSpacing: '0.02em'
          }
        }
      }
    }
  },
  
  plugins: [
    // 타이포그래피 플러그인
    require('@tailwindcss/typography'),
    
    // 커스텀 플러그인 - 타이핑 특화 유틸리티
    function({ addUtilities, addComponents, theme }) {
      // 🎯 타이핑 컴포넌트 스타일
      addComponents({
        '.typing-text': {
          fontFamily: theme('fontFamily.mono'),
          fontSize: theme('fontSize.lg'),
          lineHeight: theme('lineHeight.relaxed'),
          letterSpacing: '0.02em',
          userSelect: 'none',
          caretColor: 'transparent'
        },
        
        '.typing-char': {
          position: 'relative',
          transition: `all ${theme('transitionDuration.base')} ${theme('transitionTimingFunction.out')}`
        },
        
        '.typing-char--correct': {
          color: 'var(--color-typing-correct)',
          backgroundColor: 'transparent'
        },
        
        '.typing-char--incorrect': {
          color: 'var(--color-typing-incorrect)',
          backgroundColor: 'rgb(from var(--color-typing-incorrect) r g b / 0.1)',
          borderRadius: theme('borderRadius.sm')
        },
        
        '.typing-char--current': {
          color: 'var(--color-typing-current)',
          backgroundColor: 'var(--color-typing-cursor)',
          borderRadius: theme('borderRadius.sm'),
          animation: 'pulse-cursor 1s ease-in-out infinite'
        },

        // 🎯 버튼 시스템 - 기본
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: `all ${theme('transitionDuration.base')} ${theme('transitionTimingFunction.out')}`,
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px var(--color-interactive-primary-hover)`
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed'
          },
          '&:active': {
            transform: 'scale(0.98)'
          }
        },

        '.btn-primary': {
          backgroundColor: 'var(--color-interactive-primary)',
          color: 'var(--color-text-inverse)',
          border: '1px solid transparent',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--color-interactive-primary-hover)',
            transform: 'scale(1.02)'
          }
        },

        '.btn-secondary': {
          backgroundColor: 'var(--color-background-secondary)',
          color: 'var(--color-text-primary)',
          border: '1px solid rgb(from var(--color-text-tertiary) r g b / 0.2)',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--color-background-elevated)',
            borderColor: 'rgb(from var(--color-text-tertiary) r g b / 0.4)'
          }
        },

        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          border: '1px solid transparent',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--color-background-secondary)',
            color: 'var(--color-text-primary)'
          }
        },

        '.btn-outline': {
          backgroundColor: 'transparent',
          color: 'var(--color-text-primary)',
          border: '1px solid rgb(from var(--color-interactive-primary) r g b / 0.5)',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--color-interactive-primary)',
            color: 'var(--color-text-inverse)',
            borderColor: 'var(--color-interactive-primary)'
          }
        },

        '.btn-accent': {
          backgroundColor: 'var(--color-interactive-secondary)',
          color: 'var(--color-text-primary)',
          border: '1px solid transparent',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--color-interactive-secondary-hover)'
          }
        },

        // 버튼 크기
        '.btn-sm': {
          padding: `${theme('spacing.1')} ${theme('spacing.3')}`,
          fontSize: theme('fontSize.sm')
        },

        '.btn-md': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.base')
        },

        '.btn-lg': {
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontSize: theme('fontSize.lg')
        },

        '.btn-xl': {
          padding: `${theme('spacing.4')} ${theme('spacing.8')}`,
          fontSize: theme('fontSize.xl')
        },

        // 🕴️ 은밀모드 카드 스타일 
        '.stealth-card': {
          backgroundColor: 'var(--color-surface)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.4'),
          boxShadow: theme('boxShadow.card-hover'),
          border: `1px solid ${theme('colors.gray.200')}`,
          transition: `all ${theme('transitionDuration.base')} ${theme('transitionTimingFunction.out')}`
        },
        
        '.stealth-card:hover': {
          boxShadow: theme('boxShadow.md'),
          transform: 'translateY(-1px)'
        },

        // 📊 통계 카드
        '.stats-card': {
          backgroundColor: 'var(--color-surface)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.lg'),
          border: '1px solid rgb(from var(--color-interactive-primary) r g b / 0.1)'
        }
      })

      // 🎨 유틸리티 클래스
      addUtilities({
        '.text-balance': {
          textWrap: 'balance'
        },
        
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },

        // 포커스 스타일
        '.focus-ring': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: theme('boxShadow.typing-focus')
          }
        }
      })
    }
  ]
}