export interface LevelTrack {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  totalDays: number;
  dailyTimeMinutes: number;
  targetSkills: string[];
  weeklyGoals: string[];
  days: DayLesson[];
}

export interface DayLesson {
  day: number;
  title: string;
  duration: number;
  skills: ('speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar')[];
  objectives: string[];
  activities: LessonActivity[];
  vocabulary: VocabularyItem[];
  grammar: GrammarTopic;
  culturalNote?: string;
  dailyChallenge: string;
}

export interface LessonActivity {
  id: string;
  type: 'speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar' | 'quiz';
  title: string;
  instruction: string;
  content: string;
  audioUrl?: string;
  expectedResponse?: string;
  questions?: QuizQuestion[];
  timeEstimate: number;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface GrammarTopic {
  title: string;
  explanation: string;
  examples: string[];
  rules: string[];
  practice: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'ordering';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

// Track A: Zero English (Complete Beginner)
export const trackAZeroEnglish: LevelTrack = {
  id: 'track-a',
  name: 'Track A: Zero English Foundation',
  level: 'beginner',
  description: 'Perfect for complete beginners. Start with alphabet, basic greetings, and essential survival English.',
  totalDays: 30,
  dailyTimeMinutes: 15,
  targetSkills: ['Basic alphabet', 'Numbers 1-100', 'Essential greetings', 'Survival phrases', 'Basic pronunciation'],
  weeklyGoals: [
    'Week 1: Master alphabet and numbers, basic greetings',
    'Week 2: Learn family, colors, days of week',
    'Week 3: Basic questions and introductions', 
    'Week 4: Simple conversations and daily routines'
  ],
  days: [
    {
      day: 1,
      title: 'English Alphabet & Hello World',
      duration: 15,
      skills: ['speaking', 'listening'],
      objectives: ['Learn A-Z pronunciation', 'Master basic greetings', 'Introduce yourself'],
      activities: [
        {
          id: 'a1-1',
          type: 'listening',
          title: 'Alphabet Song',
          instruction: 'Listen and repeat each letter',
          content: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
          audioUrl: '/audio/alphabet.mp3',
          timeEstimate: 5
        },
        {
          id: 'a1-2',
          type: 'speaking',
          title: 'Say Hello',
          instruction: 'Practice these greetings',
          content: 'Hello! Hi! Good morning! Good afternoon! Good evening!',
          expectedResponse: 'Hello! My name is...',
          timeEstimate: 5
        },
        {
          id: 'a1-3',
          type: 'vocabulary',
          title: 'First Words',
          instruction: 'Learn these essential words',
          content: 'Hello, Goodbye, Please, Thank you, Yes, No',
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'Hello', definition: 'A greeting', pronunciation: 'heh-LOH', example: 'Hello! How are you?', difficulty: 'easy', category: 'greetings' },
        { word: 'Goodbye', definition: 'A farewell', pronunciation: 'good-BYE', example: 'Goodbye! See you tomorrow!', difficulty: 'easy', category: 'greetings' },
        { word: 'Please', definition: 'Polite request word', pronunciation: 'pleez', example: 'Please help me.', difficulty: 'easy', category: 'politeness' },
        { word: 'Thank you', definition: 'Expression of gratitude', pronunciation: 'thank yoo', example: 'Thank you very much!', difficulty: 'easy', category: 'politeness' }
      ],
      grammar: {
        title: 'Basic Sentence: Subject + Verb',
        explanation: 'Every English sentence needs a subject (who) and verb (action)',
        examples: ['I am happy.', 'You are nice.', 'We speak English.'],
        rules: ['Subject comes first', 'Verb comes after subject'],
        practice: ['I ___ (am/is) a student.', 'You ___ (are/is) my friend.']
      },
      culturalNote: 'In English-speaking countries, people often say "Hello" or "Hi" when they meet. A smile goes a long way!',
      dailyChallenge: 'Introduce yourself to 3 people today using: "Hello! My name is [your name]. Nice to meet you!"'
    },
    {
      day: 2,
      title: 'Numbers & Basic Questions',
      duration: 15,
      skills: ['speaking', 'listening', 'vocabulary'],
      objectives: ['Count 1-20', 'Ask "What is your name?"', 'Give your age'],
      activities: [
        {
          id: 'a2-1',
          type: 'listening',
          title: 'Count to 20',
          instruction: 'Listen and repeat each number',
          content: 'One, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty',
          timeEstimate: 5
        },
        {
          id: 'a2-2',
          type: 'speaking',
          title: 'Ask Questions',
          instruction: 'Practice asking these questions',
          content: 'What is your name? How old are you? Where are you from?',
          expectedResponse: 'My name is... I am ... years old. I am from...',
          timeEstimate: 5
        },
        {
          id: 'a2-3',
          type: 'quiz',
          title: 'Number Recognition',
          instruction: 'Match the number with the word',
          content: 'Number matching quiz',
          questions: [
            { id: 'q1', question: 'What number is "five"?', type: 'multiple-choice', options: ['3', '5', '7', '9'], correctAnswer: 1, explanation: 'Five = 5' },
            { id: 'q2', question: 'How do you say "10"?', type: 'multiple-choice', options: ['nine', 'ten', 'eleven', 'twelve'], correctAnswer: 1, explanation: 'Ten = 10' }
          ],
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'One', definition: 'Number 1', pronunciation: 'wun', example: 'I have one book.', difficulty: 'easy', category: 'numbers' },
        { word: 'Two', definition: 'Number 2', pronunciation: 'too', example: 'Two hands, two eyes.', difficulty: 'easy', category: 'numbers' },
        { word: 'Name', definition: 'What people call you', pronunciation: 'naym', example: 'My name is John.', difficulty: 'easy', category: 'personal' },
        { word: 'Age', definition: 'How old you are', pronunciation: 'ayj', example: 'I am 25 years old.', difficulty: 'easy', category: 'personal' }
      ],
      grammar: {
        title: 'Question Words: What, How, Where',
        explanation: 'Use question words to ask for information',
        examples: ['What is your name?', 'How old are you?', 'Where are you from?'],
        rules: ['Question word comes first', 'Use "is/are" after question words'],
        practice: ['___ is your name? (What/How)', '___ are you from? (What/Where)']
      },
      dailyChallenge: 'Ask someone "What is your name?" and "How old are you?" Practice counting from 1 to 20 out loud.'
    },
    {
      day: 3,
      title: 'Family & Colors',
      duration: 15,
      skills: ['vocabulary', 'speaking', 'listening'],
      objectives: ['Learn family members', 'Master basic colors', 'Describe people'],
      activities: [
        {
          id: 'a3-1',
          type: 'vocabulary',
          title: 'Family Members',
          instruction: 'Learn these family words',
          content: 'mother, father, sister, brother, grandmother, grandfather, son, daughter',
          timeEstimate: 5
        },
        {
          id: 'a3-2',
          type: 'vocabulary',
          title: 'Colors',
          instruction: 'Learn basic colors',
          content: 'red, blue, green, yellow, black, white, brown, pink, orange, purple',
          timeEstimate: 5
        },
        {
          id: 'a3-3',
          type: 'speaking',
          title: 'Describe Family',
          instruction: 'Describe your family members',
          content: 'My mother has brown hair. My father is tall. My sister likes blue.',
          expectedResponse: 'Describe your own family',
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'mother', definition: 'female parent', pronunciation: 'MUHTH-er', example: 'My mother is kind.', difficulty: 'easy', category: 'family' },
        { word: 'father', definition: 'male parent', pronunciation: 'FAH-ther', example: 'My father works hard.', difficulty: 'easy', category: 'family' },
        { word: 'red', definition: 'color like blood', pronunciation: 'red', example: 'The apple is red.', difficulty: 'easy', category: 'colors' },
        { word: 'blue', definition: 'color like sky', pronunciation: 'bloo', example: 'The sky is blue.', difficulty: 'easy', category: 'colors' }
      ],
      grammar: {
        title: 'Adjectives: Describing People and Things',
        explanation: 'Adjectives describe nouns (people, places, things)',
        examples: ['My mother is tall.', 'The car is red.', 'English is fun.'],
        rules: ['Adjective comes before noun or after "is/are"'],
        practice: ['My sister is ___ (tall/short).', 'The book is ___ (red/blue).']
      },
      culturalNote: 'In English-speaking countries, people often talk about family. It\'s polite to ask "How is your family?"',
      dailyChallenge: 'Describe 3 family members using colors and adjectives. Example: "My mother has black hair and brown eyes."'
    },
    {
      day: 4,
      title: 'Days of the Week & Daily Schedule',
      duration: 15,
      skills: ['vocabulary', 'speaking', 'grammar'],
      objectives: ['Learn days of the week', 'Talk about schedules', 'Use time expressions'],
      activities: [
        {
          id: 'a4-1',
          type: 'vocabulary',
          title: 'Days of the Week',
          instruction: 'Learn all seven days',
          content: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
          timeEstimate: 5
        },
        {
          id: 'a4-2',
          type: 'speaking',
          title: 'Daily Schedule',
          instruction: 'Talk about your weekly schedule',
          content: 'On Monday, I work. On Saturday, I rest. On Sunday, I visit family.',
          expectedResponse: 'Tell me about your week',
          timeEstimate: 5
        },
        {
          id: 'a4-3',
          type: 'quiz',
          title: 'Day Recognition',
          instruction: 'Match activities with days',
          content: 'Weekly schedule quiz',
          questions: [
            { id: 'q1', question: 'What day comes after Monday?', type: 'multiple-choice', options: ['Sunday', 'Tuesday', 'Wednesday', 'Friday'], correctAnswer: 1, explanation: 'Tuesday comes after Monday' },
            { id: 'q2', question: 'What are weekend days?', type: 'multiple-choice', options: ['Monday-Friday', 'Saturday-Sunday', 'Wednesday-Thursday', 'Friday-Saturday'], correctAnswer: 1, explanation: 'Saturday and Sunday are weekend days' }
          ],
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'Monday', definition: 'first day of work week', pronunciation: 'MUHN-day', example: 'I start work on Monday.', difficulty: 'easy', category: 'days' },
        { word: 'weekend', definition: 'Saturday and Sunday', pronunciation: 'WEEK-end', example: 'I relax on the weekend.', difficulty: 'easy', category: 'time' },
        { word: 'schedule', definition: 'plan of activities', pronunciation: 'SKED-yool', example: 'My schedule is busy.', difficulty: 'medium', category: 'time' }
      ],
      grammar: {
        title: 'Prepositions of Time: On, At, In',
        explanation: 'Use "on" with days, "at" with times, "in" with months/years',
        examples: ['On Monday', 'At 3 o\'clock', 'In January', 'In 2023'],
        rules: ['On + days/dates', 'At + specific times', 'In + months/years/seasons'],
        practice: ['I work ___ Monday. (on/at)', 'The meeting is ___ 2 PM. (on/at)']
      },
      culturalNote: 'In many English-speaking countries, the work week is Monday to Friday. "TGIF" means "Thank God It\'s Friday!"',
      dailyChallenge: 'Write your weekly schedule using days of the week. Share it with someone in English.'
    },
    {
      day: 5,
      title: 'Simple Questions & Answers',
      duration: 15,
      skills: ['speaking', 'listening', 'grammar'],
      objectives: ['Ask yes/no questions', 'Give short answers', 'Use question words'],
      activities: [
        {
          id: 'a5-1',
          type: 'speaking',
          title: 'Yes/No Questions',
          instruction: 'Practice asking and answering',
          content: 'Are you a student? Yes, I am. Do you like coffee? No, I don\'t.',
          expectedResponse: 'Answer questions about yourself',
          timeEstimate: 5
        },
        {
          id: 'a5-2',
          type: 'listening',
          title: 'Question Words',
          instruction: 'Listen to different question types',
          content: 'Who is your friend? What do you like? Where do you live? When do you work?',
          audioUrl: '/audio/question-words.mp3',
          timeEstimate: 5
        },
        {
          id: 'a5-3',
          type: 'speaking',
          title: 'Ask Questions',
          instruction: 'Practice asking questions about others',
          content: 'Ask someone about their name, age, family, work, and hobbies',
          expectedResponse: 'Have a short question-answer conversation',
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'question', definition: 'asking for information', pronunciation: 'KWES-chun', example: 'I have a question for you.', difficulty: 'easy', category: 'communication' },
        { word: 'answer', definition: 'response to question', pronunciation: 'AN-ser', example: 'The answer is yes.', difficulty: 'easy', category: 'communication' },
        { word: 'student', definition: 'person who learns', pronunciation: 'STOO-dent', example: 'I am a student.', difficulty: 'easy', category: 'education' }
      ],
      grammar: {
        title: 'Yes/No Questions with "Do" and "Are"',
        explanation: 'Use "Do you...?" for actions and "Are you...?" for states',
        examples: ['Do you work?', 'Are you happy?', 'Do you like pizza?', 'Are you from here?'],
        rules: ['Do + you + verb = action questions', 'Are + you + adjective/noun = state questions'],
        practice: ['___ you like music? (Do/Are)', '___ you a teacher? (Do/Are)']
      },
      culturalNote: 'Small talk is common in English. People often ask "How are you?" as a greeting, not expecting a detailed answer.',
      dailyChallenge: 'Ask 5 different people 5 different questions today. Practice both asking and answering.'
    }
    // Continue with remaining 25 days for Track A...
  ]
};

// Track B: Beginner (Basic English Knowledge)
export const trackBBeginner: LevelTrack = {
  id: 'track-b',
  name: 'Track B: Beginner English Builder',
  level: 'beginner',
  description: 'For those with basic English knowledge. Focus on daily routines, shopping, and simple conversations.',
  totalDays: 30,
  dailyTimeMinutes: 20,
  targetSkills: ['Daily routine vocabulary', 'Shopping conversations', 'Simple past tense', 'Basic directions', 'Phone conversations'],
  weeklyGoals: [
    'Week 1: Daily routines and time expressions',
    'Week 2: Shopping and money conversations',
    'Week 3: Past tense and storytelling',
    'Week 4: Giving directions and making plans'
  ],
  days: [
    {
      day: 1,
      title: 'Daily Routines & Time',
      duration: 20,
      skills: ['speaking', 'vocabulary', 'grammar'],
      objectives: ['Describe daily activities', 'Tell time', 'Use present simple tense'],
      activities: [
        {
          id: 'b1-1',
          type: 'vocabulary',
          title: 'Daily Activities',
          instruction: 'Learn these daily routine words',
          content: 'wake up, brush teeth, take a shower, eat breakfast, go to work, have lunch, come home, watch TV, go to sleep',
          timeEstimate: 7
        },
        {
          id: 'b1-2',
          type: 'speaking',
          title: 'Describe Your Day',
          instruction: 'Tell me about your typical day',
          content: 'I wake up at 7 AM. I brush my teeth and take a shower. I eat breakfast at 8 AM...',
          expectedResponse: 'Describe your own daily routine',
          timeEstimate: 8
        },
        {
          id: 'b1-3',
          type: 'listening',
          title: 'Time Expressions',
          instruction: 'Listen to different ways to tell time',
          content: 'It\'s 9 o\'clock. It\'s half past three. It\'s quarter to five. It\'s twenty minutes after two.',
          audioUrl: '/audio/time-expressions.mp3',
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'wake up', definition: 'stop sleeping', pronunciation: 'wayk uhp', example: 'I wake up at 7 AM every day.', difficulty: 'easy', category: 'daily routine' },
        { word: 'breakfast', definition: 'first meal of the day', pronunciation: 'BREK-fuhst', example: 'I eat breakfast before work.', difficulty: 'easy', category: 'meals' },
        { word: 'shower', definition: 'wash your body with water', pronunciation: 'SHOU-er', example: 'I take a shower every morning.', difficulty: 'easy', category: 'hygiene' }
      ],
      grammar: {
        title: 'Present Simple Tense',
        explanation: 'Use present simple for daily habits and routines',
        examples: ['I work every day.', 'She eats breakfast at 8 AM.', 'We go to school on Monday.'],
        rules: ['Add -s/-es for he/she/it', 'Use base form for I/you/we/they'],
        practice: ['I ___ (work/works) in an office.', 'She ___ (eat/eats) lunch at noon.']
      },
      culturalNote: 'In many English-speaking countries, people eat dinner between 6-8 PM. Breakfast is usually light, lunch is medium, and dinner is the biggest meal.',
      dailyChallenge: 'Write down your daily routine from morning to night. Practice saying it out loud 3 times.'
    },
    {
      day: 2,
      title: 'Shopping & Money Conversations',
      duration: 20,
      skills: ['speaking', 'vocabulary', 'listening'],
      objectives: ['Shop for basic items', 'Handle money conversations', 'Ask for prices'],
      activities: [
        {
          id: 'b2-1',
          type: 'vocabulary',
          title: 'Shopping Words',
          instruction: 'Learn essential shopping vocabulary',
          content: 'store, shop, buy, sell, price, cost, cheap, expensive, receipt, change',
          timeEstimate: 7
        },
        {
          id: 'b2-2',
          type: 'listening',
          title: 'Shopping Dialogue',
          instruction: 'Listen to a shopping conversation',
          content: 'Customer: How much is this shirt? Cashier: It\'s $25. Customer: I\'ll take it.',
          audioUrl: '/audio/shopping-dialogue.mp3',
          timeEstimate: 6
        },
        {
          id: 'b2-3',
          type: 'speaking',
          title: 'Practice Shopping',
          instruction: 'Role-play shopping scenarios',
          content: 'How much is this? Do you have a smaller size? Can I pay by card?',
          expectedResponse: 'Complete shopping conversation',
          timeEstimate: 7
        }
      ],
      vocabulary: [
        { word: 'price', definition: 'cost of something', pronunciation: 'pryss', example: 'What is the price of this book?', difficulty: 'easy', category: 'shopping' },
        { word: 'expensive', definition: 'costs a lot of money', pronunciation: 'ik-SPEN-siv', example: 'This car is very expensive.', difficulty: 'medium', category: 'shopping' },
        { word: 'receipt', definition: 'paper showing what you bought', pronunciation: 'ri-SEET', example: 'Keep your receipt for returns.', difficulty: 'medium', category: 'shopping' }
      ],
      grammar: {
        title: 'How much/How many Questions',
        explanation: 'Use "How much" for uncountable nouns, "How many" for countable nouns',
        examples: ['How much is this shirt?', 'How many apples do you want?', 'How much time do you have?'],
        rules: ['How much + uncountable noun', 'How many + countable noun'],
        practice: ['___ money do you have? (How much/How many)', '___ books did you buy? (How much/How many)']
      },
      culturalNote: 'In most English-speaking countries, prices include tax. Tipping is not expected in retail stores, but common in restaurants.',
      dailyChallenge: 'Go shopping and practice asking "How much is this?" in English. Try to have a complete transaction in English.'
    },
    {
      day: 3,
      title: 'Past Tense & Storytelling',
      duration: 20,
      skills: ['grammar', 'speaking', 'writing'],
      objectives: ['Use simple past tense', 'Tell stories about yesterday', 'Use time expressions'],
      activities: [
        {
          id: 'b3-1',
          type: 'grammar',
          title: 'Past Tense Verbs',
          instruction: 'Learn regular and irregular past forms',
          content: 'worked, played, went, ate, saw, did, was, were, had, said',
          timeEstimate: 8
        },
        {
          id: 'b3-2',
          type: 'speaking',
          title: 'Yesterday Story',
          instruction: 'Tell what you did yesterday',
          content: 'Yesterday, I woke up at 7 AM. I ate breakfast. I went to work. I came home at 6 PM.',
          expectedResponse: 'Tell your own yesterday story',
          timeEstimate: 7
        },
        {
          id: 'b3-3',
          type: 'writing',
          title: 'Write Your Day',
          instruction: 'Write about last weekend',
          content: 'Write 5-7 sentences about what you did last weekend using past tense',
          timeEstimate: 5
        }
      ],
      vocabulary: [
        { word: 'yesterday', definition: 'the day before today', pronunciation: 'YES-ter-day', example: 'Yesterday was Monday.', difficulty: 'easy', category: 'time' },
        { word: 'morning', definition: 'early part of day', pronunciation: 'MOR-ning', example: 'I exercise in the morning.', difficulty: 'easy', category: 'time' },
        { word: 'evening', definition: 'late part of day', pronunciation: 'EEV-ning', example: 'We eat dinner in the evening.', difficulty: 'easy', category: 'time' }
      ],
      grammar: {
        title: 'Simple Past Tense',
        explanation: 'Use past tense for completed actions in the past',
        examples: ['I worked yesterday.', 'She went to school.', 'We ate pizza last night.'],
        rules: ['Regular verbs: add -ed', 'Irregular verbs: special forms (go→went, eat→ate)'],
        practice: ['I ___ (work/worked) yesterday.', 'She ___ (go/went) to the store.']
      },
      culturalNote: 'English speakers love to share stories about their day. "How was your day?" is a very common question.',
      dailyChallenge: 'Tell someone about your day yesterday using past tense. Try to use at least 10 past tense verbs.'
    }
    // Continue with remaining 27 days for Track B...
  ]
};

// Track C: Functional (Practical English)
export const trackCFunctional: LevelTrack = {
  id: 'track-c',
  name: 'Track C: Functional English Mastery',
  level: 'intermediate',
  description: 'For intermediate learners. Master practical situations like ordering food, directions, and phone calls.',
  totalDays: 30,
  dailyTimeMinutes: 25,
  targetSkills: ['Restaurant conversations', 'Phone etiquette', 'Business English basics', 'Travel English', 'Problem solving'],
  weeklyGoals: [
    'Week 1: Restaurant and food ordering mastery',
    'Week 2: Professional phone conversations',
    'Week 3: Travel and navigation skills',
    'Week 4: Business meeting and presentation basics'
  ],
  days: [
    {
      day: 1,
      title: 'Restaurant Conversations & Food Ordering',
      duration: 25,
      skills: ['speaking', 'listening', 'vocabulary'],
      objectives: ['Order food confidently', 'Ask about menu items', 'Handle payment and tips'],
      activities: [
        {
          id: 'c1-1',
          type: 'listening',
          title: 'Restaurant Dialogue',
          instruction: 'Listen to a conversation between customer and waiter',
          content: 'Waiter: Good evening! Welcome to our restaurant. Customer: Thank you. Could I see the menu, please?',
          audioUrl: '/audio/restaurant-conversation.mp3',
          timeEstimate: 8
        },
        {
          id: 'c1-2',
          type: 'speaking',
          title: 'Practice Ordering',
          instruction: 'Role-play ordering food at a restaurant',
          content: 'I\'d like to order... Could I have... What do you recommend? Is this dish spicy?',
          expectedResponse: 'Complete food ordering conversation',
          timeEstimate: 10
        },
        {
          id: 'c1-3',
          type: 'vocabulary',
          title: 'Food & Restaurant Terms',
          instruction: 'Learn essential restaurant vocabulary',
          content: 'appetizer, main course, dessert, beverage, tip, bill, reservation, vegetarian, allergic',
          timeEstimate: 7
        }
      ],
      vocabulary: [
        { word: 'appetizer', definition: 'small dish before main meal', pronunciation: 'AP-i-ty-zer', example: 'I\'ll have the soup as an appetizer.', difficulty: 'medium', category: 'restaurant' },
        { word: 'reservation', definition: 'booking a table in advance', pronunciation: 'rez-er-VAY-shun', example: 'I have a reservation for 7 PM.', difficulty: 'medium', category: 'restaurant' },
        { word: 'vegetarian', definition: 'doesn\'t eat meat', pronunciation: 'vej-i-TAIR-ee-un', example: 'Do you have vegetarian options?', difficulty: 'medium', category: 'food' }
      ],
      grammar: {
        title: 'Polite Requests with "Could" and "Would"',
        explanation: 'Use "could" and "would" to make polite requests',
        examples: ['Could I have the menu?', 'Would you recommend something?', 'Could we get the bill, please?'],
        rules: ['Could + I + verb = polite request', 'Would you + verb = asking for help'],
        practice: ['___ I have some water? (Could/Can)', '___ you help me choose? (Would/Will)']
      },
      culturalNote: 'In restaurants, tipping 15-20% is customary in the US and Canada. In the UK, 10-15% is normal if service charge isn\'t included.',
      dailyChallenge: 'Visit a restaurant or café today and practice ordering in English. If not possible, role-play with family or friends.'
    },
    {
      day: 2,
      title: 'Professional Phone Conversations',
      duration: 25,
      skills: ['speaking', 'listening', 'vocabulary'],
      objectives: ['Handle business calls', 'Take messages', 'Make appointments'],
      activities: [
        {
          id: 'c2-1',
          type: 'listening',
          title: 'Business Call',
          instruction: 'Listen to a professional phone conversation',
          content: 'Receptionist: Good morning, ABC Company. Caller: I\'d like to speak with Mr. Johnson, please.',
          audioUrl: '/audio/business-call.mp3',
          timeEstimate: 8
        },
        {
          id: 'c2-2',
          type: 'vocabulary',
          title: 'Phone Etiquette',
          instruction: 'Learn professional phone vocabulary',
          content: 'hold on, transfer, message, appointment, available, unavailable, extension, voicemail',
          timeEstimate: 8
        },
        {
          id: 'c2-3',
          type: 'speaking',
          title: 'Phone Role-play',
          instruction: 'Practice professional phone conversations',
          content: 'Making appointments, taking messages, transferring calls',
          expectedResponse: 'Complete professional phone conversation',
          timeEstimate: 9
        }
      ],
      vocabulary: [
        { word: 'appointment', definition: 'scheduled meeting', pronunciation: 'uh-POINT-ment', example: 'I have an appointment at 3 PM.', difficulty: 'medium', category: 'business' },
        { word: 'available', definition: 'free, not busy', pronunciation: 'uh-VAY-luh-bul', example: 'Is Mr. Smith available?', difficulty: 'medium', category: 'business' },
        { word: 'extension', definition: 'phone number within company', pronunciation: 'ik-STEN-shun', example: 'His extension is 1234.', difficulty: 'medium', category: 'business' }
      ],
      grammar: {
        title: 'Formal vs Informal Language',
        explanation: 'Use formal language in business situations',
        examples: ['Formal: May I help you?', 'Informal: What\'s up?', 'Formal: I would like to...', 'Informal: I wanna...'],
        rules: ['Use "would like" instead of "want"', 'Use "May I" instead of "Can I"'],
        practice: ['Formal: I ___ like to make an appointment. (would/want)', 'Formal: ___ I speak with the manager? (Can/May)']
      },
      culturalNote: 'Phone etiquette is very important in business. Always identify yourself and speak clearly.',
      dailyChallenge: 'Make a real phone call in English today - call a restaurant for hours, a store for information, or practice with a friend.'
    },
    {
      day: 3,
      title: 'Travel & Navigation Skills',
      duration: 25,
      skills: ['speaking', 'vocabulary', 'listening'],
      objectives: ['Ask for directions', 'Use transportation', 'Handle travel situations'],
      activities: [
        {
          id: 'c3-1',
          type: 'vocabulary',
          title: 'Travel Words',
          instruction: 'Learn essential travel vocabulary',
          content: 'airport, station, ticket, platform, departure, arrival, luggage, passport, security, gate',
          timeEstimate: 8
        },
        {
          id: 'c3-2',
          type: 'listening',
          title: 'Directions Dialogue',
          instruction: 'Listen to someone giving directions',
          content: 'Turn left at the traffic light. Go straight for two blocks. The hotel is on your right.',
          audioUrl: '/audio/directions.mp3',
          timeEstimate: 8
        },
        {
          id: 'c3-3',
          type: 'speaking',
          title: 'Travel Scenarios',
          instruction: 'Practice travel conversations',
          content: 'Excuse me, where is the nearest subway station? How do I get to the airport?',
          expectedResponse: 'Ask for and give directions',
          timeEstimate: 9
        }
      ],
      vocabulary: [
        { word: 'direction', definition: 'way to go somewhere', pronunciation: 'dih-REK-shun', example: 'Can you give me directions?', difficulty: 'medium', category: 'travel' },
        { word: 'straight', definition: 'in a direct line', pronunciation: 'strayt', example: 'Go straight ahead.', difficulty: 'easy', category: 'directions' },
        { word: 'platform', definition: 'train boarding area', pronunciation: 'PLAT-form', example: 'The train leaves from platform 3.', difficulty: 'medium', category: 'travel' }
      ],
      grammar: {
        title: 'Imperative Sentences for Instructions',
        explanation: 'Use imperative form to give directions and instructions',
        examples: ['Turn left.', 'Go straight.', 'Take the bus.', 'Don\'t miss your flight.'],
        rules: ['Use base form of verb', 'No subject needed', 'Add "don\'t" for negative'],
        practice: ['___ left at the corner. (Turn/Turning)', '___ forget your passport. (Don\'t/Not)']
      },
      culturalNote: 'Most people are happy to help with directions. It\'s polite to say "Excuse me" before asking and "Thank you" after.',
      dailyChallenge: 'Practice giving directions to your home or workplace. Try to use landmarks and clear instructions.'
    }
    // Continue with remaining 27 days for Track C...
  ]
};

export const levelBasedTracks: LevelTrack[] = [trackAZeroEnglish, trackBBeginner, trackCFunctional];

export function getTrackByLevel(level: 'beginner' | 'intermediate' | 'advanced'): LevelTrack {
  switch (level) {
    case 'beginner':
      return trackAZeroEnglish;
    case 'intermediate': 
      return trackBBeginner;
    case 'advanced':
      return trackCFunctional;
    default:
      return trackAZeroEnglish;
  }
}

export function getDayLesson(track: LevelTrack, day: number): DayLesson | null {
  return track.days.find(d => d.day === day) || null;
}