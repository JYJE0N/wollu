import { TypingStats } from '@/domain/valueObjects/TypingStats';

describe('TypingStats', () => {
  describe('calculate', () => {
    it('정확도를 올바르게 계산해야 함', () => {
      const text = '안녕하세요';
      const userInput = '안녕하세';
      const timeElapsed = 5;
      
      const stats = TypingStats.calculate(text, userInput, timeElapsed);
      
      expect(stats.accuracy).toBe(100);
      expect(stats.correctChars).toBe(4);
      expect(stats.totalChars).toBe(4);
      expect(stats.errorCount).toBe(0);
    });

    it('오타가 있을 때 정확도를 올바르게 계산해야 함', () => {
      const text = '안녕하세요';
      const userInput = '안녕히세';
      const timeElapsed = 5;
      
      const stats = TypingStats.calculate(text, userInput, timeElapsed);
      
      expect(stats.accuracy).toBe(75); // 3/4 * 100
      expect(stats.correctChars).toBe(3);
      expect(stats.totalChars).toBe(4);
      expect(stats.errorCount).toBe(1);
    });

    it('WPM을 올바르게 계산해야 함', () => {
      const text = '안녕하세요';
      const userInput = '안녕';
      const timeElapsed = 60; // 1분
      
      const stats = TypingStats.calculate(text, userInput, timeElapsed);
      
      expect(stats.wpm).toBe(2); // 2글자/분
    });

    it('시간이 0일 때 WPM은 0이어야 함', () => {
      const text = '안녕하세요';
      const userInput = '안녕';
      const timeElapsed = 0;
      
      const stats = TypingStats.calculate(text, userInput, timeElapsed);
      
      expect(stats.wpm).toBe(0);
    });

    it('입력이 없을 때 정확도는 0이어야 함', () => {
      const text = '안녕하세요';
      const userInput = '';
      const timeElapsed = 5;
      
      const stats = TypingStats.calculate(text, userInput, timeElapsed);
      
      expect(stats.accuracy).toBe(0);
      expect(stats.correctChars).toBe(0);
      expect(stats.totalChars).toBe(0);
    });
  });

  describe('isComplete', () => {
    it('모든 텍스트를 정확히 입력했을 때 true를 반환해야 함', () => {
      const stats = new TypingStats(60, 100, 10, 5, 5, 0);
      const targetText = '안녕하세요';
      
      expect(stats.isComplete(targetText)).toBe(true);
    });

    it('텍스트 길이가 부족하면 false를 반환해야 함', () => {
      const stats = new TypingStats(60, 100, 10, 4, 4, 0);
      const targetText = '안녕하세요';
      
      expect(stats.isComplete(targetText)).toBe(false);
    });

    it('정확도가 100%가 아니면 false를 반환해야 함', () => {
      const stats = new TypingStats(60, 80, 10, 4, 5, 1);
      const targetText = '안녕하세요';
      
      expect(stats.isComplete(targetText)).toBe(false);
    });
  });
});