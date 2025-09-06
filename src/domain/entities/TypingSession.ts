export interface TypingSession {
  id: string;
  text: string;
  startTime: Date | null;
  endTime: Date | null;
  userInput: string;
  currentPosition: number;
  isStarted: boolean;
  isCompleted: boolean;
  mode: 'sentence' | 'words';
}

export class TypingSessionEntity implements TypingSession {
  constructor(
    public id: string,
    public text: string,
    public mode: 'sentence' | 'words' = 'sentence',
    public startTime: Date | null = null,
    public endTime: Date | null = null,
    public userInput: string = '',
    public currentPosition: number = 0,
    public isStarted: boolean = false,
    public isCompleted: boolean = false
  ) {}

  start(): void {
    if (!this.isStarted) {
      this.startTime = new Date();
      this.isStarted = true;
    }
  }

  complete(): void {
    if (this.isStarted && !this.isCompleted) {
      this.endTime = new Date();
      this.isCompleted = true;
    }
  }

  updateInput(input: string): void {
    this.userInput = input;
    this.currentPosition = input.length;
  }

  reset(): void {
    this.startTime = null;
    this.endTime = null;
    this.userInput = '';
    this.currentPosition = 0;
    this.isStarted = false;
    this.isCompleted = false;
  }

  getDuration(): number {
    if (!this.startTime) return 0;
    const endTime = this.endTime || new Date();
    return Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);
  }
}