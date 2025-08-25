/**
 * 성능 모니터링 및 무한 루프 감지 유틸리티
 * 
 * 모바일 환경에서의 과도한 리렌더링과 무한 루프를 감지합니다.
 */

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  renderFrequency: number[];
  avgRenderTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private warningThreshold = 10; // 10회/초 이상이면 경고
  private emergencyThreshold = 20; // 20회/초 이상이면 비상

  /**
   * 컴포넌트의 렌더링을 기록합니다
   */
  recordRender(componentName: string) {
    const now = performance.now();
    const existing = this.metrics.get(componentName);

    if (!existing) {
      this.metrics.set(componentName, {
        renderCount: 1,
        lastRenderTime: now,
        renderFrequency: [now],
        avgRenderTime: 0
      });
      return;
    }

    existing.renderCount++;
    existing.renderFrequency.push(now);
    
    // 지난 1초간의 렌더링만 유지
    existing.renderFrequency = existing.renderFrequency.filter(
      time => now - time <= 1000
    );
    
    const frequency = existing.renderFrequency.length;
    
    // 경고 체크
    if (frequency >= this.emergencyThreshold) {
      console.error(`🚨 EMERGENCY: ${componentName} 무한 루프 감지! ${frequency}회/초`);
      this.emergencyAction(componentName);
    } else if (frequency >= this.warningThreshold) {
      console.warn(`⚠️ WARNING: ${componentName} 과도한 리렌더링! ${frequency}회/초`);
    }

    existing.lastRenderTime = now;
    existing.avgRenderTime = this.calculateAvgTime(existing.renderFrequency);
  }

  /**
   * 비상 조치 - 페이지 새로고침이나 경고
   */
  private emergencyAction(componentName: string) {
    // 모바일에서는 더 적극적인 조치
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      alert(`⚠️ 성능 문제 감지: ${componentName}\n\n페이지를 새로고침합니다.`);
      window.location.reload();
    } else {
      console.error(`데스크톱에서 ${componentName} 성능 문제 감지됨`);
    }
  }

  private calculateAvgTime(times: number[]): number {
    if (times.length < 2) return 0;
    const intervals = times.slice(1).map((time, i) => time - times[i]);
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  /**
   * 현재 성능 상태 출력
   */
  getReport(): string {
    let report = '📊 Performance Report:\n';
    
    for (const [component, metrics] of this.metrics) {
      const frequency = metrics.renderFrequency.length;
      const status = frequency >= this.emergencyThreshold ? '🚨 CRITICAL' :
                    frequency >= this.warningThreshold ? '⚠️ WARNING' : '✅ OK';
      
      report += `  ${component}: ${status} (${frequency}/sec, ${metrics.renderCount} total)\n`;
    }
    
    return report;
  }

  /**
   * 메트릭 초기화
   */
  clear() {
    this.metrics.clear();
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

/**
 * React 컴포넌트에서 사용할 훅
 */
export function usePerformanceMonitor(componentName: string) {
  performanceMonitor.recordRender(componentName);
}

// 개발 모드에서만 활성화
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 5초마다 성능 보고서 출력
  setInterval(() => {
    console.log(performanceMonitor.getReport());
  }, 5000);
}