/**
 * 🏆 동적 티어 시스템
 * 하드코딩 없는 완전 설정 가능한 티어 및 승급 시스템
 */

// ===============================
// 1. 티어 정의 시스템
// ===============================

// 사용자 성능 데이터 인터페이스
export interface UserPerformanceData {
  userId: string
  weightedScore: number
  averageCPM: number
  averageAccuracy: number
  averageConsistency: number
  totalTests: number
  lastUpdated: Date
}

export interface TierConfig {
  id: string
  name: string
  icon: string
  color: string
  gradient: [string, string]
  minPercentile: number  // 최소 백분위수 (0-100)
  maxPercentile: number  // 최대 백분위수 (0-100)
  minTests: number       // 최소 테스트 횟수 (신뢰성 확보)
  description: string
  rewards: {
    title: string
    badge?: string
    theme?: string
  }
}

export interface TierRequirements {
  percentile: {
    current: number      // 현재 백분위수
    required: number     // 다음 티어 필요 백분위수
    progress: number     // 진행률
  }
  tests: {
    current: number      // 현재 테스트 횟수
    required: number     // 필요 테스트 횟수
    progress: number     // 진행률
  }
  ranking: {
    current: number      // 현재 순위
    total: number        // 전체 사용자 수
    percentile: number   // 백분위수
  }
}

// ===============================
// 2. 기본 티어 설정 (동적 수정 가능)
// ===============================

export const DEFAULT_TIERS: TierConfig[] = [
  {
    id: 'bronze',
    name: '브론즈',
    icon: 'B',
    color: '#CD7F32',
    gradient: ['#CD7F32', '#B8860B'],
    minPercentile: 0,
    maxPercentile: 39,    // 하위 40%
    minTests: 1,
    description: '타이핑 여정의 시작',
    rewards: {
      title: '새내기 타이피스트',
    }
  },
  {
    id: 'silver',
    name: '실버',
    icon: 'S',
    color: '#C0C0C0',
    gradient: ['#C0C0C0', '#A9A9A9'],
    minPercentile: 40,
    maxPercentile: 59,    // 40-60%
    minTests: 3,
    description: '기초를 다진 타이피스트',
    rewards: {
      title: '기초 마스터',
      badge: 'silver-achiever'
    }
  },
  {
    id: 'gold',
    name: '골드',
    icon: 'G',
    color: '#B8860B',
    gradient: ['#FFD700', '#FFA500'],
    minPercentile: 60,
    maxPercentile: 79,    // 60-80%
    minTests: 5,
    description: '숙련된 타이핑 실력자',
    rewards: {
      title: '골든 핑거',
      badge: 'gold-master',
      theme: 'gold-theme'
    }
  },
  {
    id: 'platinum',
    name: '플래티넘',
    icon: 'P',
    color: '#E5E4E2',
    gradient: ['#E5E4E2', '#BFBFBF'],
    minPercentile: 80,
    maxPercentile: 89,    // 80-90%
    minTests: 10,
    description: '전문가 수준의 타이핑',
    rewards: {
      title: '플래티넘 엘리트',
      badge: 'platinum-elite',
      theme: 'platinum-theme'
    }
  },
  {
    id: 'diamond',
    name: '다이아',
    icon: 'D',
    color: '#B9F2FF',
    gradient: ['#B9F2FF', '#87CEEB'],
    minPercentile: 90,
    maxPercentile: 95,    // 90-96%
    minTests: 15,
    description: '최고의 타이피스트',
    rewards: {
      title: '다이아 마스터',
      badge: 'diamond-legend',
      theme: 'diamond-theme'
    }
  },
  {
    id: 'master',
    name: '마스터',
    icon: 'M',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#F7931E'],
    minPercentile: 96,
    maxPercentile: 100,   // 상위 4%
    minTests: 20,
    description: '타이핑계의 전설',
    rewards: {
      title: '타이핑 레전드',
      badge: 'master-legend',
      theme: 'master-theme'
    }
  }
]

// ===============================
// 3. 티어 계산 로직
// ===============================

export class TierSystem {
  private tiers: TierConfig[]
  private userDatabase: UserPerformanceData[] = [] // 실제로는 DB에서 가져옴
  
  constructor(customTiers?: TierConfig[]) {
    this.tiers = customTiers || DEFAULT_TIERS
    // 티어를 minPercentile 기준으로 정렬
    this.tiers.sort((a, b) => a.minPercentile - b.minPercentile)
  }

  /**
   * 가중치 기반 종합 점수 계산
   */
  calculateWeightedScore(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }): number {
    const weights = {
      cpm: 0.5,          // 50% - 타이핑 속도가 가장 중요
      accuracy: 0.3,     // 30% - 정확도
      consistency: 0.15, // 15% - 일관성
      experience: 0.05   // 5% - 경험치 (테스트 횟수)
    }
    
    // 정규화된 점수들
    const normalizedCPM = Math.min(stats.averageCPM / 600, 1) * 100        // 600타를 만점으로
    const normalizedAccuracy = stats.averageAccuracy                        // 이미 0-100
    const normalizedConsistency = stats.averageConsistency                  // 이미 0-100
    const normalizedExperience = Math.min(stats.totalTests / 50, 1) * 100  // 50회를 만점으로
    
    const weightedScore = 
      normalizedCPM * weights.cpm +
      normalizedAccuracy * weights.accuracy +
      normalizedConsistency * weights.consistency +
      normalizedExperience * weights.experience
    
    return Math.round(weightedScore * 100) / 100 // 소수점 둘째자리까지
  }

  /**
   * 백분위수 계산 (모든 사용자 대비)
   */
  calculatePercentile(userScore: number, allUserScores: number[]): number {
    if (allUserScores.length === 0) return 50 // 데이터가 없으면 중간값
    
    const sortedScores = allUserScores.sort((a, b) => a - b)
    const lowerCount = sortedScores.filter(score => score < userScore).length
    
    return Math.round((lowerCount / sortedScores.length) * 100)
  }

  /**
   * 현재 통계를 기반으로 티어 계산 (백분위수 기반)
   */
  calculateCurrentTier(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }, allUserScores?: number[]): TierConfig {
    const userScore = this.calculateWeightedScore(stats)
    
    // 모든 사용자 점수가 없으면 임시 데이터 사용
    const scores = allUserScores || this.generateSampleScores()
    const percentile = this.calculatePercentile(userScore, scores)
    
    // 최소 테스트 횟수 조건도 확인
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      const tier = this.tiers[i]
      
      if (percentile >= tier.minPercentile && 
          percentile <= tier.maxPercentile &&
          stats.totalTests >= tier.minTests) {
        return tier
      }
    }
    
    // 조건을 만족하는 티어가 없으면 첫 번째 티어 (브론즈)
    return this.tiers[0]
  }

  /**
   * 다음 티어까지의 진행률 계산 (백분위수 기반)
   */
  calculateProgress(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }, allUserScores?: number[]): TierRequirements | null {
    const scores = allUserScores || this.generateSampleScores()
    const userScore = this.calculateWeightedScore(stats)
    const currentPercentile = this.calculatePercentile(userScore, scores)
    
    const currentTier = this.calculateCurrentTier(stats, allUserScores)
    const nextTier = this.getNextTier(currentTier.id)
    
    if (!nextTier) return null // 이미 최고 티어
    
    // 현재 순위 계산
    const sortedScores = scores.sort((a, b) => b - a) // 내림차순
    const currentRank = sortedScores.findIndex(score => score <= userScore) + 1
    
    return {
      percentile: {
        current: currentPercentile,
        required: nextTier.minPercentile,
        progress: currentPercentile >= nextTier.minPercentile ? 100 : 
                 Math.round((currentPercentile / nextTier.minPercentile) * 100)
      },
      tests: {
        current: stats.totalTests,
        required: nextTier.minTests,
        progress: Math.min(100, (stats.totalTests / nextTier.minTests) * 100)
      },
      ranking: {
        current: currentRank,
        total: scores.length,
        percentile: currentPercentile
      }
    }
  }

  /**
   * 임시 사용자 점수 데이터 생성 (실제로는 DB에서 가져옴)
   */
  private generateSampleScores(): number[] {
    const scores = []
    
    // 정규분포를 따르는 점수 생성 (평균 65, 표준편차 20)
    for (let i = 0; i < 1000; i++) {
      const random1 = Math.random()
      const random2 = Math.random()
      const gaussian = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2)
      const score = Math.max(0, Math.min(100, 65 + gaussian * 20))
      scores.push(Math.round(score * 100) / 100)
    }
    
    return scores
  }

  /**
   * 승급 가능 여부 확인
   */
  canPromote(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }): { canPromote: boolean; nextTier?: TierConfig; missingRequirements?: string[] } {
    const currentTier = this.calculateCurrentTier(stats)
    const nextTier = this.getNextTier(currentTier.id)
    
    if (!nextTier) {
      return { canPromote: false }
    }
    
    const missingRequirements: string[] = []
    
    const progress = this.calculateProgress(stats)
    
    if (!progress || progress.ranking.percentile < nextTier.minPercentile) {
      missingRequirements.push(`백분위 ${nextTier.minPercentile}% 달성 필요`)
    }
    if (stats.totalTests < nextTier.minTests) {
      missingRequirements.push(`테스트 ${nextTier.minTests - stats.totalTests}회 부족`)
    }
    
    return {
      canPromote: missingRequirements.length === 0,
      nextTier,
      missingRequirements: missingRequirements.length > 0 ? missingRequirements : undefined
    }
  }

  /**
   * 승급전 시뮬레이션
   */
  simulatePromotion(currentStats: {
    averageCPM: number
    averageAccuracy: number  
    averageConsistency: number
    totalTests: number
  }, testResult: {
    cpm: number
    accuracy: number
    consistency: number
  }): {
    beforeTier: TierConfig
    afterTier: TierConfig
    promoted: boolean
    newStats: typeof currentStats
  } {
    const beforeTier = this.calculateCurrentTier(currentStats)
    
    // 새로운 통계 계산 (가중 평균)
    const totalTests = currentStats.totalTests + 1
    const weight = totalTests > 10 ? 0.1 : 1 / totalTests // 최근 10회는 10% 가중치
    
    const newStats = {
      averageCPM: currentStats.averageCPM * (1 - weight) + testResult.cpm * weight,
      averageAccuracy: currentStats.averageAccuracy * (1 - weight) + testResult.accuracy * weight,
      averageConsistency: currentStats.averageConsistency * (1 - weight) + testResult.consistency * weight,
      totalTests
    }
    
    const afterTier = this.calculateCurrentTier(newStats)
    
    return {
      beforeTier,
      afterTier,
      promoted: beforeTier.id !== afterTier.id,
      newStats
    }
  }

  // ===============================
  // 헬퍼 메소드들
  // ===============================

  private meetsRequirements(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }, tier: TierConfig): boolean {
    if (stats.totalTests < tier.minTests) {
      return false
    }
    
    const progress = this.calculateProgress(stats)
    if (!progress) return false
    
    return progress.ranking.percentile >= tier.minPercentile
  }

  private getNextTier(currentTierId: string): TierConfig | null {
    const currentIndex = this.tiers.findIndex(tier => tier.id === currentTierId)
    if (currentIndex === -1 || currentIndex === this.tiers.length - 1) {
      return null
    }
    return this.tiers[currentIndex + 1]
  }

  /**
   * 모든 티어 정보 반환
   */
  getAllTiers(): TierConfig[] {
    return [...this.tiers]
  }

  /**
   * 특정 티어 정보 반환
   */
  getTier(tierId: string): TierConfig | null {
    return this.tiers.find(tier => tier.id === tierId) || null
  }

  /**
   * 커스텀 티어 추가
   */
  addCustomTier(tier: TierConfig): void {
    this.tiers.push(tier)
    this.tiers.sort((a, b) => a.minPercentile - b.minPercentile)
  }

  /**
   * 티어 설정 수정
   */
  updateTier(tierId: string, updates: Partial<TierConfig>): boolean {
    const index = this.tiers.findIndex(tier => tier.id === tierId)
    if (index === -1) return false
    
    this.tiers[index] = { ...this.tiers[index], ...updates }
    this.tiers.sort((a, b) => a.minPercentile - b.minPercentile)
    return true
  }
}

// ===============================
// 4. 기본 티어 시스템 인스턴스
// ===============================

export const defaultTierSystem = new TierSystem()

// ===============================
// 5. 티어 유틸리티 함수들
// ===============================

/**
 * 티어 색상 가져오기
 */
export function getTierColor(tier: TierConfig, variant: 'solid' | 'gradient' = 'solid'): string {
  if (variant === 'gradient') {
    return `linear-gradient(135deg, ${tier.gradient[0]}, ${tier.gradient[1]})`
  }
  return tier.color
}

/**
 * 티어 진행률을 시각적으로 표현
 */
export function formatProgress(progress: number): {
  percentage: string
  color: string
  description: string
} {
  const percentage = `${Math.round(progress)}%`
  
  let color = '#gray'
  let description = '시작 단계'
  
  if (progress >= 90) {
    color = '#22c55e'
    description = '거의 달성!'
  } else if (progress >= 70) {
    color = '#f59e0b'  
    description = '순조한 진행'
  } else if (progress >= 40) {
    color = '#3b82f6'
    description = '진행 중'
  }
  
  return { percentage, color, description }
}

/**
 * 승급 축하 메시지 생성
 */
export function generatePromotionMessage(fromTier: TierConfig, toTier: TierConfig): {
  title: string
  message: string
  celebration: string
} {
  return {
    title: `${toTier.name} 티어 승급!`,
    message: `${fromTier.name}에서 ${toTier.name}으로 승급하셨습니다!\n새로운 타이틀: ${toTier.rewards.title}`,
    celebration: `${toTier.icon} ${toTier.description}`
  }
}