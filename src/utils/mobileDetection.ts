/**
 * 모바일 감지 유틸리티
 * 중복된 모바일 감지 로직을 통합하여 일관성 보장
 */

export interface MobileDetectionResult {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  userAgent: string;
}

/**
 * 브라우저 환경에서 모바일 기기를 감지
 * SSR 환경에서는 null 반환
 */
export function detectMobile(): MobileDetectionResult | null {
  // SSR 환경 체크
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;

  return {
    isIOS,
    isAndroid,
    isMobile,
    userAgent
  };
}

/**
 * React Hook에서 사용하기 위한 모바일 감지
 * useEffect 내부에서 사용 권장
 */
export function useMobileDetection() {
  const detection = detectMobile();
  
  return {
    isIOS: detection?.isIOS ?? false,
    isAndroid: detection?.isAndroid ?? false,
    isMobile: detection?.isMobile ?? false,
    isDesktop: detection ? !detection.isMobile : true
  };
}

/**
 * 레거시 호환성을 위한 간단한 모바일 체크
 */
export function isMobileDevice(): boolean {
  const detection = detectMobile();
  return detection?.isMobile ?? false;
}