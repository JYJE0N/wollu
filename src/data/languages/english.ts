import { LanguageData } from './korean';

export const englishData: LanguageData = {
  name: 'English',
  code: 'en',
  sentences: {
    easy: [
      'Hello. The weather is nice today.',
      'I read books while drinking coffee.',
      'I watched a movie with friends on the weekend.',
      'Korean food is really delicious.',
      'I exercise every morning.'
    ],
    medium: [
      'Learning programming is difficult but an interesting challenge.',
      'Regular exercise and balanced meals are important to maintain healthy lifestyle habits.',
      'The development of artificial intelligence technology is greatly changing our daily lives.',
      'Effective time management is a key element for successful project completion.',
      'A balance between environmental protection and economic growth is necessary for sustainable development.'
    ],
    hard: [
      'The development of quantum computing contains the possibility of completely reorganizing the current encryption system, and this is expected to bring revolutionary changes to the information security field.',
      'As the interdependence of the global economy deepens, the phenomenon of economic crises in one region causing global ripple effects is frequently observed.',
      'Deep learning algorithms that mimic human neural networks have achieved amazing results in pattern recognition and natural language processing, but explainability and ethical issues still remain as challenges.',
      'Despite international efforts to respond to climate change, achieving carbon neutral goals still seems far away due to conflicts of interest between countries and technological limitations.',
      'The decentralized nature of blockchain technology has the potential to transform the paradigm of the financial system, but the absence of regulatory frameworks and scalability issues are obstacles to popularization.'
    ]
  },
  words: {
    common: ['love', 'happiness', 'friend', 'family', 'time', 'mind', 'thought', 'study', 'daily', 'future'],
    tech: ['programming', 'algorithm', 'database', 'network', 'interface', 'framework', 'architecture', 'cloud', 'machine learning', 'blockchain'],
    business: ['strategy', 'marketing', 'analysis', 'investment', 'profit', 'business', 'management', 'innovation', 'leadership', 'partnership']
  }
};