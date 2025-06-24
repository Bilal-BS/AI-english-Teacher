import { Lesson } from '../types';

// Comprehensive English learning lessons for beginner to intermediate levels
export const enhancedLessons: Lesson[] = [
  // BEGINNER LEVEL - Speaking & Pronunciation
  {
    id: '1',
    title: 'Basic Greetings & Introductions',
    category: 'conversation',
    difficulty: 'beginner',
    description: 'Learn essential greetings and how to introduce yourself confidently',
    duration: 15,
    completed: false,
    xpReward: 50,
    content: {
      type: 'conversation',
      exercises: [
        {
          id: '1a',
          type: 'speak',
          instruction: 'Practice saying this greeting with clear pronunciation',
          targetText: 'Hello, my name is Sarah. Nice to meet you!',
          audioUrl: '/audio/greeting1.mp3',
          completed: false
        },
        {
          id: '1b',
          type: 'repeat',
          instruction: 'Listen and repeat this introduction',
          targetText: 'I am from New York, and I work as a teacher.',
          audioUrl: '/audio/introduction1.mp3',
          completed: false
        },
        {
          id: '1c',
          type: 'conversation',
          instruction: 'Respond to this question naturally',
          targetText: 'What do you do for work?',
          expectedResponse: 'I work as a teacher',
          completed: false
        }
      ]
    }
  },
  {
    id: '2',
    title: 'Essential Vowel Sounds',
    category: 'pronunciation',
    difficulty: 'beginner',
    description: 'Master the 5 basic vowel sounds: A, E, I, O, U',
    duration: 20,
    completed: false,
    xpReward: 60,
    content: {
      type: 'pronunciation',
      exercises: [
        {
          id: '2a',
          type: 'speak',
          instruction: 'Practice the /æ/ sound (short A)',
          targetText: 'Cat, bat, hat, mat, sat, fat',
          audioUrl: '/audio/vowel-short-a.mp3',
          completed: false
        },
        {
          id: '2b',
          type: 'speak',
          instruction: 'Practice the /ɛ/ sound (short E)',
          targetText: 'Bed, red, head, bread, said',
          audioUrl: '/audio/vowel-short-e.mp3',
          completed: false
        },
        {
          id: '2c',
          type: 'speak',
          instruction: 'Practice the /ɪ/ sound (short I)',
          targetText: 'Bit, sit, hit, fit, kit, pit',
          audioUrl: '/audio/vowel-short-i.mp3',
          completed: false
        }
      ]
    }
  },
  {
    id: '3',
    title: 'Numbers & Basic Counting',
    category: 'vocabulary',
    difficulty: 'beginner',
    description: 'Learn numbers 1-100 and basic counting expressions',
    duration: 15,
    completed: false,
    xpReward: 40,
    content: {
      type: 'vocabulary',
      exercises: [
        {
          id: '3a',
          type: 'speak',
          instruction: 'Count from 1 to 10 clearly',
          targetText: 'One, two, three, four, five, six, seven, eight, nine, ten',
          audioUrl: '/audio/numbers-1-10.mp3',
          completed: false
        },
        {
          id: '3b',
          type: 'speak',
          instruction: 'Practice saying these larger numbers',
          targetText: 'Twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred',
          audioUrl: '/audio/numbers-tens.mp3',
          completed: false
        }
      ]
    }
  },
  {
    id: '4',
    title: 'Daily Routine Vocabulary',
    category: 'vocabulary',
    difficulty: 'beginner',
    description: 'Learn words to describe your daily activities',
    duration: 18,
    completed: false,
    xpReward: 55,
    content: {
      type: 'vocabulary',
      exercises: [
        {
          id: '4a',
          type: 'speak',
          instruction: 'Practice these morning routine words',
          targetText: 'Wake up, brush teeth, take a shower, eat breakfast, go to work',
          audioUrl: '/audio/morning-routine.mp3',
          completed: false
        },
        {
          id: '4b',
          type: 'conversation',
          instruction: 'Describe your morning routine',
          targetText: 'What do you do in the morning?',
          expectedResponse: 'I wake up at 7 AM and brush my teeth',
          completed: false
        }
      ]
    }
  },
  {
    id: '5',
    title: 'Simple Present Tense',
    category: 'grammar',
    difficulty: 'beginner',
    description: 'Learn to use simple present tense correctly',
    duration: 25,
    completed: false,
    xpReward: 70,
    content: {
      type: 'grammar',
      exercises: [
        {
          id: '5a',
          type: 'speak',
          instruction: 'Practice simple present with "I"',
          targetText: 'I work every day. I like coffee. I speak English.',
          audioUrl: '/audio/present-i.mp3',
          completed: false
        },
        {
          id: '5b',
          type: 'speak',
          instruction: 'Practice simple present with "he/she"',
          targetText: 'She works in an office. He likes pizza. She speaks French.',
          audioUrl: '/audio/present-third.mp3',
          completed: false
        }
      ]
    }
  },
  
  // BEGINNER-INTERMEDIATE LEVEL
  {
    id: '6',
    title: 'Asking for Directions',
    category: 'conversation',
    difficulty: 'beginner',
    description: 'Learn how to ask for and give simple directions',
    duration: 20,
    completed: false,
    xpReward: 65,
    content: {
      type: 'conversation',
      exercises: [
        {
          id: '6a',
          type: 'speak',
          instruction: 'Practice asking for directions',
          targetText: 'Excuse me, where is the bank? How do I get to the hospital?',
          audioUrl: '/audio/ask-directions.mp3',
          completed: false
        },
        {
          id: '6b',
          type: 'conversation',
          instruction: 'Practice giving directions',
          targetText: 'Go straight, turn left, turn right, its on your right',
          expectedResponse: 'Go straight and turn left',
          completed: false
        }
      ]
    }
  },
  {
    id: '7',
    title: 'Food & Restaurant English',
    category: 'conversation',
    difficulty: 'beginner',
    description: 'Essential vocabulary and phrases for eating out',
    duration: 22,
    completed: false,
    xpReward: 60,
    content: {
      type: 'conversation',
      exercises: [
        {
          id: '7a',
          type: 'speak',
          instruction: 'Practice ordering food',
          targetText: 'I would like a hamburger and french fries, please.',
          audioUrl: '/audio/order-food.mp3',
          completed: false
        },
        {
          id: '7b',
          type: 'conversation',
          instruction: 'Practice restaurant conversation',
          targetText: 'Are you ready to order?',
          expectedResponse: 'Yes, I would like the chicken sandwich',
          completed: false
        }
      ]
    }
  },
  {
    id: '8',
    title: 'Past Tense Regular Verbs',
    category: 'grammar',
    difficulty: 'beginner',
    description: 'Learn past tense with regular verbs ending in -ed',
    duration: 25,
    completed: false,
    xpReward: 75,
    content: {
      type: 'grammar',
      exercises: [
        {
          id: '8a',
          type: 'speak',
          instruction: 'Practice past tense regular verbs',
          targetText: 'I worked yesterday. She played tennis. We watched a movie.',
          audioUrl: '/audio/past-regular.mp3',
          completed: false
        },
        {
          id: '8b',
          type: 'conversation',
          instruction: 'Talk about yesterday',
          targetText: 'What did you do yesterday?',
          expectedResponse: 'I worked and watched TV',
          completed: false
        }
      ]
    }
  },

  // INTERMEDIATE LEVEL
  {
    id: '9',
    title: 'Complex Consonant Clusters',
    category: 'pronunciation',
    difficulty: 'intermediate',
    description: 'Master difficult consonant combinations like /str/, /spr/, /thr/',
    duration: 30,
    completed: false,
    xpReward: 85,
    content: {
      type: 'pronunciation',
      exercises: [
        {
          id: '9a',
          type: 'speak',
          instruction: 'Practice /str/ sound',
          targetText: 'Strong, street, straight, stream, strange, stripe',
          audioUrl: '/audio/consonant-str.mp3',
          completed: false
        },
        {
          id: '9b',
          type: 'speak',
          instruction: 'Practice /thr/ sound',
          targetText: 'Three, through, throw, thread, throat, thick',
          audioUrl: '/audio/consonant-thr.mp3',
          completed: false
        },
        {
          id: '9c',
          type: 'speak',
          instruction: 'Practice difficult word combinations',
          targetText: 'The strong stream flows through three thick trees',
          audioUrl: '/audio/consonant-complex.mp3',
          completed: false
        }
      ]
    }
  },
  {
    id: '10',
    title: 'Business Email Writing',
    category: 'writing',
    difficulty: 'intermediate',
    description: 'Learn to write professional emails in English',
    duration: 35,
    completed: false,
    xpReward: 90,
    content: {
      type: 'writing',
      exercises: [
        {
          id: '10a',
          type: 'writing',
          instruction: 'Write a professional email greeting',
          targetText: 'Dear Mr. Johnson, I hope this email finds you well.',
          completed: false
        },
        {
          id: '10b',
          type: 'writing',
          instruction: 'Write a business email closing',
          targetText: 'Please let me know if you have any questions. Best regards, Sarah',
          completed: false
        }
      ]
    }
  },
  {
    id: '11',
    title: 'Present Perfect Tense',
    category: 'grammar',
    difficulty: 'intermediate',
    description: 'Master present perfect for experiences and recent actions',
    duration: 30,
    completed: false,
    xpReward: 80,
    content: {
      type: 'grammar',
      exercises: [
        {
          id: '11a',
          type: 'speak',
          instruction: 'Practice present perfect with experiences',
          targetText: 'I have been to Paris. She has eaten sushi. We have seen that movie.',
          audioUrl: '/audio/present-perfect.mp3',
          completed: false
        },
        {
          id: '11b',
          type: 'conversation',
          instruction: 'Talk about experiences',
          targetText: 'Have you ever been to Japan?',
          expectedResponse: 'Yes, I have been there twice',
          completed: false
        }
      ]
    }
  },
  {
    id: '12',
    title: 'News Article Comprehension',
    category: 'reading',
    difficulty: 'intermediate',
    description: 'Improve reading skills with current news articles',
    duration: 25,
    completed: false,
    xpReward: 70,
    content: {
      type: 'reading',
      exercises: [
        {
          id: '12a',
          type: 'reading',
          instruction: 'Read this news article about technology',
          targetText: 'New Study Shows Social Media Usage Among Teenagers Has Increased by 40% This Year',
          questions: [
            'What percentage did social media usage increase?',
            'Who was studied in this research?'
          ],
          completed: false
        }
      ]
    }
  },
  {
    id: '13',
    title: 'Expressing Opinions & Agreements',
    category: 'conversation',
    difficulty: 'intermediate',
    description: 'Learn to express your opinions and agree/disagree politely',
    duration: 28,
    completed: false,
    xpReward: 85,
    content: {
      type: 'conversation',
      exercises: [
        {
          id: '13a',
          type: 'speak',
          instruction: 'Practice expressing opinions',
          targetText: 'In my opinion, I think that, I believe, From my perspective',
          audioUrl: '/audio/opinions.mp3',
          completed: false
        },
        {
          id: '13b',
          type: 'conversation',
          instruction: 'Practice agreeing and disagreeing',
          targetText: 'Do you think remote work is better?',
          expectedResponse: 'I think it has both advantages and disadvantages',
          completed: false
        }
      ]
    }
  },
  {
    id: '14',
    title: 'Conditional Sentences (First Conditional)',
    category: 'grammar',
    difficulty: 'intermediate',
    description: 'Learn to express possibilities with if-clauses',
    duration: 32,
    completed: false,
    xpReward: 88,
    content: {
      type: 'grammar',
      exercises: [
        {
          id: '14a',
          type: 'speak',
          instruction: 'Practice first conditional',
          targetText: 'If it rains, I will stay home. If you study hard, you will pass the test.',
          audioUrl: '/audio/first-conditional.mp3',
          completed: false
        },
        {
          id: '14b',
          type: 'conversation',
          instruction: 'Use conditional in conversation',
          targetText: 'What will you do if you get the job?',
          expectedResponse: 'If I get the job, I will move to New York',
          completed: false
        }
      ]
    }
  },
  {
    id: '15',
    title: 'Advanced Listening: Podcasts',
    category: 'listening',
    difficulty: 'intermediate',
    description: 'Practice listening to native speakers in podcast format',
    duration: 35,
    completed: false,
    xpReward: 95,
    content: {
      type: 'listening',
      exercises: [
        {
          id: '15a',
          type: 'listening',
          instruction: 'Listen to this podcast excerpt about climate change',
          audioUrl: '/audio/podcast-climate.mp3',
          questions: [
            'What is the main topic discussed?',
            'What solution was mentioned?',
            'Who was the expert interviewed?'
          ],
          completed: false
        }
      ]
    }
  },

  // INTERMEDIATE-ADVANCED TRANSITION
  {
    id: '16',
    title: 'Phrasal Verbs in Context',
    category: 'vocabulary',
    difficulty: 'intermediate',
    description: 'Learn common phrasal verbs and how to use them naturally',
    duration: 30,
    completed: false,
    xpReward: 80,
    content: {
      type: 'vocabulary',
      exercises: [
        {
          id: '16a',
          type: 'speak',
          instruction: 'Practice common phrasal verbs',
          targetText: 'Turn on the light. Turn off the TV. Look up the word. Give up smoking.',
          audioUrl: '/audio/phrasal-verbs.mp3',
          completed: false
        },
        {
          id: '16b',
          type: 'conversation',
          instruction: 'Use phrasal verbs in context',
          targetText: 'Can you help me figure this out?',
          expectedResponse: 'Sure, I will look into it',
          completed: false
        }
      ]
    }
  },
  {
    id: '17',
    title: 'Job Interview English',
    category: 'conversation',
    difficulty: 'intermediate',
    description: 'Essential phrases and vocabulary for job interviews',
    duration: 40,
    completed: false,
    xpReward: 100,
    content: {
      type: 'conversation',
      exercises: [
        {
          id: '17a',
          type: 'speak',
          instruction: 'Practice common interview questions',
          targetText: 'Tell me about yourself. What are your strengths? Why do you want this job?',
          audioUrl: '/audio/interview-questions.mp3',
          completed: false
        },
        {
          id: '17b',
          type: 'conversation',
          instruction: 'Practice interview responses',
          targetText: 'What is your greatest weakness?',
          expectedResponse: 'I sometimes work too hard, but I am learning to balance work and life',
          completed: false
        }
      ]
    }
  },
  {
    id: '18',
    title: 'Academic Writing: Essays',
    category: 'writing',
    difficulty: 'intermediate',
    description: 'Learn to write structured academic essays',
    duration: 45,
    completed: false,
    xpReward: 110,
    content: {
      type: 'writing',
      exercises: [
        {
          id: '18a',
          type: 'writing',
          instruction: 'Write a strong thesis statement',
          targetText: 'Social media has both positive and negative effects on society, but its benefits outweigh the drawbacks when used responsibly.',
          completed: false
        },
        {
          id: '18b',
          type: 'writing',
          instruction: 'Write supporting paragraphs with examples',
          targetText: 'Write a paragraph supporting your thesis with specific examples',
          completed: false
        }
      ]
    }
  },
  {
    id: '19',
    title: 'British vs American English',
    category: 'pronunciation',
    difficulty: 'intermediate',
    description: 'Understand differences between British and American pronunciation',
    duration: 25,
    completed: false,
    xpReward: 75,
    content: {
      type: 'pronunciation',
      exercises: [
        {
          id: '19a',
          type: 'speak',
          instruction: 'Practice American pronunciation',
          targetText: 'Water, better, letter, computer, center, color',
          audioUrl: '/audio/american-accent.mp3',
          completed: false
        },
        {
          id: '19b',
          type: 'speak',
          instruction: 'Practice British pronunciation',
          targetText: 'Water, better, letter, computer, centre, colour',
          audioUrl: '/audio/british-accent.mp3',
          completed: false
        }
      ]
    }
  },
  {
    id: '20',
    title: 'Describing Complex Ideas',
    category: 'conversation',
    difficulty: 'intermediate',
    description: 'Learn to explain complex concepts clearly and logically',
    duration: 35,
    completed: false,
    xpReward: 90,
    content: {
      type: 'conversation',
      exercises: [
        {
          id: '20a',
          type: 'speak',
          instruction: 'Practice explaining cause and effect',
          targetText: 'Due to climate change, ice caps are melting, which results in rising sea levels.',
          audioUrl: '/audio/cause-effect.mp3',
          completed: false
        },
        {
          id: '20b',
          type: 'conversation',
          instruction: 'Explain a complex process',
          targetText: 'Can you explain how online banking works?',
          expectedResponse: 'Online banking allows you to access your account through the internet',
          completed: false
        }
      ]
    }
  }
];