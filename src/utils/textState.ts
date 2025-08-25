/**
 * 텍스트 상태 계산 유틸리티
 * 책임: 문자별 상태 계산, 특수키 감지, 최적화된 상태 관리
 */

export type CharacterStatus = "pending" | "correct" | "incorrect" | "current";
export type SpecialKeyType = "enter" | "tab" | "space" | null;

export interface CharacterState {
  char: string;
  status: CharacterStatus;
  index: number;
  specialKey: SpecialKeyType;
}

/**
 * 특수 키 감지
 */
export function getSpecialKeyType(char: string): SpecialKeyType {
  if (char === "\n") return "enter";
  if (char === "\t") return "tab";
  if (char === " ") return "space";
  return null;
}

/**
 * 문자별 상태 계산 (최적화된 버전)
 */
export function calculateCharacterStates(
  text: string,
  currentIndex: number,
  userInput: string,
  mistakes: number[]
): CharacterState[] {
  const states: CharacterState[] = [];
  
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    let status: CharacterStatus = "pending";

    // 현재 타이핑 위치 확인
    if (index < currentIndex) {
      // 이미 타이핑한 문자 - userInput과 비교
      const isCorrect = index < userInput.length && userInput[index] === char;
      status = isCorrect ? "correct" : "incorrect";

      // mistakes 배열에서 이 위치의 실수 여부 재확인
      if (mistakes.includes(index) && !isCorrect) {
        status = "incorrect";
      }
    } else if (index === currentIndex) {
      // 현재 타이핑할 문자
      status = "current";
    }
    // else: pending (기본값)

    const specialKey = getSpecialKeyType(char);

    states.push({
      char,
      status,
      index,
      specialKey,
    });
  }

  return states;
}

/**
 * 단어별 그룹화 (렌더링 최적화용)
 */
export function groupCharactersByWords(
  text: string,
  characterStates: CharacterState[]
): Array<{
  wordChars: CharacterState[];
  spaceChar?: CharacterState;
}> {
  const words = text.split(" ");
  const groups: Array<{
    wordChars: CharacterState[];
    spaceChar?: CharacterState;
  }> = [];
  
  let charIndex = 0;

  words.forEach((word, wordIndex) => {
    const wordChars: CharacterState[] = [];
    
    // 단어의 각 문자
    for (let i = 0; i < word.length; i++) {
      if (charIndex < characterStates.length) {
        wordChars.push(characterStates[charIndex]);
      }
      charIndex++;
    }

    // 스페이스 문자 (마지막 단어 제외)
    const spaceIndex = charIndex;
    let spaceChar: CharacterState | undefined;
    
    if (spaceIndex < text.length && wordIndex < words.length - 1) {
      spaceChar = characterStates[spaceIndex];
      charIndex++; // 스페이스 인덱스 증가
    }

    groups.push({
      wordChars,
      spaceChar,
    });
  });

  return groups;
}