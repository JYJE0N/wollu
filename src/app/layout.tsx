import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Korean Typing Master - 월루 타자연습',
  description: '한글/영문 타자연습 웹앱 - 정확한 IME 지원과 실시간 통계',
  keywords: '타자연습, 한글타자, 영문타자, 타이핑, Korean typing, 월루',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 테마 깜빡임 방지를 위한 SSR 안전 스크립트
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.className = theme;
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}