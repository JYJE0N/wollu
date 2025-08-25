/**
 * AI 기반 개인화 연습 추천 시스템
 * 사용자의 타이핑 패턴, 실수, 성능 데이터를 분석하여 맞춤형 연습을 추천
 */

import type { WeakCharacter, MistakePattern } from '@/types'

// UserProgressStore의 TestRecord 인터페이스 사용
interface TestRecord {
  id: string
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

export interface UserAnalysis {
  // 기본 통계
  averageCPM: number
  averageAccuracy: number
  averageConsistency: number
  totalTests: number
  
  // 약점 분석
  weakCharacters: WeakCharacter[]
  commonMistakes: MistakePattern[]
  
  // 성능 트렌드
  recentTrend: 'improving' | 'stable' | 'declining'
  strengthAreas: string[]
  improvementAreas: string[]
}

export interface Recommendation {
  type: 'character_focus' | 'speed_building' | 'accuracy_training' | 'consistency_drill' | 'mixed_practice'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: number // 예상 개선 효과 (%)
  practiceSettings: {
    language: 'korean' | 'english'
    textType: 'words' | 'sentences'
    testMode: 'words' | 'sentences'
    testTarget: number
    sentenceLength?: 'short' | 'medium' | 'long'
    sentenceStyle?: 'plain' | 'punctuation' | 'numbers' | 'mixed'
    focusCharacters?: string[] // 특정 문자에 집중
  }
  expectedDuration: number // 분
  difficultyLevel: 1 | 2 | 3 | 4 | 5
}

export class AIRecommendationEngine {
  /**
   * 사용자 데이터를 종합 분석
   */
  analyzeUser(
    recentTests: TestRecord[],
    weakCharacters: WeakCharacter[],
    commonMistakes: MistakePattern[]
  ): UserAnalysis {
    if (recentTests.length === 0) {
      return this.getDefaultAnalysis()
    }

    const recent20Tests = recentTests.slice(0, 20)
    
    // 기본 통계 계산
    const averageCPM = recent20Tests.reduce((sum, test) => sum + test.cpm, 0) / recent20Tests.length
    const averageAccuracy = recent20Tests.reduce((sum, test) => sum + test.accuracy, 0) / recent20Tests.length
    const averageConsistency = recent20Tests.reduce((sum, test) => sum + (test.consistency || 85), 0) / recent20Tests.length
    
    // 성능 트렌드 분석
    const recentTrend = this.analyzeTrend(recent20Tests)
    
    // 강점/약점 영역 식별
    const strengthAreas = this.identifyStrengths(recent20Tests, weakCharacters)
    const improvementAreas = this.identifyImprovementAreas(recent20Tests, weakCharacters, commonMistakes)

    return {
      averageCPM,
      averageAccuracy,
      averageConsistency,
      totalTests: recentTests.length,
      weakCharacters: weakCharacters.slice(0, 10), // 상위 10개 약점
      commonMistakes: commonMistakes.slice(0, 10), // 상위 10개 실수 패턴
      recentTrend,
      strengthAreas,
      improvementAreas
    }
  }

  /**
   * 개인화된 연습 추천 생성
   */
  generateRecommendations(analysis: UserAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    // 1. 약점 문자 집중 연습
    if (analysis.weakCharacters.length > 0) {
      recommendations.push(this.createCharacterFocusRecommendation(analysis))
    }
    
    // 2. 속도 향상 연습
    if (analysis.averageCPM < 300) {
      recommendations.push(this.createSpeedBuildingRecommendation(analysis))
    }
    
    // 3. 정확도 개선 연습
    if (analysis.averageAccuracy < 95) {
      recommendations.push(this.createAccuracyTrainingRecommendation(analysis))
    }
    
    // 4. 일관성 향상 연습
    if (analysis.averageConsistency < 80) {
      recommendations.push(this.createConsistencyDrillRecommendation(analysis))
    }
    
    // 5. 종합 균형 연습
    recommendations.push(this.createMixedPracticeRecommendation(analysis))
    
    // 우선순위별 정렬
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority] || 
               b.estimatedImpact - a.estimatedImpact
      })
      .slice(0, 5) // 상위 5개 추천
  }

  /**
   * 약점 문자 집중 연습 추천
   */
  private createCharacterFocusRecommendation(analysis: UserAnalysis): Recommendation {
    const topWeakChars = analysis.weakCharacters.slice(0, 5).map(w => w.char)
    const avgErrorRate = analysis.weakCharacters.slice(0, 5)
      .reduce((sum, w) => sum + (w.errorRate || 0), 0) / 5

    return {
      type: 'character_focus',
      title: '약점 문자 집중 연습',
      description: `가장 어려워하는 문자들(${topWeakChars.join(', ')})을 집중적으로 연습하여 전체 정확도를 향상시킵니다.`,
      priority: avgErrorRate > 20 ? 'high' : avgErrorRate > 10 ? 'medium' : 'low',
      estimatedImpact: Math.min(avgErrorRate * 0.6, 25), // 최대 25% 개선
      practiceSettings: {
        language: 'korean', // 대부분 한글 약점 문자
        textType: 'words',
        testMode: 'words',
        testTarget: 25,
        focusCharacters: topWeakChars
      },
      expectedDuration: 15,
      difficultyLevel: Math.min(Math.ceil(avgErrorRate / 5), 5) as 1 | 2 | 3 | 4 | 5
    }
  }

  /**
   * 속도 향상 연습 추천
   */
  private createSpeedBuildingRecommendation(analysis: UserAnalysis): Recommendation {
    const targetCPM = Math.min(analysis.averageCPM * 1.2, 500) // 20% 향상 목표
    const speedGap = (300 - analysis.averageCPM) / 300 * 100

    return {
      type: 'speed_building',
      title: '타이핑 속도 향상 연습',
      description: `현재 ${Math.round(analysis.averageCPM)}CPM에서 ${Math.round(targetCPM)}CPM 목표로 단계적 속도 향상을 목표합니다.`,
      priority: speedGap > 50 ? 'high' : speedGap > 25 ? 'medium' : 'low',
      estimatedImpact: Math.min(speedGap * 0.3, 30),
      practiceSettings: {
        language: analysis.averageAccuracy > 95 ? 'korean' : 'english', // 정확도 높으면 한글 도전
        textType: 'sentences',
        testMode: 'sentences',
        testTarget: 60, // 60개 문장으로 속도에 집중
        sentenceLength: 'short' // 짧은 문장으로 리듬감 형성
      },
      expectedDuration: 20,
      difficultyLevel: Math.min(Math.ceil(speedGap / 20), 5) as 1 | 2 | 3 | 4 | 5
    }
  }

  /**
   * 정확도 개선 연습 추천
   */
  private createAccuracyTrainingRecommendation(analysis: UserAnalysis): Recommendation {
    const accuracyGap = 98 - analysis.averageAccuracy // 98% 목표
    const hasKoreanWeakness = analysis.weakCharacters.some(w => 
      /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(w.char)
    )

    return {
      type: 'accuracy_training',
      title: '정확도 향상 집중 훈련',
      description: `현재 ${analysis.averageAccuracy.toFixed(1)}%에서 98% 목표로 천천히 정확하게 타이핑하는 습관을 기릅니다.`,
      priority: accuracyGap > 5 ? 'high' : accuracyGap > 2 ? 'medium' : 'low',
      estimatedImpact: Math.min(accuracyGap * 0.8, 20),
      practiceSettings: {
        language: hasKoreanWeakness ? 'korean' : 'english',
        textType: 'words',
        testMode: 'words',
        testTarget: 50, // 적당한 분량으로 집중력 유지
      },
      expectedDuration: 25,
      difficultyLevel: Math.min(Math.ceil(accuracyGap / 2), 5) as 1 | 2 | 3 | 4 | 5
    }
  }

  /**
   * 일관성 향상 연습 추천
   */
  private createConsistencyDrillRecommendation(analysis: UserAnalysis): Recommendation {
    const consistencyGap = 90 - analysis.averageConsistency

    return {
      type: 'consistency_drill',
      title: '타이핑 일관성 향상 드릴',
      description: `리듬감 있는 균일한 타이핑으로 일관성을 ${Math.round(analysis.averageConsistency)}%에서 90%로 개선합니다.`,
      priority: consistencyGap > 15 ? 'high' : consistencyGap > 5 ? 'medium' : 'low',
      estimatedImpact: Math.min(consistencyGap * 0.7, 25),
      practiceSettings: {
        language: 'english', // 영문으로 리듬감 연습
        textType: 'sentences',
        testMode: 'sentences',
        testTarget: 120, // 120개 문장으로 긴 연습하여 일관성 확인
        sentenceLength: 'medium',
        sentenceStyle: 'plain'
      },
      expectedDuration: 30,
      difficultyLevel: Math.min(Math.ceil(consistencyGap / 5), 5) as 1 | 2 | 3 | 4 | 5
    }
  }

  /**
   * 종합 균형 연습 추천
   */
  private createMixedPracticeRecommendation(analysis: UserAnalysis): Recommendation {
    const overallLevel = this.calculateOverallLevel(analysis)
    
    return {
      type: 'mixed_practice',
      title: '종합 밸런스 연습',
      description: '속도, 정확도, 일관성을 모두 고려한 균형잡힌 타이핑 실력 향상을 위한 종합 연습입니다.',
      priority: 'medium',
      estimatedImpact: 15, // 안정적인 전반적 향상
      practiceSettings: {
        language: analysis.recentTrend === 'improving' ? 'korean' : 'english',
        textType: 'words',
        testMode: 'words',
        testTarget: 100,
      },
      expectedDuration: 25,
      difficultyLevel: Math.min(overallLevel + 1, 5) as 1 | 2 | 3 | 4 | 5
    }
  }

  /**
   * 성능 트렌드 분석
   */
  private analyzeTrend(recentTests: TestRecord[]): 'improving' | 'stable' | 'declining' {
    if (recentTests.length < 5) return 'stable'
    
    const recent5 = recentTests.slice(0, 5).map(t => t.cpm)
    const previous5 = recentTests.slice(5, 10).map(t => t.cpm)
    
    if (previous5.length === 0) return 'stable'
    
    const recentAvg = recent5.reduce((a, b) => a + b) / recent5.length
    const previousAvg = previous5.reduce((a, b) => a + b) / previous5.length
    
    const improvement = (recentAvg - previousAvg) / previousAvg * 100
    
    if (improvement > 5) return 'improving'
    if (improvement < -5) return 'declining'
    return 'stable'
  }

  /**
   * 강점 영역 식별
   */
  private identifyStrengths(tests: TestRecord[], weakChars: WeakCharacter[]): string[] {
    const strengths: string[] = []
    
    const avgAccuracy = tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length
    const avgCPM = tests.reduce((sum, t) => sum + t.cpm, 0) / tests.length
    const avgConsistency = tests.reduce((sum, t) => sum + (t.consistency || 85), 0) / tests.length
    
    if (avgAccuracy > 95) strengths.push('높은 정확도')
    if (avgCPM > 350) strengths.push('빠른 타이핑 속도')
    if (avgConsistency > 85) strengths.push('안정적인 일관성')
    if (weakChars.length < 3) strengths.push('균형잡힌 문자 숙련도')
    
    return strengths
  }

  /**
   * 개선 영역 식별
   */
  private identifyImprovementAreas(
    tests: TestRecord[], 
    weakChars: WeakCharacter[], 
    mistakes: MistakePattern[]
  ): string[] {
    const areas: string[] = []
    
    const avgAccuracy = tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length
    const avgCPM = tests.reduce((sum, t) => sum + t.cpm, 0) / tests.length
    const avgConsistency = tests.reduce((sum, t) => sum + (t.consistency || 85), 0) / tests.length
    
    if (avgAccuracy < 95) areas.push('정확도 개선 필요')
    if (avgCPM < 300) areas.push('타이핑 속도 향상 필요')
    if (avgConsistency < 80) areas.push('일관성 개선 필요')
    if (weakChars.length > 5) areas.push('특정 문자 약점 개선')
    if (mistakes.length > 8) areas.push('실수 패턴 교정')
    
    return areas
  }

  /**
   * 전체 수준 계산
   */
  private calculateOverallLevel(analysis: UserAnalysis): number {
    let level = 1
    
    if (analysis.averageCPM > 200) level++
    if (analysis.averageCPM > 350) level++
    if (analysis.averageAccuracy > 95) level++
    if (analysis.averageConsistency > 85) level++
    
    return Math.min(level, 5)
  }

  /**
   * 기본 분석 데이터 (신규 사용자용)
   */
  private getDefaultAnalysis(): UserAnalysis {
    return {
      averageCPM: 0,
      averageAccuracy: 0,
      averageConsistency: 0,
      totalTests: 0,
      weakCharacters: [],
      commonMistakes: [],
      recentTrend: 'stable',
      strengthAreas: [],
      improvementAreas: ['타이핑 기초 연습 시작']
    }
  }
}

// 전역 인스턴스
export const aiRecommendationEngine = new AIRecommendationEngine()