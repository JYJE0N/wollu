export const koreanTexts = [
  "안녕하세요. 한글 타자 연습을 시작합니다.",
  "컴퓨터를 사용할 때 타자 실력이 중요합니다.",
  "꾸준한 연습으로 타자 속도를 향상시킬 수 있습니다.",
  "정확하고 빠른 타자를 위해 올바른 손가락 사용법을 익혀야 합니다.",
  "한글은 자음과 모음이 조합되어 만들어지는 표음문자입니다.",
  "우리나라의 아름다운 한글로 타자 연습을 해보세요.",
  "키보드 자판에 익숙해지면 타자 속도가 빨라집니다.",
  "매일 조금씩이라도 연습하면 실력이 늘어납니다.",
  "오타가 생기지 않도록 정확성을 먼저 기르는 것이 중요합니다.",
  "한글 타자는 자음과 모음을 순서대로 입력하여 글자를 만듭니다.",
  "정보화 시대에 빠른 타자 실력은 필수적인 능력입니다.",
  "손목의 피로를 줄이기 위해 올바른 자세로 타자를 연습하세요.",
  "한국어의 특성을 이해하면 더욱 효과적인 타자가 가능합니다.",
  "반복 연습을 통해 손가락의 근육 기억을 발달시킬 수 있습니다.",
  "타자 연습은 인내심과 집중력을 기르는 데도 도움이 됩니다."
];

export const koreanWords = [
  "안녕", "감사", "미안", "사랑", "행복", "친구", "가족", "학교", "회사", "음식",
  "컴퓨터", "휴대폰", "인터넷", "게임", "영화", "음악", "책", "공부", "운동", "여행",
  "날씨", "계절", "봄", "여름", "가을", "겨울", "햇빛", "바람", "비", "눈",
  "동물", "강아지", "고양이", "새", "물고기", "나무", "꽃", "산", "바다", "강",
  "자동차", "버스", "지하철", "비행기", "기차", "자전거", "도로", "신호등", "건물", "집"
];

export function getRandomText(): string {
  return koreanTexts[Math.floor(Math.random() * koreanTexts.length)];
}

export function getRandomWord(): string {
  return koreanWords[Math.floor(Math.random() * koreanWords.length)];
}

export function getRandomWords(count: number): string {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(getRandomWord());
  }
  return words.join(' ');
}