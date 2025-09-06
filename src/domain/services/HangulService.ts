import { HangulChar } from '../valueObjects/HangulChar';

export interface IHangulService {
  disassemble(text: string): string[];
  assemble(jamos: string[]): string;
  isValidHangul(text: string): boolean;
  compareTexts(source: string, target: string): boolean[];
}

export class HangulService implements IHangulService {
  disassemble(text: string): string[] {
    const result: string[] = [];
    
    for (const char of text) {
      const hangulChar = new HangulChar(char);
      const decomposed = hangulChar.decompose();
      
      if (decomposed) {
        result.push(decomposed.cho, decomposed.jung);
        if (decomposed.jong) {
          result.push(decomposed.jong);
        }
      } else {
        result.push(char);
      }
    }
    
    return result;
  }

  assemble(jamos: string[]): string {
    let result = '';
    let i = 0;
    
    while (i < jamos.length) {
      const cho = jamos[i];
      const jung = jamos[i + 1];
      const jong = jamos[i + 2];
      
      if (this.isChosung(cho) && jung && this.isJungsung(jung)) {
        if (jong && this.isJongsung(jong) && !this.isChosung(jong)) {
          result += HangulChar.compose(cho, jung, jong);
          i += 3;
        } else {
          result += HangulChar.compose(cho, jung);
          i += 2;
        }
      } else {
        result += cho;
        i++;
      }
    }
    
    return result;
  }

  isValidHangul(text: string): boolean {
    return text.split('').every(char => {
      const hangulChar = new HangulChar(char);
      return hangulChar.isHangul() || /\s/.test(char) || /[.,!?]/.test(char);
    });
  }

  compareTexts(source: string, target: string): boolean[] {
    const result: boolean[] = [];
    const maxLength = Math.max(source.length, target.length);
    
    for (let i = 0; i < maxLength; i++) {
      result.push(source[i] === target[i]);
    }
    
    return result;
  }

  private isChosung(char: string): boolean {
    const chosung = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
                     'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    return chosung.includes(char);
  }

  private isJungsung(char: string): boolean {
    const jungsung = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
                      'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
    return jungsung.includes(char);
  }

  private isJongsung(char: string): boolean {
    const jongsung = ['ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
                      'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
                      'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    return jongsung.includes(char);
  }
}