// 한글 중문 통합 내보내기
export { basicKoreanMediumSentences } from './basic';
export { complexKoreanMediumSentences } from './complex';
export { punctuationKoreanMediumSentences } from './punctuation';
export { numbersKoreanMediumSentences } from './numbers';
export { mixedKoreanMediumSentences } from './mixed';

// 모든 중문 문장 합치기
import { basicKoreanMediumSentences } from './basic';
import { complexKoreanMediumSentences } from './complex';
import { punctuationKoreanMediumSentences } from './punctuation';
import { numbersKoreanMediumSentences } from './numbers';
import { mixedKoreanMediumSentences } from './mixed';

export const allKoreanMediumSentences = [
  ...basicKoreanMediumSentences,
  ...complexKoreanMediumSentences,
  ...punctuationKoreanMediumSentences,
  ...numbersKoreanMediumSentences,
  ...mixedKoreanMediumSentences
];

export const koreanMediumSentencesByType = {
  basic: [...basicKoreanMediumSentences, ...complexKoreanMediumSentences],
  punctuation: punctuationKoreanMediumSentences,
  numbers: numbersKoreanMediumSentences,
  mixed: mixedKoreanMediumSentences,
  all: allKoreanMediumSentences
};