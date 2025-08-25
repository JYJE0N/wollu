/**
 * 번들 최적화 유틸리티
 * 동적 임포트와 프리로딩을 관리합니다
 */

// 주요 청크들의 프리로딩 관리
export const preloadChunks = {
  // Stats 페이지 관련 청크들을 미리 로딩
  stats: async () => {
    // 사용자가 타이핑을 시작하면 통계 컴포넌트들을 백그라운드에서 미리 로딩
    const [
      { TestResultSection },
      { TierSection },
      { RecentRecordsSection }, 
      { InsightsSection }
    ] = await Promise.all([
      import("@/components/stats/TestResultSection"),
      import("@/components/stats/TierSection"),
      import("@/components/stats/RecentRecordsSection"),
      import("@/components/stats/InsightsSection")
    ]);

    return {
      TestResultSection,
      TierSection, 
      RecentRecordsSection,
      InsightsSection
    };
  },

  // Recharts 라이브러리를 미리 로딩
  charts: async () => {
    return import("recharts");
  },

  // Stealth 모드 컴포넌트들 (stealth 테마 선택 시에만)
  stealth: async () => {
    const [
      { StealthKanban },
      { StealthDocs },
      { StealthSlack }
    ] = await Promise.all([
      import("@/components/stealth/StealthKanban"),
      import("@/components/stealth/StealthDocs"),
      import("@/components/stealth/StealthSlack")
    ]);

    return {
      StealthKanban,
      StealthDocs,
      StealthSlack
    };
  },

  // 승급 모달 (높은 성과 달성 시 미리 로딩)
  promotion: async () => {
    const { PromotionModal } = await import("@/components/gamification/PromotionModal");
    return { PromotionModal };
  }
};

// 조건부 프리로딩 로직
export class SmartPreloader {
  private preloadedChunks = new Set<string>();
  private preloadingPromises = new Map<string, Promise<any>>();

  // 타이핑 테스트 시작 시 호출 - Stats 관련 청크들을 미리 로딩
  preloadStatsComponents() {
    if (this.preloadedChunks.has('stats')) return;
    
    const preloadPromise = preloadChunks.stats();
    this.preloadingPromises.set('stats', preloadPromise);
    
    preloadPromise.then(() => {
      this.preloadedChunks.add('stats');
      console.log('📦 Stats 컴포넌트들 프리로딩 완료');
    });
  }

  // 높은 성과 감지 시 호출 - 승급 모달 미리 로딩  
  preloadPromotionModal() {
    if (this.preloadedChunks.has('promotion')) return;
    
    const preloadPromise = preloadChunks.promotion();
    this.preloadingPromises.set('promotion', preloadPromise);
    
    preloadPromise.then(() => {
      this.preloadedChunks.add('promotion');
      console.log('🏆 승급 모달 프리로딩 완료');
    });
  }

  // Stealth 테마 선택 시 호출
  preloadStealthComponents() {
    if (this.preloadedChunks.has('stealth')) return;
    
    const preloadPromise = preloadChunks.stealth();
    this.preloadingPromises.set('stealth', preloadPromise);
    
    preloadPromise.then(() => {
      this.preloadedChunks.add('stealth');
      console.log('🕵️ Stealth 컴포넌트들 프리로딩 완료');
    });
  }

  // 차트 집중 사용 감지 시 호출
  preloadChartsLibrary() {
    if (this.preloadedChunks.has('charts')) return;
    
    const preloadPromise = preloadChunks.charts();
    this.preloadingPromises.set('charts', preloadPromise);
    
    preloadPromise.then(() => {
      this.preloadedChunks.add('charts');
      console.log('📊 Recharts 라이브러리 프리로딩 완료');
    });
  }

  // 프리로딩된 컴포넌트 반환 (즉시 사용 가능)
  async getPreloadedComponent(chunkName: string) {
    if (this.preloadingPromises.has(chunkName)) {
      return await this.preloadingPromises.get(chunkName);
    }
    return null;
  }

  // 프리로딩 상태 확인
  isPreloaded(chunkName: string): boolean {
    return this.preloadedChunks.has(chunkName);
  }

  // 프리로딩 진행률 반환
  getPreloadProgress(): { loaded: number; total: number } {
    const totalChunks = ['stats', 'charts', 'stealth', 'promotion'];
    const loadedCount = totalChunks.filter(chunk => this.preloadedChunks.has(chunk)).length;
    
    return {
      loaded: loadedCount,
      total: totalChunks.length
    };
  }
}

// 전역 프리로더 인스턴스
export const smartPreloader = new SmartPreloader();

// 성능 기반 자동 프리로딩 트리거
export const performanceTriggeredPreloading = {
  // 타이핑 속도가 일정 수준 이상일 때 승급 모달 미리 로딩
  checkHighPerformance: (cpm: number, wpm: number) => {
    if (cpm > 400 || wpm > 80) {
      smartPreloader.preloadPromotionModal();
    }
  },

  // 테스트 완료까지 남은 시간이 적을 때 Stats 컴포넌트 미리 로딩
  checkNearCompletion: (progress: number) => {
    if (progress > 0.7) { // 70% 이상 진행시
      smartPreloader.preloadStatsComponents();
      smartPreloader.preloadChartsLibrary();
    }
  },

  // 사용자의 인터랙션 패턴 기반 프리로딩
  checkUserPattern: (theme: string, hasViewedStats: boolean) => {
    // Stealth 테마 사용자
    if (theme.startsWith('stealth')) {
      smartPreloader.preloadStealthComponents();
    }
    
    // 통계를 자주 보는 사용자
    if (hasViewedStats) {
      smartPreloader.preloadChartsLibrary();
    }
  }
};