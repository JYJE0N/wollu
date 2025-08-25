/**
 * 모바일 감지 유틸리티
 * 중복된 모바일 감지 로직을 통합하여 일관성 보장
 */

export interface MobileDetectionResult {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  userAgent: string;
  isIPad?: boolean;
  isIPhone?: boolean;
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
  // iPad 감지 개선 (iOS 13+ Safari에서 데스크톱 모드 요청 시 iPad가 Mac으로 표시되는 문제 해결)
  const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIPhone = /iPhone|iPod/.test(userAgent);
  const isIOS = isIPad || isIPhone;
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;

  return {
    isIOS,
    isAndroid,
    isMobile,
    userAgent,
    // 추가 정보
    isIPad,
    isIPhone
  };
}

/**
 * iOS 가상키보드 활성화 감지
 * viewport height 변화를 통해 감지
 */
export function detectIOSVirtualKeyboard(): boolean {
  if (typeof window === 'undefined') return false;
  
  const detection = detectMobile();
  if (!detection?.isIOS) return false;
  
  // iOS에서 가상키보드가 활성화되면 window.innerHeight가 줄어듦
  const currentHeight = window.innerHeight;
  const screenHeight = window.screen.height;
  
  // 화면 높이의 75% 미만이면 키보드가 활성화된 것으로 판단
  return currentHeight < (screenHeight * 0.75);
}

/**
 * iOS 가상키보드 상태 변화 감지를 위한 이벤트 리스너
 */
export function setupIOSKeyboardDetection(
  onKeyboardShow: () => void,
  onKeyboardHide: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const detection = detectMobile();
  if (!detection?.isIOS) return () => {};
  
  let previousHeight = window.innerHeight;
  const threshold = window.screen.height * 0.75;
  
  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const keyboardShown = currentHeight < threshold;
    const wasKeyboardShown = previousHeight < threshold;
    
    if (keyboardShown && !wasKeyboardShown) {
      onKeyboardShow();
    } else if (!keyboardShown && wasKeyboardShown) {
      onKeyboardHide();
    }
    
    previousHeight = currentHeight;
  };
  
  // iOS에서 가상키보드는 resize와 visualViewport 이벤트 모두 감지 필요
  window.addEventListener('resize', handleResize);
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
  }
  
  // 클린업 함수 반환
  return () => {
    window.removeEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize);
    }
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