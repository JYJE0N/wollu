/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS 변수를 통한 테마 시스템
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        surface: 'var(--color-surface)',
        primary: {
          DEFAULT: 'var(--color-interactive-primary)',
          hover: 'var(--color-interactive-primary-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        feedback: {
          success: 'var(--color-feedback-success)',
          error: 'var(--color-feedback-error)',
          warning: 'var(--color-feedback-warning)',
        },
        typing: {
          correct: 'var(--typing-correct)',
          incorrect: 'var(--typing-incorrect)',
          current: 'var(--typing-current)',
          pending: 'var(--typing-pending)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'typing': '1.5rem',
        'typing-lg': '2rem',
        'typing-xl': '2.5rem',
      },
      spacing: {
        'typing': '0.125rem',
      },
      animation: {
        'cursor-blink': 'blink 1s infinite',
        'progress-fill': 'progress 0.3s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
    },
  },
  plugins: [],
};