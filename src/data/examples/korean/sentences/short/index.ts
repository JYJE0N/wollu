// 한글 단문 통합 내보내기
export { basicKoreanShortSentences } from './basic';
export { punctuationKoreanShortSentences } from './punctuation';
export { numbersKoreanShortSentences } from './numbers';
export { mixedKoreanShortSentences } from './mixed';

// 모든 단문 문장 합치기
import { basicKoreanShortSentences } from './basic';
import { punctuationKoreanShortSentences } from './punctuation';
import { numbersKoreanShortSentences } from './numbers';
import { mixedKoreanShortSentences } from './mixed';

export const allKoreanShortSentences = [
  ...basicKoreanShortSentences,
  ...punctuationKoreanShortSentences,
  ...numbersKoreanShortSentences,
  ...mixedKoreanShortSentences
];

export const koreanShortSentencesByType = {
  basic: basicKoreanShortSentences,
  punctuation: punctuationKoreanShortSentences,
  numbers: numbersKoreanShortSentences,
  mixed: mixedKoreanShortSentences,
  all: allKoreanShortSentences
};