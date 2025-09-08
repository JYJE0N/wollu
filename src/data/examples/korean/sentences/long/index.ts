// 한글 장문 통합 내보내기
export { narrativeKoreanLongSentences } from './narrative';
export { academicKoreanLongSentences } from './academic';

// 모든 장문 문장 합치기
import { narrativeKoreanLongSentences } from './narrative';
import { academicKoreanLongSentences } from './academic';

export const allKoreanLongSentences = [
  ...narrativeKoreanLongSentences,
  ...academicKoreanLongSentences
];

export const koreanLongSentencesByType = {
  narrative: narrativeKoreanLongSentences,
  academic: academicKoreanLongSentences,
  all: allKoreanLongSentences
};