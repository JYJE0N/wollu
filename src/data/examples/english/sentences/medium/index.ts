// English Medium Sentences Export
export { basicEnglishMediumSentences } from './basic';
export { complexEnglishMediumSentences } from './complex';

// Combine all medium sentences
import { basicEnglishMediumSentences } from './basic';
import { complexEnglishMediumSentences } from './complex';

export const allEnglishMediumSentences = [
  ...basicEnglishMediumSentences,
  ...complexEnglishMediumSentences
];

export const englishMediumSentencesByType = {
  basic: basicEnglishMediumSentences,
  complex: complexEnglishMediumSentences,
  all: allEnglishMediumSentences
};