import { SentenceLength, SentenceStyle } from '@/types'

// Korean sentence imports
import { 
  shortPlain as koShortPlain,
  shortPunctuation as koShortPunctuation, 
  shortNumbers as koShortNumbers,
  shortMixed as koShortMixed
} from './korean/short'

import {
  mediumPlain as koMediumPlain,
  mediumPunctuation as koMediumPunctuation,
  mediumNumbers as koMediumNumbers, 
  mediumMixed as koMediumMixed
} from './korean/medium'

import {
  longPlain as koLongPlain,
  longPunctuation as koLongPunctuation,
  longNumbers as koLongNumbers,
  longMixed as koLongMixed
} from './korean/long'

// English sentence imports  
import {
  shortPlain as enShortPlain,
  shortPunctuation as enShortPunctuation,
  shortNumbers as enShortNumbers,
  shortMixed as enShortMixed
} from './english/short'

import {
  mediumPlain as enMediumPlain,
  mediumPunctuation as enMediumPunctuation,
  mediumNumbers as enMediumNumbers,
  mediumMixed as enMediumMixed
} from './english/medium'

import {
  longPlain as enLongPlain,
  longPunctuation as enLongPunctuation,
  longNumbers as enLongNumbers,
  longMixed as enLongMixed
} from './english/long'

// Organized sentence pools by language
const sentencePools = {
  korean: {
    short: {
      plain: koShortPlain,
      punctuation: koShortPunctuation,
      numbers: koShortNumbers,
      mixed: koShortMixed
    },
    medium: {
      plain: koMediumPlain,
      punctuation: koMediumPunctuation,
      numbers: koMediumNumbers,
      mixed: koMediumMixed
    },
    long: {
      plain: koLongPlain,
      punctuation: koLongPunctuation,
      numbers: koLongNumbers,
      mixed: koLongMixed
    }
  },
  english: {
    short: {
      plain: enShortPlain,
      punctuation: enShortPunctuation,
      numbers: enShortNumbers,
      mixed: enShortMixed
    },
    medium: {
      plain: enMediumPlain,
      punctuation: enMediumPunctuation,
      numbers: enMediumNumbers,
      mixed: enMediumMixed
    },
    long: {
      plain: enLongPlain,
      punctuation: enLongPunctuation,
      numbers: enLongNumbers,
      mixed: enLongMixed
    }
  }
}

/**
 * Get sentences by language, length, and style
 */
export function getSentencesByType(
  language: 'korean' | 'english',
  length: SentenceLength,
  style: SentenceStyle
): string[] {
  const pool = sentencePools[language]?.[length]?.[style]
  if (!pool || pool.length === 0) {
    console.warn(`No sentences found for: ${language} ${length} ${style}`)
    return []
  }
  return [...pool] // Return a copy to prevent mutations
}

/**
 * Get random sentences from a specific pool
 */
export function getRandomSentencesFromPool(
  language: 'korean' | 'english',
  length: SentenceLength,
  style: SentenceStyle,
  count: number
): string[] {
  const pool = getSentencesByType(language, length, style)
  if (pool.length === 0) return []
  
  const selectedSentences: string[] = []
  const availableSentences = [...pool]
  
  for (let i = 0; i < count; i++) {
    if (availableSentences.length === 0) {
      // Reset pool when exhausted
      availableSentences.push(...pool)
    }
    
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    selectedSentences.push(selectedSentence)
    
    // Remove used sentence to prevent immediate duplicates
    availableSentences.splice(randomIndex, 1)
  }
  
  return selectedSentences
}

/**
 * Get all available sentence counts by language and type
 */
export function getSentencePoolInfo() {
  const info = {
    korean: {
      short: {
        plain: koShortPlain.length,
        punctuation: koShortPunctuation.length,
        numbers: koShortNumbers.length,
        mixed: koShortMixed.length,
        total: koShortPlain.length + koShortPunctuation.length + koShortNumbers.length + koShortMixed.length
      },
      medium: {
        plain: koMediumPlain.length,
        punctuation: koMediumPunctuation.length,
        numbers: koMediumNumbers.length,
        mixed: koMediumMixed.length,
        total: koMediumPlain.length + koMediumPunctuation.length + koMediumNumbers.length + koMediumMixed.length
      },
      long: {
        plain: koLongPlain.length,
        punctuation: koLongPunctuation.length,
        numbers: koLongNumbers.length,
        mixed: koLongMixed.length,
        total: koLongPlain.length + koLongPunctuation.length + koLongNumbers.length + koLongMixed.length
      }
    },
    english: {
      short: {
        plain: enShortPlain.length,
        punctuation: enShortPunctuation.length,
        numbers: enShortNumbers.length,
        mixed: enShortMixed.length,
        total: enShortPlain.length + enShortPunctuation.length + enShortNumbers.length + enShortMixed.length
      },
      medium: {
        plain: enMediumPlain.length,
        punctuation: enMediumPunctuation.length,
        numbers: enMediumNumbers.length,
        mixed: enMediumMixed.length,
        total: enMediumPlain.length + enMediumPunctuation.length + enMediumNumbers.length + enMediumMixed.length
      },
      long: {
        plain: enLongPlain.length,
        punctuation: enLongPunctuation.length,
        numbers: enLongNumbers.length,
        mixed: enLongMixed.length,
        total: enLongPlain.length + enLongPunctuation.length + enLongNumbers.length + enLongMixed.length
      }
    }
  }
  
  return info
}