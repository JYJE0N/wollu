// English Medium Sentences Export
export { basicEnglishMediumSentences } from './basic';
export { complexEnglishMediumSentences } from './complex';
export { punctuationEnglishMediumSentences } from './punctuation';
export { numbersEnglishMediumSentences } from './numbers';
export { mixedEnglishMediumSentences } from './mixed';

// Combine all medium sentences
import { basicEnglishMediumSentences } from './basic';
import { complexEnglishMediumSentences } from './complex';
import { punctuationEnglishMediumSentences } from './punctuation';
import { numbersEnglishMediumSentences } from './numbers';
import { mixedEnglishMediumSentences } from './mixed';

export const allEnglishMediumSentences = [
  ...basicEnglishMediumSentences,
  ...complexEnglishMediumSentences,
  ...punctuationEnglishMediumSentences,
  ...numbersEnglishMediumSentences,
  ...mixedEnglishMediumSentences
];

export const englishMediumSentencesByType = {
  basic: [...basicEnglishMediumSentences, ...complexEnglishMediumSentences],
  punctuation: punctuationEnglishMediumSentences,
  numbers: numbersEnglishMediumSentences,
  mixed: mixedEnglishMediumSentences,
  all: allEnglishMediumSentences
};