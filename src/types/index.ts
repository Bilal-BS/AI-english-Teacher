export interface Lesson {
  id: string;
  title: string;
  category: 'pronunciation' | 'conversation' | 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'writing';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  duration: number;
  completed: boolean;
  score?: number;
  content: LessonContent;
  xpReward: number;
  badges?: string[];
}

export interface LessonContent {
  type: 'pronunciation' | 'conversation' | 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'writing';
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: 'speak' | 'listen' | 'repeat' | 'conversation' | 'multiple-choice' | 'fill-blank' | 'writing' | 'reading';
  instruction: string;
  targetText?: string;
  audioUrl?: string;
  expectedResponse?: string;
  options?: string[];
  correctAnswer?: string | number;
  completed: boolean;
  score?: number;
  content?: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface UserProgress {
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  totalScore: number;
  achievements: Achievement[];
  dailyGoal: number;
  lessonsToday: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  englishLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  similarity: number;
}

export interface PlacementTestResult {
  level: 'beginner' | 'intermediate' | 'advanced';
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  nativeLanguage: string;
  englishLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  hasCompletedOnboarding: boolean;
  hasCompletedPlacementTest: boolean;
  placementTestResult?: PlacementTestResult;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dailyGoal: number;
  reminderTime?: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  nativeLanguage: string;
  learningGoals: string[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'listening';
  title: string;
  description: string;
  exercises: Exercise[];
  xpReward: number;
  completed: boolean;
}

export interface VocabularyCard {
  id: string;
  word: string;
  definition: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  mastered: boolean;
  reviewCount: number;
  nextReview: Date;
}

export interface WritingTask {
  id: string;
  title: string;
  prompt: string;
  type: 'email' | 'essay' | 'story' | 'letter' | 'report';
  minWords: number;
  maxWords: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rubric: WritingRubric;
}

export interface WritingRubric {
  grammar: number;
  vocabulary: number;
  structure: number;
  content: number;
  overall: number;
}

export interface Leaderboard {
  userId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}