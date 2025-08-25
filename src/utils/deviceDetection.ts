/**
 * 디바이스 감지 및 UX 최적화 유틸리티
 * 
 * 목적:
 * - 가상 키보드 환경에서 단축키 표시 여부 결정
 * - 디바이스별 최적화된 UI 제공
 * - 일관된 타이핑 경험 보장
 */

import { useState, useEffect } from 'react';

export interface DeviceContext {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasVirtualKeyboard: boolean;
  showKeyboardShortcuts: boolean;
  screenWidth: number;
}

/**
 * 디바이스 컨텍스트 훅
 * 
 * 판단 기준:
 * - 모바일 (< 768px): 단축키 숨김, 가상키보드 고려
 * - 태블릿 (768px ~ 1024px): 단축키 표시, 외부키보드 가능성
 * - 데스크톱 (> 1024px): 모든 기능 표시
 */
export const useDeviceContext = (): DeviceContext => {
  const [deviceContext, setDeviceContext] = useState<DeviceContext>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasVirtualKeyboard: false,
    showKeyboardShortcuts: true,
    screenWidth: 1200 // SSR 기본값
  });

  useEffect(() => {
    const updateDeviceContext = () => {
      const width = window.innerWidth;
      const hasTouch = 'ontouchstart' in window;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      setDeviceContext({
        isMobile,
        isTablet,
        isDesktop,
        hasVirtualKeyboard: isMobile && hasTouch,
        showKeyboardShortcuts: !isMobile, // 모바일에서만 숨김
        screenWidth: width
      });
    };

    // 초기 설정 (hydration 후)
    updateDeviceContext();
    
    // 리사이즈 감지
    window.addEventListener('resize', updateDeviceContext);
    
    return () => {
      window.removeEventListener('resize', updateDeviceContext);
    };
  }, []);

  return deviceContext;
};

/**
 * 디바이스별 CSS 클래스명 생성
 */
export const getDeviceClassName = (context: DeviceContext): string => {
  if (context.isMobile) return 'mobile-device';
  if (context.isTablet) return 'tablet-device';
  return 'desktop-device';
};

/**
 * 타이핑 텍스트용 디바이스별 클래스명
 */
export const getTypingTextClassName = (context: DeviceContext): string => {
  const baseClass = 'typing-text-standardized';
  const deviceClass = getDeviceClassName(context);
  return `${baseClass} ${deviceClass}`;
};