export class HangulChar {
  private static readonly HANGUL_START = 0xAC00;
  private static readonly HANGUL_END = 0xD7A3;
  private static readonly CHO_SUNG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
    'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];
  private static readonly JUNG_SUNG = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
    'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
  ];
  private static readonly JONG_SUNG = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
    'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  constructor(private readonly char: string) {}

  isHangul(): boolean {
    const code = this.char.charCodeAt(0);
    return code >= HangulChar.HANGUL_START && code <= HangulChar.HANGUL_END;
  }

  decompose(): { cho: string; jung: string; jong: string } | null {
    if (!this.isHangul()) return null;

    const code = this.char.charCodeAt(0) - HangulChar.HANGUL_START;
    const jongIndex = code % 28;
    const jungIndex = ((code - jongIndex) / 28) % 21;
    const choIndex = ((code - jongIndex) / 28 - jungIndex) / 21;

    return {
      cho: HangulChar.CHO_SUNG[choIndex],
      jung: HangulChar.JUNG_SUNG[jungIndex],
      jong: HangulChar.JONG_SUNG[jongIndex]
    };
  }

  static compose(cho: string, jung: string, jong: string = ''): string {
    const choIndex = HangulChar.CHO_SUNG.indexOf(cho);
    const jungIndex = HangulChar.JUNG_SUNG.indexOf(jung);
    const jongIndex = HangulChar.JONG_SUNG.indexOf(jong);

    if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
      return cho + jung + jong;
    }

    const code = HangulChar.HANGUL_START + 
      choIndex * 588 + jungIndex * 28 + jongIndex;
    
    return String.fromCharCode(code);
  }

  toString(): string {
    return this.char;
  }
}