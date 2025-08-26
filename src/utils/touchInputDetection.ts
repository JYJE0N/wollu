import { useState, useEffect, useRef } from 'react';

/**
 * 터치 입력 감지 유틸리티
 * 물리 키보드와 터치 기반 입력을 구분합니다.
 * iPad mini의 가상 키보드 입력에 최적화됩니다.
 */

// 터치 입력 상태
interface TouchInputState {
  isTouchInput: boolean;
  lastTouchTime: number;
  touchInputActive: boolean;
}

/**
 * 터치 기반 입력 감지 훅
 * iPad에서만 활성화되며 안드로이드/PC는 기존 로직 유지
 */
export const useTouchInputDetection = () => {
  const [touchState, setTouchState] = useState<TouchInputState>({
    isTouchInput: false,
    lastTouchTime: 0,
    touchInputActive: false
  });

  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // iPad 감지
  const isIPad = (): boolean => {
    return typeof window !== 'undefined' && 
      (/iPad/.test(navigator.userAgent) || 
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  };

  useEffect(() => {
    // iPad에서만 터치 입력 감지 활성화
    if (!isIPad()) {
      return;
    }

    const handleTouchStart = () => {
      const now = Date.now();
      setTouchState(prev => ({
        ...prev,
        isTouchInput: true,
        lastTouchTime: now,
        touchInputActive: true
      }));

      // 3초 후 터치 입력 모드 해제
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      
      touchTimeoutRef.current = setTimeout(() => {
        setTouchState(prev => ({
          ...prev,
          touchInputActive: false
        }));
      }, 3000) as NodeJS.Timeout;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // 물리 키보드 입력 감지
      // iPad 외부 키보드 연결시에는 터치 모드 비활성화
      if (e.isTrusted && !e.key.includes('Unidentified')) {
        setTouchState(prev => ({
          ...prev,
          isTouchInput: false,
          touchInputActive: false
        }));
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...touchState,
    isIPad: isIPad(),
    // iPad에서 터치 입력이 활성화된 상태
    isIPadTouchInput: isIPad() && touchState.touchInputActive
  };
};

/**
 * 터치 입력 상태에 따른 입력 설정 반환
 */
export const getTouchInputConfig = (isTouchInput: boolean) => {
  // iPad 터치 입력시에만 특별 설정 적용
  if (isTouchInput) {
    return {
      debounceTime: 200,        // 일반 100ms → 200ms
      compositionWait: 150,     // 일반 50ms → 150ms  
      inputDelay: 50,           // 추가 지연
      preventDuplicates: true   // 중복 입력 방지 강화
    };
  }

  // 기본 설정 (안드로이드, PC 유지)
  return {
    debounceTime: 100,
    compositionWait: 50,
    inputDelay: 0,
    preventDuplicates: false
  };
};

/**
 * 최근 터치 입력 여부 확인 (훅이 아닌 함수)
 */
export const isRecentTouchInput = (): boolean => {
  // iPad가 아니면 false
  if (typeof window === 'undefined') return false;
  
  const isIPadDevice = /iPad/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
  if (!isIPadDevice) return false;

  // 최근 3초 내 터치 이벤트가 있었는지 확인
  const lastTouch = sessionStorage.getItem('lastTouchTime');
  if (!lastTouch) return false;

  const timeDiff = Date.now() - parseInt(lastTouch);
  return timeDiff < 3000; // 3초 내 터치 입력
};

/**
 * 터치 입력 시간 기록 (전역 사용)
 */
export const recordTouchInput = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('lastTouchTime', Date.now().toString());
  }
};