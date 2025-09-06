export interface TypingSessionDto {
  id: string;
  text: string;
  mode: 'sentence' | 'words';
  userInput: string;
  currentPosition: number;
  isStarted: boolean;
  isCompleted: boolean;
  startTime: string | null;
  endTime: string | null;
  stats: TypingStatsDto;
}

export interface TypingStatsDto {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  correctChars: number;
  totalChars: number;
  errorCount: number;
}