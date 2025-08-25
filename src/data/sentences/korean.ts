import { Sentence, SentenceCollection, ContentSource } from '@/types'

// 퍼블릭 도메인 콘텐츠 소스
export const contentSources: ContentSource[] = [
  {
    id: 'korean-classics',
    name: '한국 고전 문학',
    license: 'public-domain',
    description: '저작권이 만료된 한국 고전 문학 작품들'
  },
  {
    id: 'korean-proverbs',
    name: '한국 속담',
    license: 'public-domain',
    description: '전통적인 한국 속담과 격언'
  },
  {
    id: 'korean-news',
    name: '뉴스 문장',
    license: 'original',
    description: '일반적인 뉴스 문체의 연습용 문장'
  },
  {
    id: 'korean-everyday',
    name: '일상 문장',
    license: 'original',
    description: '일상생활에서 자주 사용되는 문장들'
  }
]

// 문장 데이터
export const koreanSentences: Sentence[] = [
  // 초급 - 매우 쉬운 문장들
  {
    id: 'kr-001',
    text: '안녕하세요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['매우짧음', '인사'],
    metadata: {
      wordCount: 1,
      characterCount: 6,
      avgWordLength: 6,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'kr-002', 
    text: '감사합니다.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['매우짧음', '인사'],
    metadata: {
      wordCount: 1,
      characterCount: 6,
      avgWordLength: 6,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'kr-003',
    text: '좋은 하루 보내세요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '인사'],
    metadata: {
      wordCount: 3,
      characterCount: 9,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'kr-004',
    text: '오늘 날씨가 좋네요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '일상'],
    metadata: {
      wordCount: 3,
      characterCount: 9,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 200
    }
  },
  {
    id: 'kr-005', 
    text: '물 좀 주세요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '일상'],
    metadata: {
      wordCount: 3,
      characterCount: 6,
      avgWordLength: 2,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'kr-006',
    text: '네, 알겠습니다.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '대답'],
    metadata: {
      wordCount: 2,
      characterCount: 7,
      avgWordLength: 3.5,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  
  // 명언 모음 (중급)
  {
    id: 'kr-020',
    text: '성공은 준비된 자에게 기회가 찾아올 때 이루어진다.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '성공'],
    metadata: {
      wordCount: 8,
      characterCount: 25,
      avgWordLength: 3.1,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'kr-021',
    text: '꿈을 꾸는 것은 좋지만 실행하지 않으면 아무것도 아니다.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '실행력'],
    metadata: {
      wordCount: 9,
      characterCount: 27,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'kr-022',
    text: '오늘 하루도 최선을 다하며 감사한 마음으로 살아가겠습니다.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '감사', '긍정'],
    metadata: {
      wordCount: 8,
      characterCount: 29,
      avgWordLength: 3.6,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 160
    }
  },
  {
    id: 'kr-023',
    text: '인생은 짧고 예술은 길다. 시간을 낭비하지 말고 열정적으로 살자.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '인생', '예술'],
    metadata: {
      wordCount: 11,
      characterCount: 32,
      avgWordLength: 2.9,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'kr-024',
    text: '변화를 두려워하지 말고 용기를 내어 새로운 도전을 시작해보자.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '변화', '도전'],
    metadata: {
      wordCount: 10,
      characterCount: 30,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 155
    }
  },
  
  // 중급 - 속담
  {
    id: 'kr-007',
    text: '백문이 불여일견이라는 말이 있듯이, 직접 경험해보는 것이 가장 좋은 학습 방법이다.',
    category: 'classic-literature',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['속담', '긴문장', '구두점'],
    metadata: {
      wordCount: 14,
      characterCount: 40,
      avgWordLength: 2.9,
      punctuationCount: 3,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'kr-008',
    text: '천리 길도 한 걸음부터 시작한다고 하니, 포기하지 말고 꾸준히 노력해봅시다.',
    category: 'classic-literature', 
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['속담', '긴문장'],
    metadata: {
      wordCount: 12,
      characterCount: 36,
      avgWordLength: 3,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 160
    }
  },

  // 고급 - 뉴스/학술
  {
    id: 'kr-009',
    text: '인공지능 기술의 발전으로 우리의 일상생활이 크게 변화하고 있으며, 이러한 변화에 적응하기 위해서는 지속적인 학습과 혁신이 필요하다.',
    category: 'technical',
    difficulty: 'advanced',
    language: 'ko', 
    sourceId: 'korean-news',
    tags: ['기술', '긴문장', '복잡'],
    metadata: {
      wordCount: 20,
      characterCount: 60,
      avgWordLength: 3,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 120
    }
  },
  {
    id: 'kr-010',
    text: '21세기 디지털 시대에는 정보의 홍수 속에서 올바른 정보를 선별하고 활용하는 능력이 더욱 중요해지고 있습니다.',
    category: 'academic',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-news', 
    tags: ['학술', '숫자포함', '긴문장'],
    metadata: {
      wordCount: 18,
      characterCount: 55,
      avgWordLength: 3.1,
      punctuationCount: 1,
      numberCount: 2,
      estimatedWPM: 130
    }
  },

  // 전문가 - 복잡한 문장
  {
    id: 'kr-011',
    text: '경제학에서는 "기회비용"이라는 개념을 통해 선택의 상황에서 포기해야 하는 것의 가치를 설명하며, 이는 합리적 의사결정을 위한 핵심 요소로 여겨진다.',
    category: 'academic',
    difficulty: 'expert',
    language: 'ko',
    sourceId: 'korean-news',
    tags: ['학술', '따옴표', '복잡', '긴문장'],
    metadata: {
      wordCount: 24,
      characterCount: 75,
      avgWordLength: 3.1,
      punctuationCount: 6,
      numberCount: 0,
      estimatedWPM: 100
    }
  },

  // 단문 추가 - 속담류
  {
    id: 'kr-100',
    text: '가는 말이 고와야 오는 말이 곱다',
    category: 'proverbs',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['단문', '속담'],
    metadata: {
      wordCount: 7,
      characterCount: 17,
      avgWordLength: 2.4,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 200
    }
  },
  {
    id: 'kr-101',
    text: '백문이 불여일견',
    category: 'proverbs',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['단문', '속담'],
    metadata: {
      wordCount: 3,
      characterCount: 8,
      avgWordLength: 2.7,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'kr-102',
    text: '천리길도 한 걸음부터',
    category: 'proverbs',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['단문', '속담'],
    metadata: {
      wordCount: 3,
      characterCount: 10,
      avgWordLength: 3.3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 210
    }
  },
  {
    id: 'kr-103',
    text: '급할수록 돌아가라',
    category: 'proverbs',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['단문', '속담'],
    metadata: {
      wordCount: 3,
      characterCount: 9,
      avgWordLength: 3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'kr-104',
    text: '콩 심은 데 콩 나고 팥 심은 데 팥 난다',
    category: 'proverbs',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['단문', '속담'],
    metadata: {
      wordCount: 10,
      characterCount: 20,
      avgWordLength: 2,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'kr-105',
    text: '시간은 금이다',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['단문', '명언'],
    metadata: {
      wordCount: 3,
      characterCount: 7,
      avgWordLength: 2.3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'kr-106',
    text: '꿈을 잃지 않는 한 희망은 있다',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['단문', '명언'],
    metadata: {
      wordCount: 7,
      characterCount: 16,
      avgWordLength: 2.3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 200
    }
  },
  {
    id: 'kr-107',
    text: '작은 변화가 큰 차이를 만든다',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['단문', '명언'],
    metadata: {
      wordCount: 6,
      characterCount: 15,
      avgWordLength: 2.5,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 200
    }
  },
  {
    id: 'kr-108',
    text: '배움에는 끝이 없다',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['단문', '명언'],
    metadata: {
      wordCount: 4,
      characterCount: 9,
      avgWordLength: 2.3,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'kr-109',
    text: '웃음은 최고의 명약이다',
    category: 'quotes',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['단문', '명언'],
    metadata: {
      wordCount: 5,
      characterCount: 11,
      avgWordLength: 2.2,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'kr-110',
    text: '건강이 최고의 재산이다',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['단문', '일상'],
    metadata: {
      wordCount: 5,
      characterCount: 11,
      avgWordLength: 2.2,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 220
    }
  },

  // 중문 추가 - 일상생활
  {
    id: 'kr-200',
    text: '인생은 마라톤과 같아서 빠르게 달리는 것보다 꾸준히 달리는 것이 중요하다',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '인생', '철학'],
    metadata: {
      wordCount: 14,
      characterCount: 37,
      avgWordLength: 2.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'kr-201',
    text: '실패는 성공의 어머니라는 말처럼 좌절하지 말고 다시 일어서는 것이 필요하다',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '성공', '실패'],
    metadata: {
      wordCount: 14,
      characterCount: 38,
      avgWordLength: 2.7,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 165
    }
  },
  {
    id: 'kr-202',
    text: '책을 읽는 것은 과거의 지혜를 배우고 미래를 준비하는 가장 좋은 방법이다',
    category: 'learning',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '독서', '학습'],
    metadata: {
      wordCount: 15,
      characterCount: 36,
      avgWordLength: 2.4,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'kr-203',
    text: '소통은 이해의 첫걸음이며 갈등을 해결하는 가장 좋은 방법이다',
    category: 'relationships',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '소통', '관계'],
    metadata: {
      wordCount: 12,
      characterCount: 31,
      avgWordLength: 2.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 175
    }
  },
  {
    id: 'kr-204',
    text: '변화를 두려워하지 말고 새로운 도전을 통해 성장하는 기회로 삼아야 한다',
    category: 'growth',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '변화', '성장'],
    metadata: {
      wordCount: 14,
      characterCount: 36,
      avgWordLength: 2.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'kr-205',
    text: '감사하는 마음을 가진 사람은 어떤 상황에서도 행복을 찾을 수 있다',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '감사', '행복'],
    metadata: {
      wordCount: 13,
      characterCount: 32,
      avgWordLength: 2.5,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 175
    }
  },
  {
    id: 'kr-206',
    text: '새로운 언어를 배우는 것은 다른 문화를 이해하는 창문을 여는 일이다',
    category: 'learning',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '언어', '문화'],
    metadata: {
      wordCount: 13,
      characterCount: 33,
      avgWordLength: 2.5,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'kr-207',
    text: '꾸준한 연습만이 기술을 완성시키고 목표를 달성하게 해준다',
    category: 'practice',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '연습', '목표'],
    metadata: {
      wordCount: 10,
      characterCount: 28,
      avgWordLength: 2.8,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'kr-208',
    text: '진실한 마음으로 대하면 상대방도 마음을 열게 된다',
    category: 'relationships',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '진실', '관계'],
    metadata: {
      wordCount: 10,
      characterCount: 24,
      avgWordLength: 2.4,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 185
    }
  },
  {
    id: 'kr-209',
    text: '봄이 오면 모든 생명체가 새로운 시작을 준비하며 활기를 되찾는다',
    category: 'nature',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['중문', '봄', '자연'],
    metadata: {
      wordCount: 12,
      characterCount: 31,
      avgWordLength: 2.6,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 175
    }
  },

  // 장문 추가 - 문학적 표현
  {
    id: 'kr-300',
    text: '봄이 오면 벚꽃이 피고 새들이 지저귀며 따뜻한 햇살이 대지를 깨운다 겨울 동안 움츠렸던 마음도 다시 활기를 찾고 새로운 시작에 대한 설렘으로 가득 찬다 계절의 순환은 우리에게 끝이 아닌 새로운 시작을 알려준다',
    category: 'literature',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['장문', '문학', '봄', '자연'],
    metadata: {
      wordCount: 40,
      characterCount: 126,
      avgWordLength: 3.2,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 120
    }
  },
  {
    id: 'kr-301',
    text: '도서관의 고요한 분위기 속에서 책장을 넘기는 소리만이 들린다 수많은 책들이 가득한 서가 사이를 걸으며 지식의 바다에 빠져든다 한 권의 책은 새로운 세계로 이끄는 마법의 문이며 상상력을 자극하는 보물창고다',
    category: 'literature',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['장문', '문학', '도서관', '책'],
    metadata: {
      wordCount: 38,
      characterCount: 118,
      avgWordLength: 3.1,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 125
    }
  },
  {
    id: 'kr-302',
    text: '바다 끝없이 펼쳐진 수평선 너머로 석양이 물들어간다 파도가 해변에 부딪히며 만들어내는 하얀 거품들이 아름답다 바다 바람이 얼굴을 스치며 일상의 스트레스를 모두 씻어내는 듯한 시원함을 선사한다',
    category: 'literature',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['장문', '문학', '바다', '자연'],
    metadata: {
      wordCount: 36,
      characterCount: 110,
      avgWordLength: 3.1,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 130
    }
  },
  {
    id: 'kr-303',
    text: '시간은 모든 사람에게 공평하게 주어지지만 그것을 어떻게 사용하느냐는 각자의 선택이다 과거를 후회하거나 미래를 걱정하기보다는 현재 이 순간에 집중하며 최선을 다하는 것이 지혜로운 삶의 태도다',
    category: 'philosophy',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['장문', '철학', '시간', '인생'],
    metadata: {
      wordCount: 38,
      characterCount: 118,
      avgWordLength: 3.1,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 125
    }
  },
  {
    id: 'kr-304',
    text: '인생에서 마주하는 어려움들은 우리를 더 강하게 만드는 시련이자 성장의 기회다 힘든 시기를 겪으며 얻는 경험과 지혜는 그 무엇과도 바꿀 수 없는 소중한 자산이 된다 포기하지 않는 용기가 기적을 만들어낸다',
    category: 'philosophy',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['장문', '철학', '성장', '인생'],
    metadata: {
      wordCount: 39,
      characterCount: 119,
      avgWordLength: 3.1,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 120
    }
  },
  {
    id: 'kr-305',
    text: '여행은 새로운 문화를 경험하고 다양한 사람들을 만나며 자신의 세계관을 넓혀주는 소중한 경험이다 낯선 곳에서 마주하는 예상치 못한 상황들은 우리를 더욱 유연하고 포용력 있는 사람으로 성장시켜준다',
    category: 'travel',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['장문', '여행', '성장', '문화'],
    metadata: {
      wordCount: 37,
      characterCount: 115,
      avgWordLength: 3.1,
      punctuationCount: 0,
      numberCount: 0,
      estimatedWPM: 125
    }
  }
]

// 문장 컬렉션
export const koreanCollections: SentenceCollection[] = [
  {
    id: 'korean-beginner',
    name: '한국어 초급',
    description: '한국어 타이핑 연습을 시작하는 분들을 위한 기본 문장들',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sentences: ['kr-001', 'kr-002', 'kr-003', 'kr-004', 'kr-005', 'kr-006'],
    sourceId: 'korean-everyday',
    isDefault: true,
    tags: ['초심자', '일상'],
    metadata: {
      totalSentences: 6,
      avgWordLength: 2.8,
      avgSentenceLength: 7,
      estimatedTime: 3
    }
  },
  {
    id: 'korean-proverbs',
    name: '한국 속담',
    description: '전통적인 한국 속담과 격언으로 배우는 타이핑',
    category: 'classic-literature', 
    difficulty: 'intermediate',
    language: 'ko',
    sentences: ['kr-007', 'kr-008'],
    sourceId: 'korean-proverbs',
    isDefault: false,
    tags: ['속담', '문화'],
    metadata: {
      totalSentences: 2,
      avgWordLength: 3,
      avgSentenceLength: 38,
      estimatedTime: 5
    }
  },
  {
    id: 'korean-quotes',
    name: '한국어 명언',
    description: '동기부여가 되는 명언과 격언 모음',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sentences: ['kr-020', 'kr-021', 'kr-022', 'kr-023', 'kr-024'],
    sourceId: 'korean-everyday',
    isDefault: false,
    tags: ['명언', '철학', '동기부여'],
    metadata: {
      totalSentences: 5,
      avgWordLength: 3.1,
      avgSentenceLength: 28,
      estimatedTime: 6
    }
  },
  {
    id: 'korean-advanced',
    name: '한국어 고급',
    description: '복잡한 문장 구조와 전문 용어가 포함된 고급 문장들',
    category: 'academic',
    difficulty: 'advanced',
    language: 'ko', 
    sentences: ['kr-009', 'kr-010', 'kr-011'],
    sourceId: 'korean-news',
    isDefault: false,
    tags: ['고급', '학술', '기술'],
    metadata: {
      totalSentences: 3,
      avgWordLength: 3.1,
      avgSentenceLength: 63,
      estimatedTime: 10
    }
  }
]