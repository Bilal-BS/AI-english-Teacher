import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import LessonInterface from './components/LessonInterface';
import LearningPlan from './components/LearningPlan';
import OnboardingFlow, { OnboardingData } from './components/OnboardingFlow';
import PlacementTest from './components/PlacementTest';
import DailyChallenge from './components/DailyChallenge';
import VocabularyTrainer from './components/VocabularyTrainer';
import WritingAssistant from './components/WritingAssistant';
import { Lesson, UserProgress, Achievement, User, PlacementTestResult } from './types';
import { userDataManager } from './utils/userDataManager';
import { enhancedLessons } from './data/enhancedLessons';
import { enhancedAchievements } from './data/achievementData';

// Enhanced mock data for lessons
const mockLessons: Lesson[] = [
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
    title: 'English Vowel Sounds Mastery',
    category: 'pronunciation',
    difficulty: 'intermediate',
    description: 'Master the 12 pure vowel sounds in English with AI feedback',
    duration: 20,
    completed: false,
    xpReward: 75,
    content: {
      type: 'pronunciation',
      exercises: [
        {
          id: '2a',
          type: 'speak',
          instruction: 'Practice the /æ/ sound in these words',
          targetText: 'Cat, bat, hat, mat, sat',
          audioUrl: '/audio/vowel-a.mp3',
          completed: false
        },
        {
          id: '2b',
          type: 'speak',
          instruction: 'Practice the /ɪ/ sound in these words',
          targetText: 'Bit, sit, hit, fit, kit',
          audioUrl: '/audio/vowel-i.mp3',
          completed: false
        }
      ]
    }
  },
  {
    id: '3',
    title: 'Reading Comprehension: News Articles',
    category: 'reading',
    difficulty: 'intermediate',
    description: 'Improve reading skills with current news articles',
    duration: 25,
    completed: false,
    xpReward: 60,
    content: {
      type: 'reading',
      exercises: [
        {
          id: '3a',
          type: 'reading',
          instruction: 'Read the article and answer the questions',
          content: 'Climate change is one of the most pressing issues of our time...',
          questions: [
            {
              id: '3a1',
              question: 'What is the main topic of the article?',
              options: ['Weather patterns', 'Climate change', 'Global warming', 'Environmental protection'],
              correctAnswer: 1,
              explanation: 'The article focuses on climate change as the main topic.'
            }
          ],
          completed: false
        }
      ]
    }
  },
  {
    id: '4',
    title: 'Business Email Writing',
    category: 'writing',
    difficulty: 'advanced',
    description: 'Learn to write professional business emails',
    duration: 30,
    completed: false,
    xpReward: 100,
    content: {
      type: 'writing',
      exercises: [
        {
          id: '4a',
          type: 'writing',
          instruction: 'Write a professional email requesting a meeting',
          targetText: 'Write an email to your manager requesting a meeting to discuss your project progress.',
          completed: false
        }
      ]
    }
  },
  {
    id: '5',
    title: 'Listening: Podcast Interview',
    category: 'listening',
    difficulty: 'advanced',
    description: 'Practice listening skills with podcast interviews',
    duration: 20,
    completed: false,
    xpReward: 80,
    content: {
      type: 'listening',
      exercises: [
        {
          id: '5a',
          type: 'listen',
          instruction: 'Listen to the interview and answer questions',
          audioUrl: '/audio/podcast-interview.mp3',
          questions: [
            {
              id: '5a1',
              question: 'What is the interviewee\'s profession?',
              options: ['Teacher', 'Engineer', 'Doctor', 'Lawyer'],
              correctAnswer: 1,
              explanation: 'The interviewee mentions being a software engineer.'
            }
          ],
          completed: false
        }
      ]
    }
  },
  {
    id: '6',
    title: 'Advanced Grammar: Conditionals',
    category: 'grammar',
    difficulty: 'advanced',
    description: 'Master complex conditional sentences',
    duration: 25,
    completed: false,
    xpReward: 90,
    content: {
      type: 'grammar',
      exercises: [
        {
          id: '6a',
          type: 'multiple-choice',
          instruction: 'Choose the correct conditional form',
          targetText: 'If I _____ more time, I would learn another language.',
          options: ['have', 'had', 'will have', 'would have'],
          correctAnswer: 1,
          completed: false
        }
      ]
    }
  }
];

// Enhanced achievements with XP rewards
const mockAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    unlocked: false,
    xpReward: 25
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: '7-day learning streak',
    icon: '🔥',
    unlocked: false,
    xpReward: 100
  },
  {
    id: 'pronunciation-master',
    title: 'Pronunciation Pro',
    description: 'Score 90%+ on 5 pronunciation lessons',
    icon: '🎤',
    unlocked: false,
    xpReward: 150
  },
  {
    id: 'vocabulary-master',
    title: 'Word Master',
    description: 'Master 100 vocabulary words',
    icon: '📚',
    unlocked: false,
    xpReward: 200
  },
  {
    id: 'writing-expert',
    title: 'Writing Expert',
    description: 'Complete 10 writing tasks with 85%+ score',
    icon: '✍️',
    unlocked: false,
    xpReward: 250
  },
  {
    id: 'daily-challenger',
    title: 'Daily Champion',
    description: 'Complete 30 daily challenges',
    icon: '🏆',
    unlocked: false,
    xpReward: 300
  }
];

function App() {
  const [currentView, setCurrentView] = useState<'onboarding' | 'placement' | 'dashboard' | 'lesson' | 'plan'>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>(enhancedLessons);
  const [achievements, setAchievements] = useState<Achievement[]>(enhancedAchievements);
  
  // Modal states
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showVocabularyTrainer, setShowVocabularyTrainer] = useState(false);
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);
  
  // 30-day plan state
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // Initialize user data and load progress
  useEffect(() => {
    loadUserData();
  }, []); // Empty dependency array to prevent infinite re-renders

  const loadUserData = useCallback(() => {
    // Check if user exists and has completed onboarding
    let userData = userDataManager.getUserData();
    
    if (!userData) {
      setCurrentView('onboarding');
      return;
    }

    // Convert to User type
    const userObj: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      nativeLanguage: userData.preferences.nativeLanguage || 'Unknown',
      englishLevel: userData.preferences.difficultyLevel,
      goals: userData.preferences.focusAreas,
      hasCompletedOnboarding: true,
      hasCompletedPlacementTest: userData.preferences.difficultyLevel !== 'beginner', // Assume placement test completed if not beginner
      createdAt: userData.createdAt,
      preferences: userData.preferences
    };

    setUser(userObj);

    // Check if placement test is needed
    if (!userObj.hasCompletedPlacementTest && userObj.englishLevel === 'beginner') {
      setCurrentView('placement');
      return;
    }

    // Load user stats
    const stats = userDataManager.getUserStats();
    
    // Load lesson progress and update lesson completion status
    const allProgress = userDataManager.getAllLessonProgress();
    const updatedLessons = enhancedLessons.map(lesson => {
      const progress = allProgress.find(p => p.lessonId === lesson.id);
      return {
        ...lesson,
        completed: progress?.completed || false,
        score: progress?.score
      };
    });

    setLessons(updatedLessons);

    // Calculate level and XP
    const level = Math.floor(stats.totalScore / 1000) + 1;
    const xp = stats.totalScore;
    const xpToNextLevel = (level * 1000) - xp;

    // Update user progress state
    setUserProgress({
      totalLessons: enhancedLessons.length,
      completedLessons: stats.completedLessons,
      currentStreak: stats.currentStreak,
      totalScore: stats.totalScore,
      achievements: updateAchievements(stats, allProgress),
      dailyGoal: userData.preferences.dailyGoal,
      lessonsToday: stats.lessonsToday,
      level,
      xp,
      xpToNextLevel,
      englishLevel: userObj.englishLevel
    });

    // Update 30-day plan progress
    const completedLessonDays = allProgress
      .filter(p => p.completed && p.completedAt)
      .map(p => {
        const daysSinceStart = Math.floor(
          (p.completedAt!.getTime() - userData!.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return Math.min(30, Math.max(1, daysSinceStart + 1));
      });

    setCompletedDays([...new Set(completedLessonDays)]);
    setCurrentDay(Math.min(30, Math.max(...completedLessonDays, 0) + 1));

    setCurrentView('dashboard');
  }, []); // Remove dependencies to prevent infinite re-renders

  const updateAchievements = (stats: any, allProgress: any[]): Achievement[] => {
    const updatedAchievements = [...enhancedAchievements];

    // First lesson achievement
    if (stats.completedLessons > 0) {
      const achievement = updatedAchievements.find(a => a.id === 'first-lesson');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
      }
    }

    // Week warrior (7-day streak)
    if (stats.currentStreak >= 7) {
      const achievement = updatedAchievements.find(a => a.id === 'streak-7');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
      }
    }

    // Pronunciation master (90%+ on 5 pronunciation lessons)
    const pronunciationLessons = allProgress.filter(p => 
      p.completed && p.score && p.score >= 90 && 
      enhancedLessons.find(l => l.id === p.lessonId)?.category === 'pronunciation'
    );
    if (pronunciationLessons.length >= 5) {
      const achievement = updatedAchievements.find(a => a.id === 'pronunciation-master');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
      }
    }

    return updatedAchievements;
  };

  const handleOnboardingComplete = (onboardingData: OnboardingData) => {
    // Create user with onboarding data
    const userData = userDataManager.createUser(onboardingData.name);
    userDataManager.updateUserPreferences({
      dailyGoal: onboardingData.dailyGoal,
      difficultyLevel: onboardingData.englishLevel,
      focusAreas: onboardingData.focusAreas,
      nativeLanguage: onboardingData.nativeLanguage,
      learningGoals: onboardingData.goals
    });

    // If this is a quick start (name is 'Quick Start User'), skip placement test
    if (onboardingData.name === 'Quick Start User') {
      setCurrentView('dashboard');
      loadUserData();
    } else if (onboardingData.englishLevel === 'beginner') {
      setCurrentView('placement');
    } else {
      setCurrentView('dashboard');
      loadUserData();
    }
  };

  const handlePlacementTestComplete = (result: PlacementTestResult) => {
    // Update user's English level based on test result
    if (user) {
      userDataManager.updateUserPreferences({
        difficultyLevel: result.level
      });
    }
    loadUserData();
  };

  const handlePlacementTestSkip = () => {
    console.log('Placement test skip handler called');
    // Mark placement test as completed with default beginner level
    const userData = userDataManager.getUserData();
    if (userData) {
      userDataManager.updateUserPreferences({
        difficultyLevel: 'beginner'
      });
      console.log('Updated user preferences to beginner level');
    }
    console.log('Switching to dashboard view');
    setCurrentView('dashboard');
    loadUserData();
  };

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView('lesson');
  };

  const handleCompleteLesson = (score: number) => {
    if (selectedLesson && userProgress) {
      // Award XP
      const xpGained = Math.round((score / 100) * selectedLesson.xpReward);
      
      // Update lesson completion in state
      const updatedLessons = lessons.map(lesson => 
        lesson.id === selectedLesson.id 
          ? { ...lesson, completed: true, score }
          : lesson
      );
      setLessons(updatedLessons);

      // Reload user data to get updated stats and achievements
      setTimeout(() => {
        loadUserData();
      }, 100);
    }

    // Return to dashboard
    setCurrentView('dashboard');
    setSelectedLesson(null);
  };

  const handleExitLesson = () => {
    setCurrentView('dashboard');
    setSelectedLesson(null);
  };

  const handleStartDay = (day: number) => {
    // In a real app, this would load the specific lessons for that day
    const availableLessons = lessons.filter(l => !l.completed);
    const randomLesson = availableLessons.length > 0 
      ? availableLessons[Math.floor(Math.random() * availableLessons.length)]
      : enhancedLessons[Math.floor(Math.random() * enhancedLessons.length)];
    
    handleStartLesson(randomLesson);
  };

  const handleShowPlan = () => {
    setCurrentView('plan');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleDailyChallengeComplete = (xp: number) => {
    // Award XP and update progress
    if (userProgress) {
      setUserProgress(prev => prev ? {
        ...prev,
        xp: prev.xp + xp,
        totalScore: prev.totalScore + xp
      } : null);
    }
    setShowDailyChallenge(false);
    loadUserData();
  };

  const handleVocabularyProgress = (masteredWords: number) => {
    // Update vocabulary progress
    console.log(`Mastered ${masteredWords} words`);
  };

  const handleWritingComplete = (score: number) => {
    // Award XP based on writing score
    const xpGained = Math.round(score * 2); // 2 XP per percentage point
    if (userProgress) {
      setUserProgress(prev => prev ? {
        ...prev,
        xp: prev.xp + xpGained,
        totalScore: prev.totalScore + xpGained
      } : null);
    }
    setShowWritingAssistant(false);
    loadUserData();
  };

  if (currentView === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (currentView === 'placement') {
    return (
      <PlacementTest 
        onComplete={handlePlacementTestComplete}
        onSkip={handlePlacementTestSkip}
      />
    );
  }

  if (!userProgress || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentView === 'dashboard' ? (
        <Dashboard
          userProgress={userProgress}
          recentLessons={lessons.slice(0, 6)}
          onStartLesson={handleStartLesson}
          onShowPlan={handleShowPlan}
          onShowDailyChallenge={() => setShowDailyChallenge(true)}
          onShowVocabularyTrainer={() => setShowVocabularyTrainer(true)}
          onShowWritingAssistant={() => setShowWritingAssistant(true)}
        />
      ) : currentView === 'lesson' && selectedLesson ? (
        <LessonInterface
          lesson={selectedLesson}
          onComplete={handleCompleteLesson}
          onExit={handleExitLesson}
        />
      ) : currentView === 'plan' ? (
        <LearningPlan
          currentDay={currentDay}
          completedDays={completedDays}
          onStartDay={handleStartDay}
          onBack={handleBackToDashboard}
        />
      ) : null}

      {/* Modals */}
      {showDailyChallenge && (
        <DailyChallenge
          onComplete={handleDailyChallengeComplete}
          onClose={() => setShowDailyChallenge(false)}
        />
      )}

      {showVocabularyTrainer && (
        <VocabularyTrainer
          onClose={() => setShowVocabularyTrainer(false)}
          onProgress={handleVocabularyProgress}
        />
      )}

      {showWritingAssistant && (
        <WritingAssistant
          onClose={() => setShowWritingAssistant(false)}
          onComplete={handleWritingComplete}
        />
      )}
    </div>
  );
}

export default App;