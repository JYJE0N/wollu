"use client";

import Head from 'next/head';

interface SEOHeadProps {
  googleSiteVerification?: string;
  naverSiteVerification?: string;
}

/**
 * 검색 엔진 인증 및 SEO 관련 헤드 태그 컴포넌트
 * Google Search Console, 네이버 서치어드바이저 인증 코드 설정용
 */
export function SEOHead({ 
  googleSiteVerification, 
  naverSiteVerification 
}: SEOHeadProps) {
  return (
    <>
      {/* Google Search Console 인증 */}
      {googleSiteVerification && (
        <meta 
          name="google-site-verification" 
          content={googleSiteVerification} 
        />
      )}

      {/* 네이버 서치어드바이저 인증 */}
      {naverSiteVerification && (
        <meta 
          name="naver-site-verification" 
          content={naverSiteVerification} 
        />
      )}

      {/* 추가 검색 엔진 최적화 */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* 사이트 링크 */}
      <link rel="canonical" href="https://wollu.life" />
      
      {/* DNS 프리페치 */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

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
    </>
  );
}