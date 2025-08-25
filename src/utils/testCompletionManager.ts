"use client";

import { eventBus, StatsUpdateEvent } from '@/utils/eventBus';
import { useUserProgressStore } from '@/stores/userProgressStore';
import { useStatsStore } from '@/stores/statsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { TypingSession } from '@/types';

/**
 * 🎯 중앙집중식 테스트 완료 처리 관리자
 * 
 * 책임:
 * - 테스트 완료 이벤트 단일 처리점
 * - 중복 처리 방지
 * - 순서 보장 (통계 계산 → 데이터 저장)
 * - 느슨한 연결 (이벤트 기반)
 */
class TestCompletionManager {
  private isProcessing = false;
  private lastSessionId: string | null = null;
  
  constructor() {
    // 테스트 완료 이벤트 구독 (단일 처리점)
    eventBus.on('test:completed', this.handleTestCompletion.bind(this));
  }

  /**
   * 테스트 완료 단일 처리 함수
   */
  private async handleTestCompletion(data: StatsUpdateEvent): Promise<void> {
    // 🔐 중복 처리 방지
    if (this.isProcessing) {
      console.log('⚠️ TestCompletionManager: 이미 처리 중, 건너뜀');
      return;
    }

    // 세션 ID 생성
    const sessionId = this.generateSessionId(data);
    if (this.lastSessionId === sessionId) {
      console.log('⚠️ TestCompletionManager: 동일 세션, 건너뜀');
      return;
    }

    // 🔐 처리 시작
    this.isProcessing = true;
    this.lastSessionId = sessionId;

    console.log('🎯 TestCompletionManager: 테스트 완료 처리 시작');

    try {
      // 1단계: 통계 계산 (statsStore 책임)
      await this.processStatistics(data);

      // 2단계: 데이터 저장 (userProgressStore 책임)  
      await this.saveTestResult(data, sessionId);

      console.log('✅ TestCompletionManager: 처리 완료');
      
    } catch (error) {
      console.error('❌ TestCompletionManager: 처리 실패', error);
    } finally {
      // 🔐 처리 완료 (1초 후 재처리 가능)
      setTimeout(() => {
        this.isProcessing = false;
      }, 1000);
    }
  }

  /**
   * 통계 계산 처리 (느슨한 연결)
   */
  private async processStatistics(data: StatsUpdateEvent): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const statsStore = useStatsStore.getState();
      
      if (data.startTime && data.firstKeystrokeTime) {
        statsStore.calculateStats(
          data.keystrokes,
          data.mistakes,
          data.startTime,
          data.currentIndex || 0,
          data.currentTime || new Date(),
          data.textType || 'words',
          data.currentText || '',
          data.userInput || '',
          data.firstKeystrokeTime
        );
      }
      
      console.log('📊 TestCompletionManager: 통계 계산 완료');
    } catch (error) {
      console.error('❌ TestCompletionManager: 통계 계산 실패', error);
      throw error;
    }
  }

  /**
   * 테스트 결과 저장 처리 (느슨한 연결)
   */
  private async saveTestResult(data: StatsUpdateEvent, sessionId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const userProgressStore = useUserProgressStore.getState();
      const statsStore = useStatsStore.getState();
      const settingsStore = useSettingsStore.getState();
      
      if (!data.startTime || !data.firstKeystrokeTime) return;

      const duration = (Date.now() - data.startTime.getTime()) / 1000;
      
      // TypingSession 생성 (설정에서 정보 가져오기)
      const session: TypingSession = {
        id: `session_${sessionId}`,
        language: settingsStore.language,
        mode: settingsStore.testMode,
        target: settingsStore.testTarget,
        textType: data.textType || settingsStore.textType,
        device: 'desktop' as const,
        
        wpm: statsStore.liveStats.wpm || 0,
        rawWpm: statsStore.liveStats.rawWpm || 0,
        cpm: statsStore.liveStats.cpm || 0,
        rawCpm: statsStore.liveStats.rawCpm || 0,
        accuracy: statsStore.liveStats.accuracy || 0,
        consistency: statsStore.liveStats.consistency || 0,
        
        keystrokes: data.keystrokes,
        mistakes: data.mistakes,
        startTime: data.startTime,
        endTime: new Date(),
        duration: duration
      };

      await userProgressStore.recordTest(session);
      
      console.log('💾 TestCompletionManager: 데이터 저장 완료');
    } catch (error) {
      console.error('❌ TestCompletionManager: 저장 실패', error);
      throw error;
    }
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(data: StatsUpdateEvent): string {
    const timestamp = data.startTime?.getTime() || Date.now();
    const keyCount = data.keystrokes.length;
    const currentIdx = data.currentIndex || 0;
    
    return `${timestamp}_${currentIdx}_${keyCount}`;
  }

  /**
   * 테스트 완료 이벤트 발행 (공개 API)
   */
  public static triggerTestCompletion(data: StatsUpdateEvent): void {
    eventBus.emit('test:completed', data);
  }
}

// 🎯 싱글톤 인스턴스 생성 및 초기화
let manager: TestCompletionManager | null = null;

export const initializeTestCompletionManager = (): void => {
  if (typeof window === 'undefined') return;
  
  if (!manager) {
    manager = new TestCompletionManager();
    console.log('🎯 TestCompletionManager 초기화 완료');
  }
};

// 편의 함수
export const triggerTestCompletion = (data: StatsUpdateEvent): void => {
  TestCompletionManager.triggerTestCompletion(data);
};