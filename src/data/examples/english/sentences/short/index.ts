// English Short Sentences Export
export { basicEnglishShortSentences } from './basic';
export { punctuationEnglishShortSentences } from './punctuation';
export { numbersEnglishShortSentences } from './numbers';
export { mixedEnglishShortSentences } from './mixed';

// Combine all short sentences
import { basicEnglishShortSentences } from './basic';
import { punctuationEnglishShortSentences } from './punctuation';
import { numbersEnglishShortSentences } from './numbers';
import { mixedEnglishShortSentences } from './mixed';

export const allEnglishShortSentences = [
  ...basicEnglishShortSentences,
  ...punctuationEnglishShortSentences,
  ...numbersEnglishShortSentences,
  ...mixedEnglishShortSentences
];

export const englishShortSentencesByType = {
  basic: basicEnglishShortSentences,
  punctuation: punctuationEnglishShortSentences,
  numbers: numbersEnglishShortSentences,
  mixed: mixedEnglishShortSentences,
  all: allEnglishShortSentences
};