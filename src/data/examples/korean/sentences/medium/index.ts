// 한글 중문 통합 내보내기
export { basicKoreanMediumSentences } from './basic';
export { complexKoreanMediumSentences } from './complex';

// 모든 중문 문장 합치기
import { basicKoreanMediumSentences } from './basic';
import { complexKoreanMediumSentences } from './complex';

export const allKoreanMediumSentences = [
  ...basicKoreanMediumSentences,
  ...complexKoreanMediumSentences
];

export const koreanMediumSentencesByType = {
  basic: basicKoreanMediumSentences,
  complex: complexKoreanMediumSentences,
  all: allKoreanMediumSentences
};