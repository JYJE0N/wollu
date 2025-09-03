declare module 'hangul-js' {
  interface HangulStatic {
    disassemble(text: string): string[];
    assemble(components: string[]): string;
    isHangul(char: string): boolean;
    isComplete(char: string): boolean;
    isConsonant(char: string): boolean;
    isVowel(char: string): boolean;
  }

  const Hangul: HangulStatic;
  export default Hangul;
}