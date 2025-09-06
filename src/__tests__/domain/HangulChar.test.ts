import { HangulChar } from '@/domain/valueObjects/HangulChar';

describe('HangulChar', () => {
  describe('isHangul', () => {
    it('한글 문자를 올바르게 인식해야 함', () => {
      const hangul = new HangulChar('가');
      expect(hangul.isHangul()).toBe(true);
    });

    it('영문자는 한글이 아님을 인식해야 함', () => {
      const english = new HangulChar('A');
      expect(english.isHangul()).toBe(false);
    });

    it('숫자는 한글이 아님을 인식해야 함', () => {
      const number = new HangulChar('1');
      expect(number.isHangul()).toBe(false);
    });
  });

  describe('decompose', () => {
    it('완성형 한글을 초성, 중성, 종성으로 분해해야 함', () => {
      const hangul = new HangulChar('한');
      const result = hangul.decompose();
      
      expect(result).toEqual({
        cho: 'ㅎ',
        jung: 'ㅏ',
        jong: 'ㄴ'
      });
    });

    it('종성이 없는 한글도 올바르게 분해해야 함', () => {
      const hangul = new HangulChar('가');
      const result = hangul.decompose();
      
      expect(result).toEqual({
        cho: 'ㄱ',
        jung: 'ㅏ',
        jong: ''
      });
    });

    it('한글이 아닌 문자는 null을 반환해야 함', () => {
      const notHangul = new HangulChar('A');
      const result = notHangul.decompose();
      
      expect(result).toBeNull();
    });
  });

  describe('compose', () => {
    it('초성, 중성, 종성으로 완성형 한글을 조합해야 함', () => {
      const result = HangulChar.compose('ㅎ', 'ㅏ', 'ㄴ');
      expect(result).toBe('한');
    });

    it('종성이 없어도 한글을 조합해야 함', () => {
      const result = HangulChar.compose('ㄱ', 'ㅏ');
      expect(result).toBe('가');
    });

    it('유효하지 않은 자모는 그대로 연결해야 함', () => {
      const result = HangulChar.compose('a', 'b', 'c');
      expect(result).toBe('abc');
    });
  });
});