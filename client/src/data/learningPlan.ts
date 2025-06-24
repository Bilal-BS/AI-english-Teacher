export interface DayPlan {
  day: number;
  theme: string;
  lessons: string[];
  goals: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
}

export const thirtyDayPlan: DayPlan[] = [
  // Week 1: Foundation Building with Advanced Pronunciation
  {
    day: 1,
    theme: "Pronunciation Mastery - TH Sounds",
    lessons: ["Advanced TH Sound Practice", "Common TH Words in Context", "Conversation with TH Focus"],
    goals: ["Master /θ/ and /ð/ sounds perfectly", "Distinguish 'think' vs 'sink'", "Natural TH in conversation"],
    difficulty: 'beginner',
    estimatedTime: 45
  },
  {
    day: 2,
    theme: "R vs L Sound Perfection",
    lessons: ["R Sound Mastery", "L Sound Techniques", "R/L Minimal Pairs Challenge"],
    goals: ["Perfect R tongue position", "Clear L pronunciation", "95% accuracy in R/L distinction"],
    difficulty: 'beginner',
    estimatedTime: 50
  },
  {
    day: 3,
    theme: "V vs W Sound Precision",
    lessons: ["V Sound Techniques", "W Sound Practice", "V/W Discrimination Challenge"],
    goals: ["Perfect lip-teeth contact for V", "Round lips properly for W", "100% V/W accuracy"],
    difficulty: 'beginner',
    estimatedTime: 45
  },
  {
    day: 4,
    theme: "Vowel Sound Mastery - Short vs Long",
    lessons: ["Short I vs Long E", "Short U vs Long O", "Advanced Vowel Patterns"],
    goals: ["Distinguish 'bit' vs 'beat'", "Master all 5 vowel pairs", "Natural vowel transitions"],
    difficulty: 'intermediate',
    estimatedTime: 50
  },
  {
    day: 5,
    theme: "Schwa Sound and Stress Patterns",
    lessons: ["The Schwa Mystery", "Word Stress Rules", "Sentence Rhythm Practice"],
    goals: ["Use schwa in unstressed syllables", "Apply stress patterns correctly", "Natural English rhythm"],
    difficulty: 'intermediate',
    estimatedTime: 55
  },
  {
    day: 6,
    theme: "Connected Speech and Linking",
    lessons: ["Linking Words Together", "Reduction Patterns", "Fast Speech Practice"],
    goals: ["Link words naturally", "Use contractions fluently", "Sound like native speaker"],
    difficulty: 'advanced',
    estimatedTime: 60
  },
  {
    day: 7,
    theme: "Week 1 Pronunciation Mastery Test",
    lessons: ["Comprehensive Sound Test", "Real Conversation Challenge", "Error Correction Practice"],
    goals: ["95% pronunciation accuracy", "Fluent natural conversation", "Self-correction ability"],
    difficulty: 'advanced',
    estimatedTime: 65
  },

  // Week 2: Advanced Grammar with Perfect Correction
  {
    day: 8,
    theme: "Perfect Present Tense Mastery",
    lessons: ["Present Simple Perfection", "Present Continuous Precision", "Present Perfect Challenge"],
    goals: ["Zero present tense errors", "Natural tense transitions", "Perfect time expressions"],
    difficulty: 'intermediate',
    estimatedTime: 50
  },
  {
    day: 9,
    theme: "Past Tense Perfection Challenge",
    lessons: ["Regular Past Tense", "Irregular Verb Mastery", "Past Perfect Precision"],
    goals: ["100% irregular verb accuracy", "Perfect past narratives", "Complex time relationships"],
    difficulty: 'intermediate',
    estimatedTime: 55
  },
  {
    day: 10,
    theme: "Future Forms Mastery",
    lessons: ["Will vs Going To", "Future Perfect", "Future Continuous"],
    goals: ["Choose correct future form", "Express future plans precisely", "Advanced future concepts"],
    difficulty: 'intermediate',
    estimatedTime: 50
  },
  {
    day: 11,
    theme: "Article Mastery - A, An, The",
    lessons: ["Definite Article Rules", "Indefinite Article Precision", "Zero Article Mastery"],
    goals: ["Perfect article usage", "No article errors in speech", "Natural article flow"],
    difficulty: 'advanced',
    estimatedTime: 60
  },
  {
    day: 12,
    theme: "Hobbies and Interests",
    lessons: ["Free Time Activities", "Sports and Games"],
    goals: ["Share interests", "Discuss hobbies naturally"],
    difficulty: 'intermediate',
    estimatedTime: 40
  },
  {
    day: 13,
    theme: "Past Experiences",
    lessons: ["Past Tense Practice", "Telling Stories"],
    goals: ["Use past tense correctly", "Share experiences"],
    difficulty: 'intermediate',
    estimatedTime: 45
  },
  {
    day: 14,
    theme: "Week 2 Review",
    lessons: ["Complex Conversations", "Grammar in Context"],
    goals: ["Longer conversations", "Natural grammar use"],
    difficulty: 'intermediate',
    estimatedTime: 50
  },

  // Week 3: Advanced Communication
  {
    day: 15,
    theme: "Future Plans and Dreams",
    lessons: ["Future Tense", "Goals and Aspirations"],
    goals: ["Discuss future plans", "Express dreams"],
    difficulty: 'intermediate',
    estimatedTime: 45
  },
  {
    day: 16,
    theme: "Work and Career",
    lessons: ["Job Interviews", "Workplace Communication"],
    goals: ["Professional conversations", "Career discussions"],
    difficulty: 'advanced',
    estimatedTime: 50
  },
  {
    day: 17,
    theme: "Education and Learning",
    lessons: ["School Experiences", "Learning Strategies"],
    goals: ["Discuss education", "Share learning methods"],
    difficulty: 'intermediate',
    estimatedTime: 45
  },
  {
    day: 18,
    theme: "Technology and Modern Life",
    lessons: ["Digital Communication", "Social Media"],
    goals: ["Tech vocabulary", "Modern lifestyle topics"],
    difficulty: 'advanced',
    estimatedTime: 45
  },
  {
    day: 19,
    theme: "Culture and Traditions",
    lessons: ["Cultural Differences", "Celebrations"],
    goals: ["Cultural awareness", "Tradition discussions"],
    difficulty: 'advanced',
    estimatedTime: 50
  },
  {
    day: 20,
    theme: "Problem Solving",
    lessons: ["Complaints and Solutions", "Negotiation"],
    goals: ["Handle problems", "Negotiate effectively"],
    difficulty: 'advanced',
    estimatedTime: 50
  },
  {
    day: 21,
    theme: "Week 3 Review",
    lessons: ["Advanced Conversations", "Fluency Practice"],
    goals: ["Smooth conversations", "Reduced hesitation"],
    difficulty: 'advanced',
    estimatedTime: 55
  },

  // Week 4: Mastery and Fluency
  {
    day: 22,
    theme: "Emotions and Feelings",
    lessons: ["Expressing Emotions", "Empathy and Support"],
    goals: ["Emotional intelligence", "Support others"],
    difficulty: 'advanced',
    estimatedTime: 45
  },
  {
    day: 23,
    theme: "News and Current Events",
    lessons: ["Discussing News", "Opinion Expression"],
    goals: ["Current events", "Share opinions"],
    difficulty: 'advanced',
    estimatedTime: 50
  },
  {
    day: 24,
    theme: "Entertainment and Media",
    lessons: ["Movies and TV", "Music and Books"],
    goals: ["Entertainment discussions", "Recommendations"],
    difficulty: 'advanced',
    estimatedTime: 45
  },
  {
    day: 25,
    theme: "Environmental Issues",
    lessons: ["Climate Change", "Sustainability"],
    goals: ["Environmental awareness", "Green living"],
    difficulty: 'advanced',
    estimatedTime: 50
  },
  {
    day: 26,
    theme: "Relationships and Social Life",
    lessons: ["Friendship", "Social Situations"],
    goals: ["Social skills", "Relationship building"],
    difficulty: 'advanced',
    estimatedTime: 45
  },
  {
    day: 27,
    theme: "Advanced Grammar",
    lessons: ["Complex Sentences", "Idiomatic Expressions"],
    goals: ["Natural expressions", "Advanced structures"],
    difficulty: 'advanced',
    estimatedTime: 50
  },
  {
    day: 28,
    theme: "Presentation Skills",
    lessons: ["Public Speaking", "Presentation Techniques"],
    goals: ["Confident presentations", "Clear delivery"],
    difficulty: 'advanced',
    estimatedTime: 55
  },
  {
    day: 29,
    theme: "Debate and Discussion",
    lessons: ["Argumentative Skills", "Critical Thinking"],
    goals: ["Structured arguments", "Logical thinking"],
    difficulty: 'advanced',
    estimatedTime: 55
  },
  {
    day: 30,
    theme: "Graduation and Celebration",
    lessons: ["Final Assessment", "Celebration Conversation"],
    goals: ["Demonstrate progress", "Celebrate achievement"],
    difficulty: 'advanced',
    estimatedTime: 60
  }
];

export const getWeeklyGoals = (week: number): string[] => {
  switch (week) {
    case 1:
      return [
        "Master basic greetings and introductions",
        "Build foundation vocabulary (200+ words)",
        "Develop clear pronunciation habits",
        "Complete 7 consecutive days of practice"
      ];
    case 2:
      return [
        "Engage in longer conversations (2-3 minutes)",
        "Use past, present, and future tenses correctly",
        "Expand vocabulary to 500+ words",
        "Improve listening comprehension"
      ];
    case 3:
      return [
        "Handle complex topics and discussions",
        "Use advanced grammar structures naturally",
        "Develop professional communication skills",
        "Build cultural awareness and sensitivity"
      ];
    case 4:
      return [
        "Achieve conversational fluency",
        "Express complex ideas and emotions",
        "Master advanced pronunciation patterns",
        "Demonstrate overall English proficiency"
      ];
    default:
      return [];
  }
};

export const getDailyMotivation = (day: number): string => {
  const motivations = [
    "Welcome to your English journey! Every expert was once a beginner. 🌟",
    "Day 2! You're building momentum. Consistency is key to success! 💪",
    "Three days strong! Your brain is already adapting to English patterns. 🧠",
    "Halfway through week one! You're forming a powerful learning habit. 🔥",
    "Day 5! Notice how words are starting to feel more natural? 🎯",
    "Almost through your first week! Your confidence is growing daily. ⭐",
    "Week 1 complete! You've laid a solid foundation. Celebrate this milestone! 🎉",
    "Week 2 begins! Time to build on your strong foundation. 🏗️",
    "Your vocabulary is expanding rapidly. Feel the difference? 📚",
    "Double digits! Your pronunciation is getting clearer every day. 🎤",
    "Day 11! You're developing real conversational skills now. 💬",
    "Notice how you're thinking in English more often? That's progress! 🤔",
    "Lucky day 13! Your past tense usage is becoming natural. ⏰",
    "Two weeks done! You're officially building serious momentum. 🚀",
    "Halfway point! Your English journey is truly taking flight. ✈️",
    "Day 16! Professional conversations are within your reach. 💼",
    "You're tackling advanced topics with confidence now! 🎓",
    "Technology vocabulary mastered! You're so modern! 💻",
    "Cultural awareness growing! You're becoming a global communicator. 🌍",
    "Day 20! Problem-solving in English? You've got this! 🔧",
    "Three weeks complete! You're in the advanced league now! 🏆",
    "Emotional expression in English? You're connecting on deeper levels. ❤️",
    "Current events discussions? You're truly engaging with the world! 🌐",
    "Entertainment talks feel natural now. You're culturally fluent! 🎬",
    "Environmental topics? You're a conscious global citizen! 🌱",
    "Social skills in English are flourishing! 👥",
    "Advanced grammar feels natural now. You're truly advanced! 📖",
    "Presentation skills unlocked! You're ready to inspire others! 🎙️",
    "Debate skills activated! You can argue your point brilliantly! ⚖️",
    "GRADUATION DAY! 30 days of dedication have transformed you! 🎓🎉"
  ];
  
  return motivations[day - 1] || "Keep going! You're doing amazing! 🌟";
};