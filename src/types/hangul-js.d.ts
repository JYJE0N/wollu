declare module 'hangul-js' {
  namespace Hangul {
    function assemble(jamoArray: string[]): string
    function disassemble(text: string): string[]
    function isConsonant(char: string): boolean
    function isVowel(char: string): boolean
    function isHangul(text: string): boolean
  }

  export = Hangul
}