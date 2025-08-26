import { useState, useEffect } from 'react';

/**
 * 가상 키보드 감지 유틸리티
 * iPad mini 등 모바일 기기의 가상 키보드 상태를 감지합니다.
 */

// 가상 키보드 상태 인터페이스
interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
  isSupported: boolean;
}

// Visual Viewport API 지원 여부 확인
const isVisualViewportSupported = (): boolean => {
  return typeof window !== 'undefined' && 'visualViewport' in window;
};

// iPad/iPhone 감지
const isIOS = (): boolean => {
  return typeof window !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// iPad 전용 감지 (iPhone과 구분)
const isIPad = (): boolean => {
  return typeof window !== 'undefined' && 
    (/iPad/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
};

/**
 * 가상 키보드 감지 훅
 * Visual Viewport API와 fallback 방법을 모두 사용
 */
export const useVirtualKeyboardDetection = (): VirtualKeyboardState => {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0,
    isSupported: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialViewportHeight = window.innerHeight;
    let isSupported = false;

    const updateKeyboardState = (isVisible: boolean, height: number = 0) => {
      setKeyboardState(prev => ({
        ...prev,
        isVisible,
        height,
        isSupported
      }));
    };

    // Visual Viewport API 사용 (최신 브라우저)
    if (isVisualViewportSupported()) {
      isSupported = true;
      const visualViewport = window.visualViewport!;
      
      const handleViewportChange = () => {
        const currentHeight = visualViewport.height;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // 키보드가 나타났다고 판단하는 임계값 (100px)
        const isKeyboardVisible = heightDifference > 100;
        updateKeyboardState(isKeyboardVisible, heightDifference);
      };

      visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        visualViewport.removeEventListener('resize', handleViewportChange);
      };
    }

    // Fallback: window.innerHeight 변화 감지
    if (isIOS()) {
      isSupported = true;
      
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // iOS에서 키보드 감지 임계값 (150px)
        const isKeyboardVisible = heightDifference > 150;
        updateKeyboardState(isKeyboardVisible, heightDifference);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // 기본값 설정
    setKeyboardState(prev => ({
      ...prev,
      isSupported: false
    }));

  }, []);

  return keyboardState;
};

/**
 * iPad mini 전용 가상 키보드 감지
 * iPad mini에 최적화된 감지 로직
 */
export const useIPadVirtualKeyboard = () => {
  const keyboardState = useVirtualKeyboardDetection();
  const isPadDevice = isIPad();

  return {
    ...keyboardState,
    isIPad: isPadDevice,
    // iPad에서 가상 키보드가 활성화된 상태
    isIPadVirtualKeyboard: isPadDevice && keyboardState.isVisible
  };
};

/**
 * 가상 키보드 상태에 따른 타이밍 설정
 */
export const getKeyboardTimingConfig = (isVirtualKeyboard: boolean) => {
  return {
    compositionTimeout: isVirtualKeyboard ? 150 : 50,
    debounceTimeout: isVirtualKeyboard ? 200 : 100,
    inputDelay: isVirtualKeyboard ? 50 : 0
  };
};

/**
 * 단순 가상 키보드 감지 (훅이 아닌 함수)
 */
export const detectVirtualKeyboard = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Visual Viewport API 지원시
  if (isVisualViewportSupported()) {
    const viewport = window.visualViewport!;
    const heightDifference = window.screen.height - viewport.height;
    return heightDifference > 100;
  }
  
  // iOS fallback
  if (isIOS()) {
    const heightRatio = window.innerHeight / window.screen.height;
    return heightRatio < 0.75; // 화면의 75% 미만이면 키보드 활성화로 판단
  }
  
  return false;
};

// 내보내기
export { isIOS, isIPad, isVisualViewportSupported };