// 한글 장문 통합 내보내기
export { basicKoreanLongSentences } from './basic';
export { narrativeKoreanLongSentences } from './narrative';
export { academicKoreanLongSentences } from './academic';
export { punctuationKoreanLongSentences } from './punctuation';
export { numbersKoreanLongSentences } from './numbers';
export { mixedKoreanLongSentences } from './mixed';

// 모든 장문 문장 합치기
import { basicKoreanLongSentences } from './basic';
import { narrativeKoreanLongSentences } from './narrative';
import { academicKoreanLongSentences } from './academic';
import { punctuationKoreanLongSentences } from './punctuation';
import { numbersKoreanLongSentences } from './numbers';
import { mixedKoreanLongSentences } from './mixed';

export const allKoreanLongSentences = [
  ...basicKoreanLongSentences,
  ...narrativeKoreanLongSentences,
  ...academicKoreanLongSentences,
  ...punctuationKoreanLongSentences,
  ...numbersKoreanLongSentences,
  ...mixedKoreanLongSentences
];

export const koreanLongSentencesByType = {
  basic: [...basicKoreanLongSentences, ...narrativeKoreanLongSentences, ...academicKoreanLongSentences],
  punctuation: punctuationKoreanLongSentences,
  numbers: numbersKoreanLongSentences,
  mixed: mixedKoreanLongSentences,
  all: allKoreanLongSentences
};