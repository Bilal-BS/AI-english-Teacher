import { Achievement } from '../types';

export const enhancedAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    unlocked: false,
    category: 'milestone',
    xpReward: 50
  },
  {
    id: 'streak-3',
    title: 'Getting Started',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
    xpReward: 75
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '⚡',
    unlocked: false,
    category: 'streak',
    xpReward: 150
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Practice 30 days in a row',
    icon: '🏆',
    unlocked: false,
    category: 'streak',
    xpReward: 500
  },
  {
    id: 'pronunciation-master',
    title: 'Pronunciation Pro',
    description: 'Score 90%+ on 5 pronunciation lessons',
    icon: '🎤',
    unlocked: false,
    category: 'skill',
    xpReward: 200
  },
  {
    id: 'conversation-expert',
    title: 'Conversation Expert',
    description: 'Complete 10 conversation lessons',
    icon: '💬',
    unlocked: false,
    category: 'skill',
    xpReward: 250
  },
  {
    id: 'grammar-genius',
    title: 'Grammar Genius',
    description: 'Master 15 grammar lessons',
    icon: '📚',
    unlocked: false,
    category: 'skill',
    xpReward: 300
  },
  {
    id: 'vocabulary-builder',
    title: 'Word Wizard',
    description: 'Learn 100 new vocabulary words',
    icon: '🔤',
    unlocked: false,
    category: 'vocabulary',
    xpReward: 200
  },
  {
    id: 'reading-champion',
    title: 'Reading Champion',
    description: 'Complete 10 reading comprehension lessons',
    icon: '📖',
    unlocked: false,
    category: 'skill',
    xpReward: 250
  },
  {
    id: 'writing-expert',
    title: 'Writing Expert',
    description: 'Complete 5 writing exercises with 85%+ scores',
    icon: '✍️',
    unlocked: false,
    category: 'skill',
    xpReward: 300
  },
  {
    id: 'speed-learner',
    title: 'Speed Learner',
    description: 'Complete 5 lessons in one day',
    icon: '🚀',
    unlocked: false,
    category: 'performance',
    xpReward: 150
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% on any lesson',
    icon: '⭐',
    unlocked: false,
    category: 'performance',
    xpReward: 100
  },
  {
    id: 'dedicated-learner',
    title: 'Dedicated Learner',
    description: 'Complete 50 lessons total',
    icon: '🎓',
    unlocked: false,
    category: 'milestone',
    xpReward: 400
  },
  {
    id: 'ai-conversationalist',
    title: 'AI Conversationalist',
    description: 'Have 25 AI conversations',
    icon: '🤖',
    unlocked: false,
    category: 'interaction',
    xpReward: 200
  },
  {
    id: 'challenge-master',
    title: 'Challenge Master',
    description: 'Complete 10 daily challenges',
    icon: '🏅',
    unlocked: false,
    category: 'challenge',
    xpReward: 250
  }
];