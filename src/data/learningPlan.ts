export interface DayPlan {
  day: number;
  theme: string;
  lessons: string[];
  goals: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
}

export const thirtyDayPlan: DayPlan[] = [
  // Week 1: Foundation Building
  {
    day: 1,
    theme: "Getting Started - Basic Greetings",
    lessons: ["Basic Greetings & Introductions", "Common Courtesy Phrases"],
    goals: ["Master hello, goodbye, please, thank you", "Practice clear pronunciation"],
    difficulty: 'beginner',
    estimatedTime: 30
  },
  {
    day: 2,
    theme: "Personal Information",
    lessons: ["Introducing Yourself", "Talking About Your Family"],
    goals: ["Share name, age, occupation", "Describe family members"],
    difficulty: 'beginner',
    estimatedTime: 35
  },
  {
    day: 3,
    theme: "Numbers and Time",
    lessons: ["Numbers 1-100", "Telling Time"],
    goals: ["Count confidently", "Ask and tell time"],
    difficulty: 'beginner',
    estimatedTime: 40
  },
  {
    day: 4,
    theme: "Daily Routines",
    lessons: ["Morning Routines", "Daily Activities"],
    goals: ["Describe your day", "Use present tense verbs"],
    difficulty: 'beginner',
    estimatedTime: 35
  },
  {
    day: 5,
    theme: "Food and Drinks",
    lessons: ["Ordering Food", "Favorite Foods"],
    goals: ["Order at restaurants", "Express preferences"],
    difficulty: 'beginner',
    estimatedTime: 40
  },
  {
    day: 6,
    theme: "Directions and Places",
    lessons: ["Asking for Directions", "Common Places"],
    goals: ["Navigate conversations", "Describe locations"],
    difficulty: 'beginner',
    estimatedTime: 45
  },
  {
    day: 7,
    theme: "Week 1 Review",
    lessons: ["Conversation Practice", "Pronunciation Review"],
    goals: ["Combine all week 1 skills", "Build confidence"],
    difficulty: 'beginner',
    estimatedTime: 50
  },

  // Week 2: Building Confidence
  {
    day: 8,
    theme: "Weather and Seasons",
    lessons: ["Weather Descriptions", "Seasonal Activities"],
    goals: ["Discuss weather naturally", "Plan seasonal activities"],
    difficulty: 'beginner',
    estimatedTime: 35
  },
  {
    day: 9,
    theme: "Shopping and Money",
    lessons: ["At the Store", "Prices and Payment"],
    goals: ["Shop confidently", "Handle money conversations"],
    difficulty: 'intermediate',
    estimatedTime: 40
  },
  {
    day: 10,
    theme: "Transportation",
    lessons: ["Public Transport", "Travel Plans"],
    goals: ["Navigate transport systems", "Discuss travel"],
    difficulty: 'intermediate',
    estimatedTime: 40
  },
  {
    day: 11,
    theme: "Health and Body",
    lessons: ["At the Doctor", "Body Parts and Health"],
    goals: ["Describe symptoms", "Health conversations"],
    difficulty: 'intermediate',
    estimatedTime: 45
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