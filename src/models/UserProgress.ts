import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITestRecord {
  date: Date
  mode: string
  textType: string
  language: string
  duration: number
  wordsTyped: number
  cpm: number
  wpm: number
  accuracy: number
  consistency: number
  mistakes: number
  keystrokes: number
}

export interface ICharacterStats {
  char: string
  totalAttempts: number
  mistakes: number
  averageTime: number
}

export interface IMistakePattern {
  wrong: string
  correct: string
  count: number
}

export interface IBadge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  value?: number // 달성 시 기록 (예: 첫 300타 달성 시 300)
}

export interface ITierInfo {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum'
  tierPoints: number // 해당 등급 내 포인트 (0-100)
  totalXP: number // 총 경험치
  level: number // 전체 레벨 (1-100)
}

export interface IPromotion {
  isActive: boolean
  fromTier: string
  toTier: string
  attempts: number
  progress: number // 0-100
  requiredWins: number
  currentWins: number
  lastAttempt: Date | null
}

export interface IUserProgress extends Document {
  userId: string
  username?: string
  email?: string
  
  // 최고 기록
  bestCPM: number
  bestWPM: number
  bestAccuracy: number
  bestConsistency: number
  
  // 게임화 요소
  tierInfo: ITierInfo
  badges: IBadge[]
  promotion: IPromotion
  
  // 누적 통계
  totalTests: number
  totalTime: number
  totalWords: number
  totalKeystrokes: number
  totalMistakes: number
  
  // 평균 통계
  averageCPM: number
  averageWPM: number
  averageAccuracy: number
  averageConsistency: number
  
  // 향상도 추적
  improvementTrend: number[]
  lastTestDate: Date | null
  
  // 약점 분석
  weakCharacters: ICharacterStats[]
  commonMistakes: IMistakePattern[]
  
  // 테스트 기록
  recentTests: ITestRecord[]
  
  // 스트릭
  currentStreak: number
  longestStreak: number
  lastStreakDate: Date | null
  
  createdAt: Date
  updatedAt: Date
  
  // Methods
  addTestRecord(record: ITestRecord): Promise<void>
  updateStreak(): Promise<void>
}

const TestRecordSchema = new Schema<ITestRecord>({
  date: { type: Date, required: true },
  mode: { type: String, required: true },
  textType: { type: String, required: true },
  language: { type: String, required: true },
  duration: { type: Number, required: true },
  wordsTyped: { type: Number, required: true },
  cpm: { type: Number, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  consistency: { type: Number, default: 0 },
  mistakes: { type: Number, required: true },
  keystrokes: { type: Number, required: true },
})

const CharacterStatsSchema = new Schema<ICharacterStats>({
  char: { type: String, required: true },
  totalAttempts: { type: Number, default: 0 },
  mistakes: { type: Number, default: 0 },
  averageTime: { type: Number, default: 0 },
})

const MistakePatternSchema = new Schema<IMistakePattern>({
  wrong: { type: String, required: true },
  correct: { type: String, required: true },
  count: { type: Number, default: 1 },
})

const BadgeSchema = new Schema<IBadge>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  unlockedAt: { type: Date, required: true },
  value: { type: Number }
})

const TierInfoSchema = new Schema<ITierInfo>({
  tier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'diamond', 'platinum'],
    default: 'bronze' 
  },
  tierPoints: { type: Number, default: 0 },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 }
})

const PromotionSchema = new Schema<IPromotion>({
  isActive: { type: Boolean, default: false },
  fromTier: { type: String, default: '' },
  toTier: { type: String, default: '' },
  attempts: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  requiredWins: { type: Number, default: 3 },
  currentWins: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: null }
})

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    username: { type: String, sparse: true },
    email: { type: String, sparse: true },
    
    // 최고 기록
    bestCPM: { type: Number, default: 0 },
    bestWPM: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    bestConsistency: { type: Number, default: 0 },
    
    // 게임화 요소
    tierInfo: { type: TierInfoSchema, default: () => ({}) },
    badges: { type: [BadgeSchema], default: [] },
    promotion: { type: PromotionSchema, default: () => ({}) },
    
    // 누적 통계
    totalTests: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    totalKeystrokes: { type: Number, default: 0 },
    totalMistakes: { type: Number, default: 0 },
    
    // 평균 통계
    averageCPM: { type: Number, default: 0 },
    averageWPM: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    averageConsistency: { type: Number, default: 0 },
    
    // 향상도 추적
    improvementTrend: [{ type: Number }],
    lastTestDate: { type: Date, default: null },
    
    // 약점 분석
    weakCharacters: [CharacterStatsSchema],
    commonMistakes: [MistakePatternSchema],
    
    // 테스트 기록 (최근 50개만 유지)
    recentTests: {
      type: [TestRecordSchema],
      validate: [arrayLimit, '{PATH} exceeds the limit of 50']
    },
    
    // 스트릭
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStreakDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

function arrayLimit(val: unknown[]) {
  return val.length <= 50
}

// 인덱스 생성
UserProgressSchema.index({ userId: 1, 'recentTests.date': -1 })
UserProgressSchema.index({ bestWPM: -1 })
UserProgressSchema.index({ totalTests: -1 })

// 가상 속성
UserProgressSchema.virtual('level').get(function() {
  const wpm = this.averageWPM
  if (wpm < 20) return 'Beginner'
  if (wpm < 40) return 'Intermediate'
  if (wpm < 60) return 'Advanced'
  if (wpm < 80) return 'Expert'
  return 'Master'
})

// 메서드 (버전 충돌 방지)
UserProgressSchema.methods.addTestRecord = async function(record: ITestRecord) {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      // 최신 문서 다시 가져오기 (버전 충돌 방지)
      const Model = this.constructor as any;
      const latest = await Model.findById(this._id);
      if (!latest) {
        throw new Error('Document not found');
      }

      // 최신 데이터로 업데이트
      latest.recentTests.unshift(record);
      if (latest.recentTests.length > 50) {
        latest.recentTests = latest.recentTests.slice(0, 50);
      }
      
      // 최고 기록 업데이트
      latest.bestCPM = Math.max(latest.bestCPM, record.cpm);
      latest.bestWPM = Math.max(latest.bestWPM, record.wpm);
      latest.bestAccuracy = Math.max(latest.bestAccuracy, record.accuracy);
      latest.bestConsistency = Math.max(latest.bestConsistency, record.consistency);
      
      // 누적 통계 업데이트
      latest.totalTests++;
      latest.totalTime += record.duration;
      latest.totalWords += record.wordsTyped;
      latest.totalKeystrokes += record.keystrokes;
      latest.totalMistakes += record.mistakes;
      
      // 평균 계산 (division by zero 방지)
      const timeInMinutes = latest.totalTime / 60;
      latest.averageCPM = timeInMinutes > 0 ? latest.totalKeystrokes / timeInMinutes : 0;
      latest.averageWPM = timeInMinutes > 0 ? latest.totalWords / timeInMinutes : 0;
      latest.averageAccuracy = latest.totalKeystrokes > 0 ? 
        ((latest.totalKeystrokes - latest.totalMistakes) / latest.totalKeystrokes) * 100 : 100;
      latest.averageConsistency = latest.recentTests.length > 0 ? 
        latest.recentTests.reduce((sum: number, test: ITestRecord) => sum + test.consistency, 0) / latest.recentTests.length : 100;
      
      // 향상도 추적
      latest.improvementTrend.unshift(record.wpm);
      if (latest.improvementTrend.length > 10) {
        latest.improvementTrend = latest.improvementTrend.slice(0, 10);
      }
      
      latest.lastTestDate = new Date();
      
      // 저장 시도
      await latest.save();
      
      // 성공 시 현재 객체도 업데이트
      Object.assign(this, latest.toObject());
      return this;
      
    } catch (error: any) {
      attempts++;
      
      if (error.name === 'VersionError' && attempts < maxRetries) {
        // 짧은 지연 후 재시도
        await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        continue;
      }
      
      // 최대 재시도 횟수 초과 또는 다른 에러
      throw error;
    }
  }
  
  throw new Error(`Failed to save after ${maxRetries} attempts`);
}

UserProgressSchema.methods.updateStreak = async function() {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      // 최신 문서 다시 가져오기 (버전 충돌 방지)
      const Model = this.constructor as any;
      const latest = await Model.findById(this._id);
      if (!latest) {
        throw new Error('Document not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastDate = latest.lastStreakDate ? new Date(latest.lastStreakDate) : null;
      if (lastDate) lastDate.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        latest.currentStreak = 1;
      } else {
        const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 0) {
          // 같은 날 - 변경 없음
        } else if (dayDiff === 1) {
          // 연속
          latest.currentStreak++;
        } else {
          // 끊김
          latest.currentStreak = 1;
        }
      }
      
      latest.longestStreak = Math.max(latest.longestStreak, latest.currentStreak);
      latest.lastStreakDate = today;
      
      // 저장 시도
      await latest.save();
      
      // 성공 시 현재 객체도 업데이트
      Object.assign(this, latest.toObject());
      return this;
      
    } catch (error: any) {
      attempts++;
      
      if (error.name === 'VersionError' && attempts < maxRetries) {
        // 짧은 지연 후 재시도
        await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        continue;
      }
      
      // 최대 재시도 횟수 초과 또는 다른 에러
      throw error;
    }
  }
  
  throw new Error(`Failed to update streak after ${maxRetries} attempts`);
}

// 모델이 이미 컴파일되었는지 확인
const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema)

export default UserProgress