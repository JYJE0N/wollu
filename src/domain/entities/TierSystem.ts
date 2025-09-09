export type TierLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER';

export interface TierRequirement {
  level: TierLevel;
  minCharactersTyped: number;
  minAverageWpm: number;
  minAccuracy: number;
  minSessions: number;
  color: string;
  icon: string;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
}

export interface TierProgress {
  currentTier: TierLevel;
  nextTier: TierLevel | null;
  progressToNext: number; // 0-100 percentage
  requirementsForNext: {
    charactersTyped: { current: number; required: number; met: boolean };
    averageWpm: { current: number; required: number; met: boolean };
    accuracy: { current: number; required: number; met: boolean };
    sessions: { current: number; required: number; met: boolean };
  } | null;
}

export const TIER_REQUIREMENTS: Record<TierLevel, TierRequirement> = {
  BRONZE: {
    level: 'BRONZE',
    minCharactersTyped: 0,
    minAverageWpm: 0,
    minAccuracy: 0,
    minSessions: 0,
    color: '#CD7F32',
    icon: '🥉',
    name: {
      ko: '브론즈',
      en: 'Bronze'
    },
    description: {
      ko: '타이핑의 첫 걸음을 시작하세요!',
      en: 'Take your first steps in typing!'
    }
  },
  SILVER: {
    level: 'SILVER',
    minCharactersTyped: 5000,
    minAverageWpm: 30,
    minAccuracy: 85,
    minSessions: 10,
    color: '#C0C0C0',
    icon: '🥈',
    name: {
      ko: '실버',
      en: 'Silver'
    },
    description: {
      ko: '꾸준한 연습으로 실력을 쌓아가고 있어요!',
      en: 'Building skills through consistent practice!'
    }
  },
  GOLD: {
    level: 'GOLD',
    minCharactersTyped: 25000,
    minAverageWpm: 50,
    minAccuracy: 90,
    minSessions: 50,
    color: '#FFD700',
    icon: '🥇',
    name: {
      ko: '골드',
      en: 'Gold'
    },
    description: {
      ko: '숙련된 타이피스트의 반열에 올랐습니다!',
      en: 'You\'ve joined the ranks of skilled typists!'
    }
  },
  PLATINUM: {
    level: 'PLATINUM',
    minCharactersTyped: 75000,
    minAverageWpm: 70,
    minAccuracy: 93,
    minSessions: 150,
    color: '#E5E4E2',
    icon: '💎',
    name: {
      ko: '플래티넘',
      en: 'Platinum'
    },
    description: {
      ko: '상위권 타이피스트로 인정받았습니다!',
      en: 'Recognized as a top-tier typist!'
    }
  },
  DIAMOND: {
    level: 'DIAMOND',
    minCharactersTyped: 200000,
    minAverageWpm: 90,
    minAccuracy: 96,
    minSessions: 400,
    color: '#B9F2FF',
    icon: '💍',
    name: {
      ko: '다이아몬드',
      en: 'Diamond'
    },
    description: {
      ko: '엘리트 타이피스트의 경지에 도달했습니다!',
      en: 'You\'ve reached elite typist status!'
    }
  },
  MASTER: {
    level: 'MASTER',
    minCharactersTyped: 500000,
    minAverageWpm: 110,
    minAccuracy: 98,
    minSessions: 1000,
    color: '#9966CC',
    icon: '👑',
    name: {
      ko: '마스터',
      en: 'Master'
    },
    description: {
      ko: '타이핑의 달인이 되었습니다!',
      en: 'You are a true typing master!'
    }
  }
};

export class TierSystem {
  private static tierOrder: TierLevel[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER'];

  static calculateTier(
    charactersTyped: number,
    averageWpm: number,
    accuracy: number,
    sessions: number
  ): TierLevel {
    // 역순으로 확인하여 가장 높은 달성 가능한 티어를 찾음
    for (let i = this.tierOrder.length - 1; i >= 0; i--) {
      const tier = this.tierOrder[i];
      const requirement = TIER_REQUIREMENTS[tier];
      
      if (
        charactersTyped >= requirement.minCharactersTyped &&
        averageWpm >= requirement.minAverageWpm &&
        accuracy >= requirement.minAccuracy &&
        sessions >= requirement.minSessions
      ) {
        return tier;
      }
    }
    
    return 'BRONZE'; // 기본값
  }

  static getTierProgress(
    currentTier: TierLevel,
    charactersTyped: number,
    averageWpm: number,
    accuracy: number,
    sessions: number
  ): TierProgress {
    const currentTierIndex = this.tierOrder.indexOf(currentTier);
    const nextTier = currentTierIndex < this.tierOrder.length - 1 
      ? this.tierOrder[currentTierIndex + 1] 
      : null;

    if (!nextTier) {
      return {
        currentTier,
        nextTier: null,
        progressToNext: 100,
        requirementsForNext: null
      };
    }

    const nextRequirement = TIER_REQUIREMENTS[nextTier];
    
    // 각 요구사항별 진행률 계산
    const charProgress = Math.min(100, (charactersTyped / nextRequirement.minCharactersTyped) * 100);
    const wpmProgress = Math.min(100, (averageWpm / nextRequirement.minAverageWpm) * 100);
    const accuracyProgress = Math.min(100, (accuracy / nextRequirement.minAccuracy) * 100);
    const sessionProgress = Math.min(100, (sessions / nextRequirement.minSessions) * 100);
    
    // 전체 진행률은 모든 요구사항의 최소값 (모든 조건을 만족해야 승급)
    const overallProgress = Math.min(charProgress, wpmProgress, accuracyProgress, sessionProgress);

    return {
      currentTier,
      nextTier,
      progressToNext: overallProgress,
      requirementsForNext: {
        charactersTyped: {
          current: charactersTyped,
          required: nextRequirement.minCharactersTyped,
          met: charactersTyped >= nextRequirement.minCharactersTyped
        },
        averageWpm: {
          current: Math.round(averageWpm),
          required: nextRequirement.minAverageWpm,
          met: averageWpm >= nextRequirement.minAverageWpm
        },
        accuracy: {
          current: Math.round(accuracy),
          required: nextRequirement.minAccuracy,
          met: accuracy >= nextRequirement.minAccuracy
        },
        sessions: {
          current: sessions,
          required: nextRequirement.minSessions,
          met: sessions >= nextRequirement.minSessions
        }
      }
    };
  }

  static checkForPromotion(
    oldStats: {
      charactersTyped: number;
      averageWpm: number;
      accuracy: number;
      sessions: number;
    },
    newStats: {
      charactersTyped: number;
      averageWpm: number;
      accuracy: number;
      sessions: number;
    }
  ): { promoted: boolean; oldTier: TierLevel; newTier: TierLevel } {
    const oldTier = this.calculateTier(
      oldStats.charactersTyped,
      oldStats.averageWpm,
      oldStats.accuracy,
      oldStats.sessions
    );
    
    const newTier = this.calculateTier(
      newStats.charactersTyped,
      newStats.averageWpm,
      newStats.accuracy,
      newStats.sessions
    );

    return {
      promoted: this.tierOrder.indexOf(newTier) > this.tierOrder.indexOf(oldTier),
      oldTier,
      newTier
    };
  }

  static getTierRequirement(tier: TierLevel): TierRequirement {
    return TIER_REQUIREMENTS[tier];
  }

  static getAllTiers(): TierRequirement[] {
    return this.tierOrder.map(tier => TIER_REQUIREMENTS[tier]);
  }

  static getTierRank(tier: TierLevel): number {
    return this.tierOrder.indexOf(tier) + 1;
  }
}