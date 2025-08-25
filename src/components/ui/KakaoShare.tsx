"use client";

import { useEffect } from 'react';

interface KakaoShareProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  webUrl?: string;
  className?: string;
}

/**
 * 카카오톡 공유하기 컴포넌트
 * 카카오 SDK를 사용하여 링크를 카카오톡으로 공유
 */
export function KakaoShare({ 
  title = '월루타자기 | 한글 타자 연습',
  description = '실시간 통계, 승급 시스템, 맞춤형 연습으로 타이핑 실력을 향상시키세요!',
  imageUrl = 'https://wollu.life/og-img.png',
  webUrl = 'https://wollu.life',
  className = ''
}: KakaoShareProps) {
  
  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = () => {
      // 환경변수에서 JavaScript 키 가져오기
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      
      if (!kakaoKey) {
        console.warn('⚠️ KAKAO JavaScript 키가 설정되지 않았습니다.');
        return;
      }

      // 카카오 SDK가 로드되었는지 확인
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
        console.log('✅ Kakao SDK 초기화 완료');
      }
    };

    // 카카오 SDK 스크립트 로드
    if (!window.Kakao) {
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
      script.crossOrigin = 'anonymous';
      script.onload = initKakao;
      document.head.appendChild(script);
    } else {
      initKakao();
    }
  }, []);

  // 카카오톡 공유하기 실행
  const handleKakaoShare = () => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert('카카오 SDK가 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: imageUrl,
          link: {
            mobileWebUrl: webUrl,
            webUrl: webUrl,
          },
        },
        buttons: [
          {
            title: '타이핑 연습하기',
            link: {
              mobileWebUrl: webUrl,
              webUrl: webUrl,
            },
          },
        ],
        installTalk: true,
      });
    } catch (error) {
      console.error('❌ 카카오톡 공유 오류:', error);
      alert('카카오톡 공유 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleKakaoShare}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={{
        backgroundColor: '#FEE500',
        color: '#3C1E1E',
        border: '1px solid #F5D400',
      }}
    >
      {/* 카카오톡 아이콘 SVG */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M10 0C4.477 0 0 3.71 0 8.286c0 2.626 1.7 4.934 4.266 6.324l-.834 3.077c-.082.304.27.548.53.367L7.63 15.71c.717.093 1.473.142 2.37.142 5.523 0 10-3.71 10-8.286S15.523 0 10 0z"/>
      </svg>
      카카오톡 공유
    </button>
  );
}

// TypeScript를 위한 window 객체 확장
declare global {
  interface Window {
    Kakao: any;
  }
}