export class TypingStats {
  constructor(
    public readonly wpm: number,
    public readonly accuracy: number,
    public readonly timeElapsed: number,
    public readonly correctChars: number,
    public readonly totalChars: number,
    public readonly errorCount: number = 0
  ) {}

  static calculate(
    text: string,
    userInput: string,
    timeElapsed: number
  ): TypingStats {
    let correctChars = 0;
    let errorCount = 0;

    for (let i = 0; i < Math.min(userInput.length, text.length); i++) {
      if (userInput[i] === text[i]) {
        correctChars++;
      } else {
        errorCount++;
      }
    }

    const accuracy = userInput.length > 0 
      ? (correctChars / userInput.length) * 100 
      : 0;
    
    const wpm = timeElapsed > 0 
      ? Math.round((correctChars / timeElapsed) * 60) 
      : 0;

    return new TypingStats(
      wpm,
      accuracy,
      timeElapsed,
      correctChars,
      userInput.length,
      errorCount
    );
  }

  isComplete(targetText: string): boolean {
    return this.totalChars >= targetText.length && this.accuracy === 100;
  }
}