/**
 * 고스트 모드 시스템
 * 사용자의 이전 기록과 실시간으로 경쟁할 수 있는 기능
 */

// ===============================
// 1. 타입 정의
// ===============================

export interface GhostRecord {
  id: string;
  date: Date;
  language: string;
  textType: string;
  testMode: 'time' | 'words';
  testTarget: number;
  cpm: number;
  wpm: number;
  accuracy: number;
  duration: number;
  keystrokes: Array<{
    timestamp: number; // 키 입력 시점 (밀리초)
    position: number;  // 텍스트에서의 위치
    correct: boolean;  // 정확한 입력인지
  }>;
  completedText: string;
}

export interface GhostProgress {
  position: number;      // 현재 위치
  cpm: number;          // 현재 CPM
  wpm: number;          // 현재 WPM  
  accuracy: number;     // 현재 정확도
  timeElapsed: number;  // 경과 시간 (초)
}

export interface GhostComparison {
  userAhead: boolean;    // 사용자가 앞서고 있는지
  timeDiff: number;      // 시간 차이 (초, + = 사용자가 빠름)
  cpmDiff: number;       // CPM 차이 (+ = 사용자가 빠름)
  positionDiff: number;  // 위치 차이 (+ = 사용자가 앞섰음)
}

// ===============================
// 2. 고스트 기록 관리 클래스
// ===============================

export class GhostModeManager {
  private currentGhost: GhostRecord | null = null;
  private isGhostMode = false;

  /**
   * 현재 설정과 일치하는 최고 기록을 찾아서 고스트로 설정
   */
  findBestRecord(
    recentTests: any[],
    language: string,
    textType: string,
    testMode: 'words' | 'sentences',
    testTarget: number
  ): GhostRecord | null {
    if (!recentTests || recentTests.length === 0) return null;

    // 동일한 조건의 테스트만 필터링
    const matchingTests = recentTests.filter(test => 
      test.language === language &&
      test.textType === textType &&
      test.mode === testMode &&
      test.target === testTarget &&
      test.keystrokes && 
      test.keystrokes.length > 0
    );

    if (matchingTests.length === 0) return null;

    // CPM 기준 최고 기록 선택
    const bestTest = matchingTests.reduce((best, current) => 
      current.cpm > best.cpm ? current : best
    );

    return {
      id: bestTest.id,
      date: new Date(bestTest.date),
      language: bestTest.language,
      textType: bestTest.textType,
      testMode: bestTest.mode,
      testTarget: bestTest.target,
      cpm: bestTest.cpm,
      wpm: bestTest.wpm,
      accuracy: bestTest.accuracy,
      duration: bestTest.duration,
      keystrokes: bestTest.keystrokes,
      completedText: bestTest.completedText || ''
    };
  }

  /**
   * 고스트 모드 시작
   */
  startGhostMode(ghostRecord: GhostRecord): void {
    this.currentGhost = ghostRecord;
    this.isGhostMode = true;
    
    console.log('🏁 고스트 모드 시작:', {
      ghostCPM: ghostRecord.cpm,
      ghostAccuracy: ghostRecord.accuracy,
      ghostDuration: ghostRecord.duration,
      date: ghostRecord.date.toLocaleDateString()
    });
  }

  /**
   * 고스트 모드 종료
   */
  stopGhostMode(): void {
    this.currentGhost = null;
    this.isGhostMode = false;
    console.log('🏁 고스트 모드 종료');
  }

  /**
   * 현재 고스트 모드 상태 확인
   */
  isActive(): boolean {
    return this.isGhostMode && this.currentGhost !== null;
  }

  /**
   * 현재 고스트 기록 반환
   */
  getCurrentGhost(): GhostRecord | null {
    return this.currentGhost;
  }

  /**
   * 실시간 고스트 진행률 계산
   */
  calculateGhostProgress(currentTimeElapsed: number): GhostProgress | null {
    if (!this.currentGhost || !this.isActive()) return null;

    const { keystrokes } = this.currentGhost;
    if (!keystrokes || keystrokes.length === 0) return null;

    // 현재 시간까지 고스트가 입력했던 키스트로크 찾기
    const currentTimeMs = currentTimeElapsed * 1000;
    const ghostKeystrokesAtTime = keystrokes.filter(k => k.timestamp <= currentTimeMs);

    if (ghostKeystrokesAtTime.length === 0) {
      return {
        position: 0,
        cpm: 0,
        wpm: 0,
        accuracy: 0,
        timeElapsed: currentTimeElapsed
      };
    }

    const position = Math.max(...ghostKeystrokesAtTime.map(k => k.position));
    const correctKeystrokes = ghostKeystrokesAtTime.filter(k => k.correct);
    const accuracy = correctKeystrokes.length / ghostKeystrokesAtTime.length * 100;
    
    // CPM/WPM 계산 (현재 시점까지)
    const timeMinutes = currentTimeElapsed / 60;
    const cpm = timeMinutes > 0 ? Math.round(position / timeMinutes) : 0;
    const wpm = timeMinutes > 0 ? Math.round((position / 5) / timeMinutes) : 0;

    return {
      position,
      cpm,
      wpm,
      accuracy,
      timeElapsed: currentTimeElapsed
    };
  }

  /**
   * 사용자와 고스트 비교
   */
  compareWithUser(
    userPosition: number,
    userTimeElapsed: number,
    userCPM: number,
    _userAccuracy: number
  ): GhostComparison | null {
    if (!this.isActive() || !this.currentGhost) return null;

    const ghostProgress = this.calculateGhostProgress(userTimeElapsed);
    if (!ghostProgress) return null;

    return {
      userAhead: userPosition > ghostProgress.position,
      timeDiff: this.calculateTimeDifference(userPosition, userTimeElapsed),
      cpmDiff: userCPM - ghostProgress.cpm,
      positionDiff: userPosition - ghostProgress.position
    };
  }

  /**
   * 특정 위치에 도달하는데 걸린 시간 차이 계산
   */
  private calculateTimeDifference(userPosition: number, userTimeElapsed: number): number {
    if (!this.currentGhost || !this.currentGhost.keystrokes) return 0;

    // 고스트가 같은 위치에 도달한 시간 찾기
    const ghostKeystrokeAtPosition = this.currentGhost.keystrokes.find(k => k.position >= userPosition);
    
    if (!ghostKeystrokeAtPosition) return userTimeElapsed; // 고스트가 아직 도달하지 못한 경우

    const ghostTimeAtPosition = ghostKeystrokeAtPosition.timestamp / 1000; // 초 단위 변환
    return ghostTimeAtPosition - userTimeElapsed; // + = 고스트가 더 빠름, - = 사용자가 더 빠름
  }

  /**
   * 고스트 기록 업데이트 (새로운 개인 기록 달성 시)
   */
  updatePersonalBest(newRecord: GhostRecord): void {
    if (!this.currentGhost) return;

    // 같은 조건에서 기록 갱신된 경우
    if (this.isSameCondition(newRecord, this.currentGhost) && 
        newRecord.cpm > this.currentGhost.cpm) {
      console.log('🏆 새로운 개인 기록! 고스트 업데이트');
      this.currentGhost = newRecord;
    }
  }

  /**
   * 테스트 조건이 동일한지 확인
   */
  private isSameCondition(record1: GhostRecord, record2: GhostRecord): boolean {
    return record1.language === record2.language &&
           record1.textType === record2.textType &&
           record1.testMode === record2.testMode &&
           record1.testTarget === record2.testTarget;
  }

  /**
   * 고스트 모드 통계
   */
  getGhostStats(): {
    targetCPM: number;
    targetAccuracy: number;
    recordDate: string;
    canBeatRecord: boolean;
  } | null {
    if (!this.isActive() || !this.currentGhost) return null;

    return {
      targetCPM: this.currentGhost.cpm,
      targetAccuracy: this.currentGhost.accuracy,
      recordDate: this.currentGhost.date.toLocaleDateString('ko-KR'),
      canBeatRecord: true
    };
  }
}

// ===============================
// 3. 전역 고스트 모드 매니저 인스턴스
// ===============================

export const ghostModeManager = new GhostModeManager();