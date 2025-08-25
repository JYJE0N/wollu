export interface TestTitle {
  id: string;
  name: string;
  description: string;
  suffix: string; // "칭호를 얻으셨습니다", "찬사를 받으셨습니다" 등
  minCPM: number;
  maxCPM?: number;
  color: string;
}

export const TEST_TITLES: TestTitle[] = [
  {
    id: "eagle_master",
    name: "독수리 타법",
    description: "독수리 타법의 달인",
    suffix: "칭호를 얻으셨습니다",
    minCPM: 80,
    maxCPM: 120,
    color: "#8b5cf6",
  },
  {
    id: "dont_tease_newbie",
    name: "애송이라 놀리지 말아요",
    description: "아직 배우는 중",
    suffix: "응원을 받으셨습니다",
    minCPM: 120,
    maxCPM: 180,
    color: "#06b6d4",
  },
  {
    id: "memorized_all",
    name: "자판 다 외우셨나요?",
    description: "키보드 배열 완성",
    suffix: "질문을 받으셨습니다",
    minCPM: 180,
    maxCPM: 250,
    color: "#10b981",
  },
  {
    id: "not_bad",
    name: "제법",
    description: "실력이 늘었네요",
    suffix: "칭호를 얻으셨습니다",
    minCPM: 250,
    maxCPM: 350,
    color: "#f59e0b",
  },
  {
    id: "stenographer_level",
    name: "속기사세요?",
    description: "전문가급 실력",
    suffix: "감탄했습니다",
    minCPM: 350,
    maxCPM: 450,
    color: "#ef4444",
  },
  {
    id: "called_machine",
    name: "기계인가요?",
    description: "인간의 한계 돌파",
    suffix: "놀랐습니다",
    minCPM: 450,
    maxCPM: 550,
    color: "#8b5cf6",
  },
  {
    id: "chat_only_at_work",
    name: "일 안 하고 채팅만 했죠",
    description: "이런 실력으로 뭘 하셨길래",
    suffix: "찬사를 받으셨습니다",
    minCPM: 550,
    color: "#f97316",
  },
];

export class TestTitleSystem {
  static calculateTestTitle(cpm: number): TestTitle | null {
    for (const title of TEST_TITLES) {
      if (cpm >= title.minCPM && (!title.maxCPM || cpm < title.maxCPM)) {
        return title;
      }
    }

    // 80 미만인 경우 칭호 없음
    return null;
  }

  static getTitleByResult(testResult: {
    cpm: number;
    accuracy: number;
    timeElapsed: number;
  }): TestTitle | null {
    return this.calculateTestTitle(testResult.cpm);
  }

  static getAllTitles(): TestTitle[] {
    return TEST_TITLES;
  }

  static getTitleById(id: string): TestTitle | null {
    return TEST_TITLES.find((title) => title.id === id) || null;
  }
}

export const defaultTestTitleSystem = new TestTitleSystem();
