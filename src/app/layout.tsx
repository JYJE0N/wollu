import type { Metadata, Viewport } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: '월루타자기 | 한글 타자 연습',
  description: '직장인을 위한 한글 타자 연습 사이트. 실시간 통계, 승급 시스템, 개인 맞춤형 연습으로 타이핑 실력을 향상시키세요.',
  keywords: '한글타자, 타자연습, 한글입력, 타이핑게임, 직장인타자, 월루타자기, 온라인타자연습',
  authors: [{ name: 'JYJE0N', url: 'https://github.com/JYJE0N' }],
  creator: 'JYJE0N',
  metadataBase: new URL('https://wollu.life'),
  alternates: {
    canonical: 'https://wollu.life',
    languages: {
      'ko-KR': 'https://wollu.life',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://wollu.life',
    title: '월루타자기 | 한글 타자 연습',
    description: '직장인을 위한 한글 타자 연습 사이트. 실시간 통계, 승급 시스템, 개인 맞춤형 연습으로 타이핑 실력을 향상시키세요.',
    siteName: '월루타자기',
    images: [
      {
        url: '/og-img.png',
        width: 1200,
        height: 630,
        alt: '월루타자기 - 한글 타자 연습 사이트',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '월루타자기 | 한글 타자 연습',
    description: '직장인을 위한 한글 타자 연습 사이트',
    images: ['/og-img.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'NBj8i5W4ffEnEjNCP_3hNDKN8nGmg90O4jFr8Byps4M',
    other: {
      'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || '0370b05b6fb92f802be03da314e9d80b9500db60',
      'daum-webmaster-tool': process.env.NEXT_PUBLIC_DAUM_WEBMASTER_TOOL || 'd5ca83cd0bb0664c0080673864cfd4b0e25a58b79b411d4887e842cd5ec563e0:K3+ujZin6cvemyrY776OoQ==',
    }
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

// 🔧 모바일 최적화를 위한 viewport 설정 추가
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="preload"
        />
        <link
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 테마 초기화 - 페이지 로드 전에 실행
              (function() {
                try {
                  // localStorage에서 저장된 설정 불러오기
                  const stored = localStorage.getItem('typing-settings');
                  let theme = 'light'; // 기본값
                  
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    theme = parsed.state?.theme || 'light';
                  }
                  
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-theme-loaded', 'true');
                  
                  console.log('Theme initialized:', theme);
                } catch (e) {
                  // 기본 라이트 테마 사용
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.setAttribute('data-theme-loaded', 'true');
                  console.log('Fallback theme set: light');
                }
              })();
            `,
          }}
        />
        
        {/* 구조화 데이터 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "월루타자기",
              "description": "직장인을 위한 한글 타자 연습 사이트. 실시간 통계, 승급 시스템, 개인 맞춤형 연습으로 타이핑 실력을 향상시키세요.",
              "url": "https://wollu.life",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "KRW"
              },
              "author": {
                "@type": "Person",
                "name": "JYJE0N",
                "url": "https://github.com/JYJE0N"
              },
              "inLanguage": "ko-KR",
              "potentialAction": {
                "@type": "UseAction",
                "target": "https://wollu.life"
              },
              "featureList": [
                "실시간 타이핑 통계",
                "한글 IME 완벽 지원", 
                "승급 시스템",
                "개인 맞춤형 연습",
                "약점 분석",
                "다양한 테마 지원"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen text-text-primary antialiased" style={{ backgroundColor: 'var(--color-background)' }}>
        {children}
      </body>
    </html>
  )
}