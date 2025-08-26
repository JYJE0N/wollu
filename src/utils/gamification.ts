// 게임화 시스템을 위한 타입 정의 (이전 MongoDB 모델 대신)
interface IBadge {
  id: string
  name: string
  description: string
  icon: string
  condition?: string
  points?: number
  value?: number
  unlockedAt?: Date
}

interface ITierInfo {
  tier: string
  tierPoints: number
  totalXP: number
  level: number
}

interface IPromotion {
  isActive: boolean
  fromTier: string
  toTier: string
  attempts: number
  progress: number
  requiredWins: number
  currentWins: number
  lastAttempt?: Date
}

// 등급 시스템 정의
export const TIER_THRESHOLDS = {
  bronze: { min: 0, max: 199, color: '#CD7F32', icon: 'Medal' },
  silver: { min: 200, max: 299, color: '#C0C0C0', icon: 'Award' },
  gold: { min: 300, max: 399, color: '#FFD700', icon: 'Trophy' },
  diamond: { min: 400, max: 499, color: '#B9F2FF', icon: 'Gem' },
  platinum: { min: 500, max: 999, color: '#E5E4E2', icon: 'Crown' }
} as const

export type TierType = keyof typeof TIER_THRESHOLDS

// 뱃지 정의
export const BADGES = {
  // 속도 달성
  SPEED_100: { id: 'speed_100', name: '첫 발걸음', description: '100 CPM 달성', icon: 'Walking', threshold: 100 },
  SPEED_200: { id: 'speed_200', name: '조깅', description: '200 CPM 달성', icon: 'PersonStanding', threshold: 200 },
  SPEED_300: { id: 'speed_300', name: '질주', description: '300 CPM 달성', icon: 'Bike', threshold: 300 },
  SPEED_400: { id: 'speed_400', name: '번개', description: '400 CPM 달성', icon: 'Zap', threshold: 400 },
  SPEED_500: { id: 'speed_500', name: '초음속', description: '500 CPM 달성', icon: 'Rocket', threshold: 500 },
  
  // 정확도 달성
  ACCURACY_95: { id: 'accuracy_95', name: '정확한 손가락', description: '95% 정확도 달성', icon: 'Target', threshold: 95 },
  ACCURACY_98: { id: 'accuracy_98', name: '저격수', description: '98% 정확도 달성', icon: 'Crosshair', threshold: 98 },
  ACCURACY_100: { id: 'accuracy_100', name: '완벽주의자', description: '100% 정확도 달성', icon: 'CheckCircle', threshold: 100 },
  
  // 연속 기록
  STREAK_7: { id: 'streak_7', name: '주간 전사', description: '7일 연속 연습', icon: 'Calendar', threshold: 7 },
  STREAK_30: { id: 'streak_30', name: '월간 챔피언', description: '30일 연속 연습', icon: 'CalendarDays', threshold: 30 },
  STREAK_100: { id: 'streak_100', name: '백일장', description: '100일 연속 연습', icon: 'Trophy', threshold: 100 },
  
  // 테스트 횟수
  TESTS_10: { id: 'tests_10', name: '초심자', description: '첫 10회 테스트 완료', icon: 'Sprout', threshold: 10 },
  TESTS_50: { id: 'tests_50', name: '열정가', description: '50회 테스트 완료', icon: 'Flame', threshold: 50 },
  TESTS_100: { id: 'tests_100', name: '센츄리온', description: '100회 테스트 완료', icon: 'Dumbbell', threshold: 100 },
  
  // 특별 달성
  FIRST_PLATINUM: { id: 'first_platinum', name: '플래티넘 개척자', description: '최초 플래티넘 달성', icon: 'Crown', threshold: 1 },
  PROMOTION_MASTER: { id: 'promotion_master', name: '승급 마스터', description: '5번의 승급전 성공', icon: 'TrendingUp', threshold: 5 }
} as const

// CPM을 기반으로 등급 계산
export function calculateTier(cpm: number): TierType {
  for (const [tier, threshold] of Object.entries(TIER_THRESHOLDS)) {
    if (cpm >= threshold.min && cpm <= threshold.max) {
      return tier as TierType
    }
  }
  return 'platinum' // 500+ CPM
}

// 등급 내 포인트 계산 (0-100)
export function calculateTierPoints(cpm: number, tier: TierType): number {
  const threshold = TIER_THRESHOLDS[tier]
  if (tier === 'platinum') {
    // 플래티넘은 500부터 시작해서 무한대이므로 특별 계산
    return Math.min(100, ((cpm - 500) / 100) * 100)
  }
  const range = threshold.max - threshold.min + 1
  const progress = cpm - threshold.min
  return Math.round((progress / range) * 100)
}

// 경험치 계산
export function calculateXP(cpm: number, accuracy: number, duration: number): number {
  const baseXP = Math.round(cpm * (duration / 60)) // 분당 CPM
  const accuracyBonus = Math.round(baseXP * (accuracy / 100))
  const durationBonus = Math.round(duration / 60) * 5 // 분당 5 보너스
  
  return baseXP + accuracyBonus + durationBonus
}

// 레벨 계산 (총 경험치 기반)
export function calculateLevel(totalXP: number): number {
  // 레벨 1: 0 XP
  // 레벨 2: 100 XP
  // 레벨 3: 300 XP (200 추가)
  // 레벨 4: 600 XP (300 추가)
  // 각 레벨마다 필요 XP가 100씩 증가
  
  let level = 1
  let requiredXP = 0
  let increment = 100
  
  while (totalXP >= requiredXP + increment) {
    requiredXP += increment
    level++
    increment += 100
    if (level >= 100) break
  }
  
  return Math.min(level, 100)
}

// 뱃지 확인 및 지급
export function checkBadgeUnlock(
  cpm: number, 
  accuracy: number, 
  streak: number, 
  totalTests: number,
  currentBadges: IBadge[]
): IBadge[] {
  const newBadges: IBadge[] = []
  const existingBadgeIds = new Set(currentBadges.map(b => b.id))
  
  // 속도 뱃지
  for (const badge of Object.values(BADGES)) {
    if (existingBadgeIds.has(badge.id)) continue
    
    let shouldUnlock = false
    let value = 0
    
    if (badge.id.startsWith('speed_') && cpm >= badge.threshold) {
      shouldUnlock = true
      value = cpm
    } else if (badge.id.startsWith('accuracy_') && accuracy >= badge.threshold) {
      shouldUnlock = true  
      value = accuracy
    } else if (badge.id.startsWith('streak_') && streak >= badge.threshold) {
      shouldUnlock = true
      value = streak
    } else if (badge.id.startsWith('tests_') && totalTests >= badge.threshold) {
      shouldUnlock = true
      value = totalTests
    }
    
    if (shouldUnlock) {
      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        unlockedAt: new Date(),
        value
      })
    }
  }
  
  return newBadges
}

// 승급전 시작 조건 확인
export function canStartPromotion(tierInfo: ITierInfo, promotion: IPromotion): boolean {
  // 이미 승급전 중이면 불가
  if (promotion.isActive) return false
  
  // 플래티넘은 승급전 없음
  if (tierInfo.tier === 'platinum') return false
  
  // 해당 등급에서 80점 이상이어야 승급전 가능
  return tierInfo.tierPoints >= 80
}

// 승급전 진행
export function processPromotionTest(
  testResult: { cpm: number, accuracy: number },
  promotion: IPromotion,
  targetTier: TierType
): { success: boolean, completed: boolean, newPromotion: IPromotion } {
  const threshold = TIER_THRESHOLDS[targetTier]
  const success = testResult.cpm >= threshold.min && testResult.accuracy >= 85
  
  const newPromotion = { ...promotion }
  newPromotion.attempts++
  newPromotion.lastAttempt = new Date()
  
  if (success) {
    newPromotion.currentWins++
  } else {
    newPromotion.currentWins = 0 // 실패하면 연승 초기화
  }
  
  const completed = newPromotion.currentWins >= newPromotion.requiredWins
  
  if (completed) {
    // 승급 성공
    newPromotion.isActive = false
    newPromotion.progress = 100
  } else {
    // 진행률 업데이트
    newPromotion.progress = (newPromotion.currentWins / newPromotion.requiredWins) * 100
  }
  
  return { success, completed, newPromotion }
}

// 등급 정보 표시용 문자열
export function getTierDisplayName(tier: TierType): string {
  const names = {
    bronze: '브론즈',
    silver: '실버', 
    gold: '골드',
    diamond: '다이아몬드',
    platinum: '플래티넘'
  }
  return names[tier]
}

// 다음 등급까지 필요한 CPM
export function getCPMToNextTier(currentTier: TierType): number | null {
  const tiers = ['bronze', 'silver', 'gold', 'diamond', 'platinum'] as const
  const currentIndex = tiers.indexOf(currentTier)
  
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null // 플래티넘이 최고 등급
  }
  
  const nextTier = tiers[currentIndex + 1]
  return TIER_THRESHOLDS[nextTier].min
}