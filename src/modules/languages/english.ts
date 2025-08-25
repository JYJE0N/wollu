import { LanguagePack } from '@/types'

export const englishLanguagePack: LanguagePack = {
  id: 'english',
  name: 'English',
  font: 'JetBrains Mono',
  wordLists: {
    // 순수 단어만 (명사, 대명사, 동사 위주 - 구두점, 숫자 제외)
    plain: [
      'cat', 'dog', 'bird', 'fish', 'house', 'tree', 'flower', 'water', 'fire', 'earth',
      'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind', 'ocean', 'mountain', 'river',
      'book', 'pen', 'paper', 'table', 'chair', 'computer', 'phone', 'camera', 'music', 'movie',
      'food', 'apple', 'bread', 'coffee', 'tea', 'milk', 'cheese', 'pizza', 'cake', 'cookie',
      'school', 'office', 'hospital', 'store', 'park', 'library', 'museum', 'theater', 'church', 'bank',
      'morning', 'evening', 'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'season', 'holiday',
      'friend', 'family', 'mother', 'father', 'brother', 'sister', 'child', 'baby', 'teacher', 'student',
      'happy', 'sad', 'angry', 'excited', 'tired', 'hungry', 'thirsty', 'cold', 'warm', 'hot',
      'big', 'small', 'tall', 'short', 'long', 'wide', 'narrow', 'thick', 'thin', 'heavy',
      'red', 'blue', 'green', 'yellow', 'black', 'white', 'purple', 'pink', 'orange', 'brown'
    ]
  },
  
  sentences: {
    short: {
      // 단문 - 일반 (단순한 문장, 구두점 최소)
      plain: [
        'The cat is sleeping',
        'Birds fly in the sky',
        'Water flows down the river',
        'Children play in the park',
        'The sun rises every morning',
        'Books help us learn',
        'Friends make life better',
        'Music brings joy',
        'Trees grow tall and strong',
        'Dreams can come true'
      ],
      // 단문 - 구두점 포함
      punctuation: [
        'Hello! How are you today?',
        'Wow, what a beautiful day!',
        'Really? I can\'t believe it.',
        'Yes, that\'s absolutely right!',
        'Wait... let me think about it.',
        'No, I don\'t think so.',
        'Great! Let\'s do it together.',
        'Oh, I see what you mean.',
        'Well, maybe tomorrow.',
        'Sure! I\'d love to help.'
      ],
      // 단문 - 숫자 포함
      numbers: [
        'The 21st century is amazing',
        'I wake up at 7 in the morning',
        'There are 365 days in a year',
        'My favorite number is 3',
        'The book has 200 pages',
        '100 percent effort is required',
        'We need 5 more minutes',
        'She is 25 years old',
        'The temperature is 20 degrees',
        'Only 10 people came today'
      ],
      // 단문 - 혼합
      mixed: [
        'It\'s 9 o\'clock already!',
        'Only 50% off? That\'s great!',
        'I\'ll be there in 5 minutes.',
        'The score was 100 to 0!',
        'Year 2024 brings new hope.',
        'She got 95% on the test!',
        'We have 3 options, don\'t we?',
        'It costs $10, but it\'s worth it.',
        'The train leaves at 8:30 AM.',
        '1st place winner gets $1,000!'
      ]
    },
    medium: {
      // 중문 - 일반
      plain: [
        'The quick brown fox jumps over the lazy dog and runs through the forest',
        'Practice makes perfect when you dedicate time and effort to learning new skills',
        'Every morning I wake up early and enjoy a cup of coffee while reading',
        'Children love to play games and explore the world around them with curiosity',
        'Music has the power to touch our hearts and bring people together'
      ],
      // 중문 - 구두점 포함
      punctuation: [
        'Hello! How are you doing today? I hope everything is going well for you.',
        'Wow, that\'s incredible! I can\'t believe you actually did it. Congratulations!',
        'Well... I\'m not sure about that. Can you explain it to me again, please?',
        'Yes, absolutely! That\'s exactly what I was thinking. Great minds think alike!',
        'Oh no! Did you really forget? Don\'t worry, it happens to everyone sometimes.'
      ],
      // 중문 - 숫자 포함
      numbers: [
        'The year 2024 brings new opportunities and 365 days of possibilities ahead',
        'In 24 hours we have 1440 minutes and each one counts toward our goals',
        'The marathon is 26 miles long and requires months of training to complete',
        'Our class has 30 students and 5 teachers working together every day',
        'The recipe needs 2 cups flour 3 eggs and 1 cup sugar to make the cake'
      ],
      // 중문 - 혼합  
      mixed: [
        'It\'s January 1st, 2024! Time to make those 365 days count, don\'t you think?',
        'The test results show 95% accuracy! That\'s amazing progress in just 3 months.',
        'We have 2 options: pay $100 now or $150 later. What do you prefer?',
        'At 9 AM sharp, 200 people gathered for the event. It was truly spectacular!',
        'Only 10% left? Don\'t worry, we still have 48 hours to complete the project!'
      ]
    },
    long: {
      // 장문 - 일반
      plain: [
        'Learning a new language is like opening a door to a completely different world where you can meet new people understand different cultures and expand your horizons in ways you never imagined possible',
        'The art of reading allows us to travel through time and space without leaving our comfortable chair as we explore distant lands meet fascinating characters and learn valuable life lessons from the wisdom of others'
      ],
      // 장문 - 구두점 포함
      punctuation: [
        'Wow! Learning to type faster is such an amazing skill, isn\'t it? You can express your thoughts more quickly, communicate more effectively, and... well, just feel more confident when using a computer!',
        '"Practice makes perfect," they say. But I believe it\'s more than that! It\'s about dedication, patience, and the willingness to keep going even when things get tough. Don\'t you agree?'
      ],
      // 장문 - 숫자 포함
      numbers: [
        'In the 21st century we live in a world where technology advances at incredible speed with over 7 billion people connected through the internet sharing information across 24 time zones every single day',
        'A typical day has 1440 minutes and if you spend just 30 minutes practicing typing every day for 365 days you will have invested over 180 hours in developing this valuable skill'
      ],
      // 장문 - 혼합
      mixed: [
        'Welcome to 2024! This year brings 365 new opportunities, doesn\'t it? With 12 months ahead of us, we have countless chances to grow, learn, and achieve our dreams. Let\'s make every single day count!',
        'Did you know that in just 100 days of practice, you can improve your typing speed by 50% or more? It\'s true! With dedication and the right approach, you\'ll be typing at 60+ WPM in no time. Isn\'t that exciting?'
      ]
    }
  },
  
  // 레거시 호환용 (제거 예정)
  shortSentences: [
    'The cat is sleeping.',
    'Birds fly in the sky.',
    'Water flows down the river.'
  ],
  mediumSentences: [
    'Practice makes perfect when learning to type faster.'
  ],
  longSentences: [
    'Learning a new language is like opening a door to a completely different world.'
  ]
}