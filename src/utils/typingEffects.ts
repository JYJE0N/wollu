/**
 * 타이핑 이펙트 시스템
 * workFlowInfo.md의 명세에 따른 시각적 피드백 효과
 */

// ===============================
// 1. 타입 정의
// ===============================

export interface TypingEffect {
  id: string;
  type: 'combo' | 'speed' | 'accuracy' | 'streak';
  trigger: {
    condition: 'consecutive_correct' | 'cpm_threshold' | 'accuracy_threshold';
    value: number;
  };
  visual: {
    name: string;
    particles?: ParticleConfig;
    glow?: GlowConfig;
    animation?: AnimationConfig;
    sound?: string;
  };
}

export interface ParticleConfig {
  type: 'spark' | 'star' | 'electric' | 'flame' | 'aurora';
  count: number;
  color: string | string[];
  duration: number; // ms
  spread: number; // 퍼짐 정도
  size: 'small' | 'medium' | 'large';
}

export interface GlowConfig {
  color: string;
  intensity: 'subtle' | 'normal' | 'intense';
  duration: number; // ms
  target: 'text' | 'screen_edge' | 'typing_area';
}

export interface AnimationConfig {
  type: 'pulse' | 'shake' | 'bounce' | 'rainbow';
  duration: number;
  intensity: number;
}

export interface ComboState {
  consecutiveCorrect: number;
  currentComboLevel: number;
  lastEffectTrigger: number;
  activeEffects: ActiveEffect[];
}

export interface ActiveEffect {
  id: string;
  effect: TypingEffect;
  startTime: number;
  element?: HTMLElement;
}

// ===============================
// 2. 이펙트 정의 (workFlowInfo.md 기준)
// ===============================

export const TYPING_EFFECTS: TypingEffect[] = [
  // 연속 타이핑 피드백
  {
    id: 'combo_10',
    type: 'combo',
    trigger: {
      condition: 'consecutive_correct',
      value: 10
    },
    visual: {
      name: '작은 스파크',
      particles: {
        type: 'spark',
        count: 5,
        color: 'var(--color-interactive-secondary)',
        duration: 800,
        spread: 30,
        size: 'small'
      }
    }
  },
  {
    id: 'combo_30',
    type: 'combo',
    trigger: {
      condition: 'consecutive_correct',
      value: 30
    },
    visual: {
      name: '콤보 카운터',
      particles: {
        type: 'star',
        count: 8,
        color: ['var(--color-interactive-primary)', 'var(--color-interactive-secondary)'],
        duration: 1000,
        spread: 50,
        size: 'medium'
      },
      glow: {
        color: 'var(--color-interactive-primary)',
        intensity: 'normal',
        duration: 1500,
        target: 'typing_area'
      }
    }
  },
  {
    id: 'combo_50',
    type: 'combo',
    trigger: {
      condition: 'consecutive_correct',
      value: 50
    },
    visual: {
      name: '화면 가장자리 글로우',
      glow: {
        color: 'var(--color-feedback-success)',
        intensity: 'intense',
        duration: 2000,
        target: 'screen_edge'
      },
      particles: {
        type: 'star',
        count: 15,
        color: ['var(--color-feedback-success)', 'var(--color-interactive-secondary)'],
        duration: 1500,
        spread: 80,
        size: 'large'
      }
    }
  },
  
  // 300+ CPM 화려한 효과
  {
    id: 'speed_300',
    type: 'speed',
    trigger: {
      condition: 'cpm_threshold',
      value: 300
    },
    visual: {
      name: '스파크 모드',
      particles: {
        type: 'spark',
        count: 12,
        color: 'var(--color-interactive-secondary)',
        duration: 1200,
        spread: 60,
        size: 'medium'
      },
      glow: {
        color: 'var(--color-interactive-secondary)',
        intensity: 'normal',
        duration: 3000,
        target: 'text'
      }
    }
  },
  {
    id: 'speed_400',
    type: 'speed',
    trigger: {
      condition: 'cpm_threshold',
      value: 400
    },
    visual: {
      name: '번개 모드',
      particles: {
        type: 'electric',
        count: 20,
        color: ['var(--color-interactive-primary)', 'var(--color-interactive-secondary)'],
        duration: 1500,
        spread: 100,
        size: 'large'
      },
      glow: {
        color: 'var(--color-interactive-primary)',
        intensity: 'intense',
        duration: 2500,
        target: 'screen_edge'
      }
    }
  },
  {
    id: 'speed_500',
    type: 'speed',
    trigger: {
      condition: 'cpm_threshold',
      value: 500
    },
    visual: {
      name: '화염 모드',
      particles: {
        type: 'flame',
        count: 25,
        color: ['var(--color-feedback-warning)', 'var(--color-interactive-primary)', 'var(--color-interactive-secondary)'],
        duration: 2000,
        spread: 120,
        size: 'large'
      },
      glow: {
        color: 'var(--color-feedback-warning)',
        intensity: 'intense',
        duration: 3000,
        target: 'typing_area'
      }
    }
  },
  {
    id: 'speed_600',
    type: 'speed',
    trigger: {
      condition: 'cpm_threshold',
      value: 600
    },
    visual: {
      name: '오로라 모드',
      particles: {
        type: 'aurora',
        count: 35,
        color: ['var(--color-interactive-primary)', 'var(--color-interactive-secondary)', 'var(--color-feedback-success)', 'var(--color-feedback-info)'],
        duration: 3000,
        spread: 150,
        size: 'large'
      },
      glow: {
        color: 'var(--color-interactive-primary)',
        intensity: 'intense',
        duration: 4000,
        target: 'screen_edge'
      },
      animation: {
        type: 'rainbow',
        duration: 2000,
        intensity: 0.8
      }
    }
  }
];

// ===============================
// 3. 타이핑 이펙트 매니저 클래스
// ===============================

export class TypingEffectsManager {
  private comboState: ComboState;
  private effectContainer: HTMLElement | null = null;
  private isEffectsEnabled = true;

  constructor() {
    this.comboState = {
      consecutiveCorrect: 0,
      currentComboLevel: 0,
      lastEffectTrigger: 0,
      activeEffects: []
    };
  }

  /**
   * 이펙트 컨테이너 설정
   */
  setContainer(container: HTMLElement): void {
    this.effectContainer = container;
  }

  /**
   * 이펙트 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.isEffectsEnabled = enabled;
    if (!enabled) {
      this.clearAllEffects();
    }
  }

  /**
   * 정확한 키 입력 시 호출
   */
  onCorrectKeystroke(currentCPM: number, _currentAccuracy: number): void {
    if (!this.isEffectsEnabled) return;

    this.comboState.consecutiveCorrect++;
    
    // 콤보 이펙트 체크
    this.checkComboEffects();
    
    // 속도 이펙트 체크
    this.checkSpeedEffects(currentCPM);
    
    // 정확도 이펙트 체크 (필요시)
    // this.checkAccuracyEffects(currentAccuracy);
  }

  /**
   * 실수 시 호출 (콤보 리셋)
   */
  onIncorrectKeystroke(): void {
    this.comboState.consecutiveCorrect = 0;
    this.comboState.currentComboLevel = 0;
  }

  /**
   * 콤보 이펙트 체크
   */
  private checkComboEffects(): void {
    const comboEffects = TYPING_EFFECTS.filter(e => e.type === 'combo');
    
    for (const effect of comboEffects) {
      if (effect.trigger.condition === 'consecutive_correct' &&
          this.comboState.consecutiveCorrect === effect.trigger.value) {
        this.triggerEffect(effect);
      }
    }
  }

  /**
   * 속도 이펙트 체크
   */
  private checkSpeedEffects(currentCPM: number): void {
    const speedEffects = TYPING_EFFECTS.filter(e => e.type === 'speed');
    
    for (const effect of speedEffects) {
      if (effect.trigger.condition === 'cpm_threshold' &&
          currentCPM >= effect.trigger.value &&
          !this.isEffectActive(effect.id)) {
        
        // 연속 트리거 방지 (3초 쿨다운)
        const now = Date.now();
        if (now - this.comboState.lastEffectTrigger > 3000) {
          this.triggerEffect(effect);
          this.comboState.lastEffectTrigger = now;
        }
      }
    }
  }

  /**
   * 이펙트 실행
   */
  private triggerEffect(effect: TypingEffect): void {
    if (!this.effectContainer) return;

    console.log(`🎉 타이핑 이펙트 트리거: ${effect.visual.name}`);

    const activeEffect: ActiveEffect = {
      id: effect.id,
      effect,
      startTime: Date.now()
    };

    // 파티클 효과
    if (effect.visual.particles) {
      this.createParticleEffect(effect.visual.particles, activeEffect);
    }

    // 글로우 효과
    if (effect.visual.glow) {
      this.createGlowEffect(effect.visual.glow, activeEffect);
    }

    // 애니메이션 효과
    if (effect.visual.animation) {
      this.createAnimationEffect(effect.visual.animation, activeEffect);
    }

    this.comboState.activeEffects.push(activeEffect);

    // 이펙트 지속시간 후 정리
    const maxDuration = Math.max(
      effect.visual.particles?.duration || 0,
      effect.visual.glow?.duration || 0,
      effect.visual.animation?.duration || 0
    );

    setTimeout(() => {
      this.removeEffect(activeEffect.id);
    }, maxDuration);
  }

  /**
   * 파티클 효과 생성
   */
  private createParticleEffect(config: ParticleConfig, activeEffect: ActiveEffect): void {
    // 실제 파티클 시스템 구현은 다음 단계에서
    // 지금은 CSS 애니메이션으로 간단히 구현
    
    const container = this.effectContainer!;
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-effect absolute inset-0 pointer-events-none z-10';
    
    // 파티클 개수만큼 생성
    for (let i = 0; i < config.count; i++) {
      const particle = document.createElement('div');
      particle.className = this.getParticleClassName(config);
      particle.style.cssText = this.getParticleStyles(config, i);
      particleContainer.appendChild(particle);
    }
    
    container.appendChild(particleContainer);
    activeEffect.element = particleContainer;
  }

  /**
   * 글로우 효과 생성
   */
  private createGlowEffect(config: GlowConfig, _activeEffect: ActiveEffect): void {
    const target = this.getGlowTarget(config.target);
    if (!target) return;

    const originalBoxShadow = target.style.boxShadow;
    const glowIntensity = config.intensity === 'intense' ? '0 0 30px' : 
                         config.intensity === 'normal' ? '0 0 20px' : '0 0 10px';
    
    target.style.boxShadow = `${glowIntensity} ${config.color}`;
    target.style.transition = 'box-shadow 0.3s ease';

    // 원래 상태로 복원
    setTimeout(() => {
      target.style.boxShadow = originalBoxShadow;
    }, config.duration);
  }

  /**
   * 애니메이션 효과 생성
   */
  private createAnimationEffect(config: AnimationConfig, _activeEffect: ActiveEffect): void {
    const target = this.effectContainer!;
    const animationClass = `animate-${config.type}`;
    
    target.classList.add(animationClass);
    
    setTimeout(() => {
      target.classList.remove(animationClass);
    }, config.duration);
  }

  /**
   * 파티클 CSS 클래스 생성
   */
  private getParticleClassName(config: ParticleConfig): string {
    const baseClass = 'absolute rounded-full animate-bounce';
    const sizeClass = config.size === 'small' ? 'w-1 h-1' : 
                     config.size === 'medium' ? 'w-2 h-2' : 'w-3 h-3';
    return `${baseClass} ${sizeClass}`;
  }

  /**
   * 파티클 스타일 생성
   */
  private getParticleStyles(config: ParticleConfig, index: number): string {
    const colors = Array.isArray(config.color) ? config.color : [config.color];
    const color = colors[index % colors.length];
    
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const randomDelay = Math.random() * 500;
    
    return `
      background-color: ${color};
      left: ${randomX}%;
      top: ${randomY}%;
      animation-delay: ${randomDelay}ms;
      animation-duration: ${config.duration}ms;
      box-shadow: 0 0 6px ${color};
    `;
  }

  /**
   * 글로우 타겟 요소 찾기
   */
  private getGlowTarget(target: string): HTMLElement | null {
    switch (target) {
      case 'text':
        return document.querySelector('.text-renderer') as HTMLElement;
      case 'typing_area':
        return this.effectContainer;
      case 'screen_edge':
        return document.body;
      default:
        return null;
    }
  }

  /**
   * 이펙트 활성 상태 체크
   */
  private isEffectActive(effectId: string): boolean {
    return this.comboState.activeEffects.some(e => e.id === effectId);
  }

  /**
   * 특정 이펙트 제거
   */
  private removeEffect(effectId: string): void {
    const index = this.comboState.activeEffects.findIndex(e => e.id === effectId);
    if (index !== -1) {
      const effect = this.comboState.activeEffects[index];
      if (effect.element) {
        effect.element.remove();
      }
      this.comboState.activeEffects.splice(index, 1);
    }
  }

  /**
   * 모든 이펙트 정리
   */
  private clearAllEffects(): void {
    this.comboState.activeEffects.forEach(effect => {
      if (effect.element) {
        effect.element.remove();
      }
    });
    this.comboState.activeEffects = [];
  }

  /**
   * 현재 콤보 상태 반환
   */
  getComboState(): ComboState {
    return { ...this.comboState };
  }

  /**
   * 콤보 리셋
   */
  resetCombo(): void {
    this.comboState.consecutiveCorrect = 0;
    this.comboState.currentComboLevel = 0;
    this.clearAllEffects();
  }
}

// ===============================
// 4. 전역 이펙트 매니저 인스턴스
// ===============================

export const typingEffectsManager = new TypingEffectsManager();