import React, { useState } from 'react';
import { BarChart3, Award, Target, Calendar, Play, BookOpen, Mic, Volume2, Map, Zap, Trophy, PenTool, Brain, Star, Users, Globe, MessageCircle, CheckCircle } from 'lucide-react';
import { UserProgress, Lesson } from '../types';
import LessonCard from './LessonCard';
import ProgressCard from './ProgressCard';
import AchievementBadge from './AchievementBadge';
import CommunitySupport from './CommunitySupport';
import PersonalizedGoals from './PersonalizedGoals';
import InteractiveLessons from './InteractiveLessons';
import ConversationPractice from './ConversationPractice';
import FillInTheBlanks from './FillInTheBlanks';
import PerfectPronunciationTrainer from './PerfectPronunciationTrainer';

interface DashboardProps {
  userProgress: UserProgress;
  recentLessons: Lesson[];
  onStartLesson: (lesson: Lesson) => void;
  onShowPlan?: () => void;
  onShowDailyChallenge?: () => void;
  onShowVocabularyTrainer?: () => void;
  onShowWritingAssistant?: () => void;
  onShowPronunciationTrainer?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userProgress, 
  recentLessons, 
  onStartLesson, 
  onShowPlan,
  onShowDailyChallenge,
  onShowVocabularyTrainer,
  onShowWritingAssistant,
  onShowPronunciationTrainer
}) => {
  const [showCommunity, setShowCommunity] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showInteractiveLessons, setShowInteractiveLessons] = useState(false);
  const [showConversationPractice, setShowConversationPractice] = useState(false);
  const [showFillInTheBlanks, setShowFillInTheBlanks] = useState(false);

  const completionRate = Math.round((userProgress.completedLessons / userProgress.totalLessons) * 100);
  const dailyProgress = Math.round((userProgress.lessonsToday / userProgress.dailyGoal) * 100);

  const handleGoalComplete = (xp: number) => {
    // In a real app, this would update the user's XP
    console.log(`Goal completed! +${xp} XP`);
  };

  const handleStartInteractiveLesson = (lessonId: string) => {
    // Find the lesson and start it
    const lesson = recentLessons.find(l => l.id === lessonId);
    if (lesson) {
      onStartLesson(lesson);
    }
    setShowInteractiveLessons(false);
  };

  const handleConversationComplete = (score: number) => {
    console.log(`Conversation practice completed with score: ${score}`);
    setShowConversationPractice(false);
  };

  const handleFillBlanksComplete = (score: number) => {
    console.log(`Fill in the blanks completed with score: ${score}`);
    setShowFillInTheBlanks(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BS AI Teacher
                </h1>
                <p className="text-sm text-gray-600">Master English with AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Level and XP */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-800">{userProgress.xp} XP</span>
                </div>
                <div className="text-sm text-gray-600">Level {userProgress.level}</div>
                <div className="w-24 bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${((userProgress.xp % 1000) / 1000) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Streak */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500">{userProgress.currentStreak}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProgressCard
            title="Overall Progress"
            value={completionRate}
            subtitle={`${userProgress.completedLessons}/${userProgress.totalLessons} lessons`}
            icon={<BarChart3 className="w-6 h-6" />}
            color="blue"
          />
          <ProgressCard
            title="Daily Goal"
            value={dailyProgress}
            subtitle={`${userProgress.lessonsToday}/${userProgress.dailyGoal} today`}
            icon={<Target className="w-6 h-6" />}
            color="green"
          />
          <ProgressCard
            title="Level Progress"
            value={Math.round(((userProgress.xp % 1000) / 1000) * 100)}
            subtitle={`${userProgress.xpToNextLevel} XP to level ${userProgress.level + 1}`}
            icon={<Star className="w-6 h-6" />}
            color="yellow"
          />
          <ProgressCard
            title="Current Streak"
            value={userProgress.currentStreak}
            subtitle="days in a row"
            icon={<Calendar className="w-6 h-6" />}
            color="orange"
            isScore
          />
        </div>

        {/* Core Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* AI Speech Analysis */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">AI Speech Analysis</h3>
                <p className="text-sm opacity-90">Real-time feedback</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Get instant pronunciation feedback with our advanced AI that analyzes your speech patterns and provides personalized improvement suggestions.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-70">Available in all lessons</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Personalized Goals */}
          <div 
            onClick={() => setShowGoals(true)}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Personalized Goals</h3>
                <p className="text-sm opacity-90">Track your progress</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Set custom learning goals, track your progress, and celebrate achievements as you advance through your English journey.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-70">3 active goals</span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">View Goals</span>
            </div>
          </div>

          {/* Interactive Lessons */}
          <div 
            onClick={() => setShowInteractiveLessons(true)}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Interactive Lessons</h3>
                <p className="text-sm opacity-90">Engaging content</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Experience immersive learning with AI-powered interactive lessons that adapt to your learning style and pace.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-70">50+ lessons available</span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">Explore</span>
            </div>
          </div>

          {/* Community Support */}
          <div 
            onClick={() => setShowCommunity(true)}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Community Support</h3>
                <p className="text-sm opacity-90">Learn together</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Connect with fellow learners, share experiences, get help, and practice together in our supportive community.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-70">12.8k active members</span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">Join</span>
            </div>
          </div>
        </div>

        {/* Daily Challenge CTA */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Daily Challenge Available!</h2>
                <p className="text-sm opacity-90">Complete today's challenge to earn bonus XP</p>
              </div>
            </div>
            <button
              onClick={onShowDailyChallenge}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Start Challenge
            </button>
          </div>
        </div>

        {/* Enhanced 30-Day Plan CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">🚀 30-Day English Mastery Journey</h2>
              <p className="text-lg opacity-90 mb-4">
                Master perfect pronunciation, eliminate grammar errors, and speak with confidence. 
                Our enhanced journey includes advanced sound identification and perfect error correction!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm opacity-80 mb-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>TH, R/L Sound Mastery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>95% Accuracy Goal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Perfect Error Correction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Native-like Fluency</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-sm font-medium mb-1">Enhanced Features:</div>
                <div className="text-xs opacity-90 space-y-1">
                  <div>• Advanced pronunciation analyzer with phoneme-level feedback</div>
                  <div>• Perfect grammar correction like Grammarly with detailed explanations</div>
                  <div>• Bilingual error correction in Tamil and Sinhala</div>
                  <div>• Connected speech patterns and natural linking practice</div>
                </div>
              </div>
            </div>
            <div className="ml-8">
              <button
                onClick={() => {
                  console.log('Start Mastery Journey button clicked');
                  if (onShowPlan) {
                    onShowPlan();
                  } else {
                    console.error('onShowPlan handler is not defined');
                  }
                }}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Map className="w-5 h-5" />
                <span>Start Mastery Journey</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Practice */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Practice</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button 
              onClick={onShowVocabularyTrainer}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <BookOpen className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Vocabulary</span>
            </button>
            
            <button 
              onClick={() => setShowConversationPractice(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              <MessageCircle className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Conversation</span>
            </button>
            
            <button 
              onClick={onShowPronunciationTrainer}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <Volume2 className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Pronunciation</span>
            </button>
            
            <button 
              onClick={onShowWritingAssistant}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              <PenTool className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Writing</span>
            </button>
            
            <button className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
              <Mic className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Speaking</span>
            </button>
            
            <button 
              onClick={() => setShowFillInTheBlanks(true)}
              className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
            >
              <Target className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Fill Blanks</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Lessons */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Continue Learning</h2>
              <div className="space-y-4">
                {recentLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onStart={() => onStartLesson(lesson)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Achievements</h2>
            <div className="space-y-4">
              {userProgress.achievements.slice(0, 6).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
            <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
              View All Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCommunity && (
        <CommunitySupport onClose={() => setShowCommunity(false)} />
      )}

      {showGoals && (
        <PersonalizedGoals 
          onClose={() => setShowGoals(false)}
          onGoalComplete={handleGoalComplete}
        />
      )}

      {showInteractiveLessons && (
        <InteractiveLessons
          onClose={() => setShowInteractiveLessons(false)}
          onStartLesson={handleStartInteractiveLesson}
        />
      )}

      {showConversationPractice && (
        <ConversationPractice
          onClose={() => setShowConversationPractice(false)}
          onComplete={handleConversationComplete}
        />
      )}

      {showFillInTheBlanks && (
        <FillInTheBlanks
          onClose={() => setShowFillInTheBlanks(false)}
          onComplete={handleFillBlanksComplete}
        />
      )}


    </div>
  );
};

export default Dashboard;