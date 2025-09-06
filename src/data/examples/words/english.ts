// 영어 단어 예제 Pool
export const englishWordPools = {
  // Basic everyday words
  basic: [
    "family", "friend", "love", "happy", "health", "peace", "hope", "dream", "future", "time",
    "home", "school", "office", "hospital", "bank", "market", "park", "library", "cinema", "cafe",
    "food", "water", "coffee", "tea", "bread", "fruit", "vegetable", "meat", "fish", "milk",
    "book", "computer", "phone", "car", "subway", "bus", "plane", "train", "bicycle", "motorcycle"
  ],

  // Nature and seasons
  nature: [
    "spring", "summer", "autumn", "winter", "sunshine", "wind", "rain", "snow", "cloud", "sky",
    "mountain", "ocean", "river", "lake", "forest", "tree", "flower", "grass", "leaf", "branch",
    "bird", "butterfly", "bee", "ant", "fish", "whale", "lion", "tiger", "bear", "rabbit",
    "sun", "moon", "star", "earth", "space", "planet", "galaxy", "asteroid", "comet", "light"
  ],

  // Emotions and states
  emotions: [
    "joy", "sadness", "anger", "fear", "surprise", "disgust", "love", "hate", "jealousy", "envy",
    "relief", "worry", "tension", "comfort", "stress", "fatigue", "energy", "depression", "loneliness", "nostalgia",
    "satisfaction", "complaint", "gratitude", "sorry", "apologize", "congratulation", "support", "encouragement", "comfort", "empathy"
  ],

  // Academic and knowledge
  academic: [
    "science", "mathematics", "history", "geography", "literature", "art", "philosophy", "psychology", "sociology", "economics",
    "physics", "chemistry", "biology", "geology", "astronomy", "medicine", "engineering", "computer", "artificial", "intelligence",
    "research", "experiment", "theory", "hypothesis", "proof", "discovery", "invention", "creation", "innovation", "development"
  ],

  // Professions and society
  society: [
    "doctor", "nurse", "teacher", "professor", "student", "police", "firefighter", "soldier", "judge", "lawyer",
    "chef", "designer", "artist", "musician", "writer", "journalist", "broadcaster", "athlete", "actor", "singer",
    "president", "manager", "employee", "colleague", "customer", "citizen", "people", "government", "mayor", "senator"
  ],

  // Technology and modern life
  technology: [
    "internet", "website", "application", "software", "hardware", "data", "algorithm", "programming", "coding", "hacking",
    "smartphone", "tablet", "laptop", "desktop", "server", "cloud", "database", "machine", "learning", "blockchain",
    "social", "media", "youtube", "instagram", "facebook", "twitter", "telegram", "zoom", "netflix", "spotify"
  ],

  // Culture and arts
  culture: [
    "music", "painting", "sculpture", "theater", "movie", "drama", "novel", "poetry", "comic", "animation",
    "classical", "pop", "jazz", "rock", "hip", "hop", "ballad", "folk", "opera", "musical",
    "museum", "gallery", "concert", "exhibition", "festival", "event", "performance", "stage", "audience", "viewer"
  ],

  // Travel and places
  travel: [
    "travel", "tourism", "vacation", "destination", "attraction", "historic", "heritage", "monument", "national", "beach",
    "london", "paris", "tokyo", "seoul", "newyork", "sydney", "rome", "barcelona", "amsterdam", "singapore",
    "hotel", "hostel", "guesthouse", "camping", "resort", "airline", "train", "bus", "rental", "cruise"
  ],

  // Advanced vocabulary
  advanced: [
    "phenomenon", "consequence", "significance", "fundamental", "comprehensive", "substantial", "innovative", "revolutionary", "extraordinary", "magnificent",
    "sophisticated", "contemporary", "traditional", "authentic", "genuine", "artificial", "synthetic", "automatic", "mechanical", "electrical",
    "perspective", "opportunity", "challenge", "obstacle", "achievement", "accomplishment", "contribution", "collaboration", "cooperation", "competition"
  ]
};

// 전체 영어 단어 배열 (랜덤 선택용)
export const allEnglishWords = [
  ...englishWordPools.basic,
  ...englishWordPools.nature,
  ...englishWordPools.emotions,
  ...englishWordPools.academic,
  ...englishWordPools.society,
  ...englishWordPools.technology,
  ...englishWordPools.culture,
  ...englishWordPools.travel,
  ...englishWordPools.advanced
];