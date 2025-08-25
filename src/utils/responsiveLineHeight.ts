/**
 * 반응형 줄간격 계산 유틸리티
 * 갤럭시탭과 같은 태블릿 가로모드에서 일관된 줄간격 제공
 */

export interface ViewportInfo {
  width: number;
  height: number;
  aspectRatio: number;
  isLandscape: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface LineHeightConfig {
  mobile: number;
  tablet: number;
  tabletLandscape: number;
  desktop: number;
}

const DEFAULT_LINE_HEIGHT_CONFIG: LineHeightConfig = {
  mobile: 1.3,      // 모바일 세로: 매우 촘촘하게
  tablet: 1.4,      // 태블릿 세로: 촘촘하게
  tabletLandscape: 1.15, // 태블릿 가로: 더욱 극도로 촘촘하게 (단어 25개 모드 최적화)
  desktop: 1.25     // 데스크톱: 더 촘촘하게 (단어 모드 최적화)
};

/**
 * 현재 뷰포트 정보를 분석하여 ViewportInfo 반환
 */
export function getViewportInfo(): ViewportInfo {
  if (typeof window === 'undefined') {
    return {
      width: 1920,
      height: 1080,
      aspectRatio: 1.78,
      isLandscape: true,
      deviceType: 'desktop'
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  const isLandscape = width > height;

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  // 디바이스 타입 판정
  if (width <= 768) {
    deviceType = 'mobile';
  } else if (width <= 1024) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  return {
    width,
    height,
    aspectRatio,
    isLandscape,
    deviceType
  };
}

/**
 * 현재 뷰포트에 최적화된 줄간격 계산
 */
export function getOptimalLineHeight(config: Partial<LineHeightConfig> = {}): number {
  const finalConfig = { ...DEFAULT_LINE_HEIGHT_CONFIG, ...config };
  const viewport = getViewportInfo();

  switch (viewport.deviceType) {
    case 'mobile':
      return finalConfig.mobile;
      
    case 'tablet':
      // 태블릿에서 가로 모드일 때 특별 처리
      if (viewport.isLandscape) {
        return finalConfig.tabletLandscape;
      }
      return finalConfig.tablet;
      
    case 'desktop':
    default:
      return finalConfig.desktop;
  }
}

/**
 * CSS 변수로 줄간격 업데이트
 */
export function updateLineHeightCSS(lineHeight?: number) {
  if (typeof document === 'undefined') return;

  const calculatedLineHeight = lineHeight ?? getOptimalLineHeight();
  
  // 단어 25개 모드 특별 처리 - 가로모드에서 더욱 촘촘하게
  const currentMode = document.querySelector('[data-testmode]')?.getAttribute('data-testmode');
  const currentTarget = document.querySelector('[data-testtarget]')?.getAttribute('data-testtarget');
  const viewport = getViewportInfo();
  
  let finalLineHeight = calculatedLineHeight;
  
  if (currentMode === 'words' && currentTarget === '25') {
    if (viewport.deviceType === 'desktop' || (viewport.deviceType === 'tablet' && viewport.isLandscape)) {
      finalLineHeight = Math.min(calculatedLineHeight * 0.9, 1.1); // 10% 더 촘촘하게, 최대 1.1
      console.log(`🎯 단어 25개 모드 특별 처리: ${calculatedLineHeight} → ${finalLineHeight}`);
    }
  }
  
  // CSS 변수 업데이트
  document.documentElement.style.setProperty(
    '--typing-line-height-responsive', 
    finalLineHeight.toString()
  );
  
  // 기존 변수도 업데이트 (하위 호환성)
  document.documentElement.style.setProperty(
    '--typing-line-height-unified', 
    finalLineHeight.toString()
  );

  // 주요 변수도 업데이트
  document.documentElement.style.setProperty(
    '--typing-line-height', 
    finalLineHeight.toString()
  );

  console.log(`📏 Line height updated: ${finalLineHeight} (${viewport.deviceType} ${viewport.isLandscape ? 'landscape' : 'portrait'})`);
}

/**
 * 뷰포트 변경 감지하여 자동으로 줄간격 업데이트
 */
export function initResponsiveLineHeight(config?: Partial<LineHeightConfig>) {
  if (typeof window === 'undefined') return;

  // 초기 설정
  updateLineHeightCSS(getOptimalLineHeight(config));

  // 리사이즈 이벤트 리스너
  let resizeTimeout: NodeJS.Timeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateLineHeightCSS(getOptimalLineHeight(config));
    }, 100);
  };

  // 오리엔테이션 변경 이벤트 리스너 (모바일/태블릿)
  const handleOrientationChange = () => {
    // 오리엔테이션 변경 후 약간의 지연을 두고 업데이트
    setTimeout(() => {
      updateLineHeightCSS(getOptimalLineHeight(config));
    }, 200);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);

  // 클린업 함수 반환
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
    clearTimeout(resizeTimeout);
  };
}