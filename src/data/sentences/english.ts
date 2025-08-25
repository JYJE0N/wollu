import { Sentence, SentenceCollection, ContentSource } from '@/types'

// 퍼블릭 도메인 콘텐츠 소스  
export const contentSources: ContentSource[] = [
  {
    id: 'shakespeare',
    name: 'Shakespeare Works',
    license: 'public-domain',
    author: 'William Shakespeare',
    year: 1600,
    source: 'Project Gutenberg',
    description: 'Classic works by William Shakespeare'
  },
  {
    id: 'common-phrases',
    name: 'Common English Phrases',
    license: 'original',
    description: 'Everyday English phrases and sentences'
  },
  {
    id: 'technical-writing',
    name: 'Technical Documentation',
    license: 'original', 
    description: 'Programming and technical writing samples'
  },
  {
    id: 'news-sample',
    name: 'News Style Writing',
    license: 'original',
    description: 'News article style sentences'
  }
]

// 영어 문장 데이터
export const englishSentences: Sentence[] = [
  // 초급 - 일상
  {
    id: 'en-001',
    text: 'The quick brown fox jumps over the lazy dog.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['pangram', 'classic'],
    metadata: {
      wordCount: 9,
      characterCount: 43,
      avgWordLength: 3.9,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'en-002',
    text: 'Hello, how are you today?',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['greeting', 'short'],
    metadata: {
      wordCount: 5,
      characterCount: 25,
      avgWordLength: 3.4,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 280
    }
  },

  // 중급 - 문학
  {
    id: 'en-003',
    text: 'To be or not to be, that is the question.',
    category: 'classic-literature',
    difficulty: 'intermediate', 
    language: 'en',
    sourceId: 'shakespeare',
    tags: ['famous', 'shakespeare'],
    metadata: {
      wordCount: 10,
      characterCount: 41,
      avgWordLength: 2.9,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'en-004',
    text: 'All the world\'s a stage, and all the men and women merely players.',
    category: 'classic-literature',
    difficulty: 'intermediate',
    language: 'en', 
    sourceId: 'shakespeare',
    tags: ['metaphor', 'shakespeare', 'apostrophe'],
    metadata: {
      wordCount: 13,
      characterCount: 66,
      avgWordLength: 3.8,
      punctuationCount: 3,
      numberCount: 0,
      estimatedWPM: 200
    }
  },

  // 고급 - 기술/뉴스
  {
    id: 'en-005',
    text: 'Machine learning algorithms can process vast amounts of data to identify patterns and make predictions with remarkable accuracy.',
    category: 'technical',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'technical-writing', 
    tags: ['technology', 'complex', 'long'],
    metadata: {
      wordCount: 18,
      characterCount: 123,
      avgWordLength: 6.1,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-006',
    text: 'The implementation of sustainable development goals requires coordinated efforts from governments, businesses, and civil society organizations worldwide.',
    category: 'academic',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'news-sample',
    tags: ['sustainability', 'policy', 'complex'],
    metadata: {
      wordCount: 18,
      characterCount: 140,
      avgWordLength: 6.9,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 160
    }
  },

  // 전문가 - 복잡한 문장
  {
    id: 'en-007',
    text: 'The interdisciplinary approach to problem-solving, which combines insights from multiple fields of study, has proven particularly effective in addressing complex challenges that require nuanced understanding.',
    category: 'academic',
    difficulty: 'expert',
    language: 'en',
    sourceId: 'technical-writing',
    tags: ['academic', 'complex', 'multidisciplinary'],
    metadata: {
      wordCount: 25,
      characterCount: 180,
      avgWordLength: 6.4,
      punctuationCount: 3,
      numberCount: 0,
      estimatedWPM: 140
    }
  },
  {
    id: 'en-008',
    text: 'In JavaScript, the "this" keyword refers to the object that the function belongs to, but its value can change depending on how the function is called.',
    category: 'technical',
    difficulty: 'expert',
    language: 'en', 
    sourceId: 'technical-writing',
    tags: ['programming', 'quotes', 'technical'],
    metadata: {
      wordCount: 25,
      characterCount: 144,
      avgWordLength: 4.6,
      punctuationCount: 5,
      numberCount: 0,
      estimatedWPM: 150
    }
  },

  // 단문 추가
  {
    id: 'en-100',
    text: 'Actions speak louder than words',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'wisdom'],
    metadata: {
      wordCount: 5,
      characterCount: 29,
      avgWordLength: 5.8,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'en-101',
    text: 'Time is money and precious',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'wisdom'],
    metadata: {
      wordCount: 5,
      characterCount: 25,
      avgWordLength: 5,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 260
    }
  },
  {
    id: 'en-102',
    text: 'Knowledge is power for everyone',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'wisdom'],
    metadata: {
      wordCount: 5,
      characterCount: 30,
      avgWordLength: 6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'en-103',
    text: 'Practice makes perfect always',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'wisdom'],
    metadata: {
      wordCount: 4,
      characterCount: 27,
      avgWordLength: 6.8,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'en-104',
    text: 'Dream big and work hard daily',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'motivation'],
    metadata: {
      wordCount: 6,
      characterCount: 28,
      avgWordLength: 4.7,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'en-105',
    text: 'Believe in yourself always trust',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'motivation'],
    metadata: {
      wordCount: 5,
      characterCount: 30,
      avgWordLength: 6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'en-106',
    text: 'Health is wealth for life',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'health'],
    metadata: {
      wordCount: 5,
      characterCount: 24,
      avgWordLength: 4.8,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 260
    }
  },
  {
    id: 'en-107',
    text: 'Smile and world smiles with you',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'happiness'],
    metadata: {
      wordCount: 6,
      characterCount: 30,
      avgWordLength: 5,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'en-108',
    text: 'Learn from yesterday live today',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'wisdom'],
    metadata: {
      wordCount: 5,
      characterCount: 30,
      avgWordLength: 6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'en-109',
    text: 'Happiness is choice we make daily',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['short', 'happiness'],
    metadata: {
      wordCount: 6,
      characterCount: 32,
      avgWordLength: 5.3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 230
    }
  },

  // 중문 추가
  {
    id: 'en-200',
    text: 'Success is not final failure is not fatal it is courage to continue that counts most',
    category: 'quotes',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'success', 'courage'],
    metadata: {
      wordCount: 16,
      characterCount: 82,
      avgWordLength: 5.1,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-201',
    text: 'The best time to plant tree was twenty years ago second best time is now today',
    category: 'quotes',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'timing', 'wisdom'],
    metadata: {
      wordCount: 16,
      characterCount: 78,
      avgWordLength: 4.9,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 185
    }
  },
  {
    id: 'en-202',
    text: 'Education is most powerful weapon which you can use to change the world forever',
    category: 'quotes',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'education', 'change'],
    metadata: {
      wordCount: 14,
      characterCount: 78,
      avgWordLength: 5.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-203',
    text: 'Innovation distinguishes between leader and follower in every field of human endeavor',
    category: 'quotes',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'innovation', 'leadership'],
    metadata: {
      wordCount: 12,
      characterCount: 83,
      avgWordLength: 6.9,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 175
    }
  },
  {
    id: 'en-204',
    text: 'Reading is to mind what exercise is to body keeping both healthy and strong',
    category: 'learning',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'reading', 'health'],
    metadata: {
      wordCount: 14,
      characterCount: 73,
      avgWordLength: 5.2,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-205',
    text: 'Travel makes one modest you see what tiny place you occupy in this world',
    category: 'travel',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'travel', 'perspective'],
    metadata: {
      wordCount: 13,
      characterCount: 72,
      avgWordLength: 5.5,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-206',
    text: 'Communication works for those who work at it consistently with patience and understanding',
    category: 'relationships',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'communication', 'relationships'],
    metadata: {
      wordCount: 13,
      characterCount: 86,
      avgWordLength: 6.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'en-207',
    text: 'Technology should improve life not become life itself for modern human beings today',
    category: 'technology',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'technology', 'balance'],
    metadata: {
      wordCount: 13,
      characterCount: 81,
      avgWordLength: 6.2,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 175
    }
  },
  {
    id: 'en-208',
    text: 'Exercise not only changes your body it changes your mind attitude and mood',
    category: 'health',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'exercise', 'health'],
    metadata: {
      wordCount: 13,
      characterCount: 73,
      avgWordLength: 5.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-209',
    text: 'Future belongs to those who believe in beauty of their dreams and work',
    category: 'quotes',
    difficulty: 'intermediate',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['medium', 'future', 'dreams'],
    metadata: {
      wordCount: 13,
      characterCount: 69,
      avgWordLength: 5.3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 185
    }
  },

  // 장문 추가
  {
    id: 'en-300',
    text: 'Technology has revolutionized the way we communicate work and live our daily lives bringing unprecedented convenience From smartphones to artificial intelligence we are witnessing remarkable changes that shape our future society However we must remember that human connection and empathy remain irreplaceable values in this digital age',
    category: 'technology',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'technical-writing',
    tags: ['long', 'technology', 'society'],
    metadata: {
      wordCount: 50,
      characterCount: 288,
      avgWordLength: 5.8,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'en-301',
    text: 'Reading opens doors to infinite worlds of imagination knowledge and wisdom accumulated throughout human history and civilization Through books we can travel to distant lands meet fascinating characters and explore ideas that challenge our perspectives fundamentally Literature remains one of humanity greatest achievements and treasures',
    category: 'literature',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['long', 'reading', 'literature'],
    metadata: {
      wordCount: 47,
      characterCount: 284,
      avgWordLength: 6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'en-302',
    text: 'Learning new language opens mind to different cultures perspectives and ways of thinking about the world around us daily It builds bridges between people from diverse backgrounds and creates opportunities for meaningful connections and understanding Multilingualism enhances cognitive abilities and career prospects significantly throughout life',
    category: 'learning',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['long', 'language', 'culture'],
    metadata: {
      wordCount: 48,
      characterCount: 285,
      avgWordLength: 5.9,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'en-303',
    text: 'Travel broadens horizons by exposing us to different cultures foods languages and ways of life around globe It challenges our assumptions breaks down stereotypes and helps us understand that despite our differences humans share common hopes dreams and values Every journey teaches valuable lessons about world and ourselves',
    category: 'travel',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['long', 'travel', 'culture'],
    metadata: {
      wordCount: 48,
      characterCount: 272,
      avgWordLength: 5.7,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 155
    }
  },
  {
    id: 'en-304',
    text: 'Innovation drives progress by challenging status quo and finding creative solutions to complex problems facing humanity today It requires willingness to take risks think differently and learn from failures while maintaining persistence toward goals Great innovations often come from combining existing ideas in new ways',
    category: 'innovation',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'technical-writing',
    tags: ['long', 'innovation', 'progress'],
    metadata: {
      wordCount: 47,
      characterCount: 272,
      avgWordLength: 5.8,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 155
    }
  },
  {
    id: 'en-305',
    text: 'Environmental protection is not just responsibility but necessity for survival of future generations on our beautiful planet Earth Climate change threatens ecosystems worldwide requiring immediate action from individuals governments and organizations everywhere Every small effort contributes to preserving Earth for our children and grandchildren',
    category: 'environment',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'news-sample',
    tags: ['long', 'environment', 'climate'],
    metadata: {
      wordCount: 46,
      characterCount: 276,
      avgWordLength: 6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 150
    }
  }
]

// 영어 문장 컬렉션
export const englishCollections: SentenceCollection[] = [
  {
    id: 'english-beginner',
    name: 'English Basics',
    description: 'Simple sentences for English typing practice',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sentences: ['en-001', 'en-002'],
    sourceId: 'common-phrases',
    isDefault: true,
    tags: ['beginner', 'everyday'],
    metadata: {
      totalSentences: 2,
      avgWordLength: 3.7,
      avgSentenceLength: 34,
      estimatedTime: 2
    }
  },
  {
    id: 'shakespeare-classics',
    name: 'Shakespeare Quotes',
    description: 'Famous quotes from William Shakespeare',
    category: 'classic-literature',
    difficulty: 'intermediate',
    language: 'en',
    sentences: ['en-003', 'en-004'], 
    sourceId: 'shakespeare',
    isDefault: false,
    tags: ['literature', 'classic', 'famous'],
    metadata: {
      totalSentences: 2,
      avgWordLength: 3.4,
      avgSentenceLength: 54,
      estimatedTime: 3
    }
  },
  {
    id: 'technical-english',
    name: 'Technical Writing',
    description: 'Advanced technical and academic sentences',
    category: 'technical',
    difficulty: 'advanced',
    language: 'en',
    sentences: ['en-005', 'en-006', 'en-007', 'en-008'],
    sourceId: 'technical-writing',
    isDefault: false,
    tags: ['advanced', 'technical', 'programming'],
    metadata: {
      totalSentences: 4,
      avgWordLength: 6,
      avgSentenceLength: 147,
      estimatedTime: 8
    }
  }
]