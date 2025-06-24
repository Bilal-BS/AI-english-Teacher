import React, { useState } from 'react';
import { Calendar, Clock, Target, Star, CheckCircle, Lock, Play, Award, ArrowLeft } from 'lucide-react';
import { thirtyDayPlan, getWeeklyGoals, getDailyMotivation, DayPlan } from '../data/learningPlan';

interface LearningPlanProps {
  currentDay: number;
  completedDays: number[];
  onStartDay: (day: number) => void;
  onBack: () => void;
}

const LearningPlan: React.FC<LearningPlanProps> = ({ 
  currentDay, 
  completedDays, 
  onStartDay, 
  onBack 
}) => {
  const [selectedWeek, setSelectedWeek] = useState(Math.ceil(currentDay / 7));

  const getWeekDays = (week: number): DayPlan[] => {
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(week * 7, 30);
    return thirtyDayPlan.slice(startDay - 1, endDay);
  };

  const getDayStatus = (day: number) => {
    if (completedDays.includes(day)) return 'completed';
    if (day === currentDay) return 'current';
    if (day < currentDay) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white border-green-500';
      case 'current': return 'bg-blue-500 text-white border-blue-500 animate-pulse';
      case 'available': return 'bg-white text-gray-800 border-gray-300 hover:border-blue-400';
      case 'locked': return 'bg-gray-100 text-gray-400 border-gray-200';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completionRate = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  30-Day Learning Journey
                </h1>
                <p className="text-sm text-gray-600">Your personalized path to English fluency</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{currentDay}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Current Day</h3>
            <p className="text-xs text-gray-500">of 30-day journey</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">{completedDays.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Days Completed</h3>
            <p className="text-xs text-gray-500">lessons finished</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">{30 - completedDays.length}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Days Remaining</h3>
            <p className="text-xs text-gray-500">to complete journey</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">{Math.ceil(currentDay / 7)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600">Current Week</h3>
            <p className="text-xs text-gray-500">of 4 weeks total</p>
          </div>
        </div>

        {/* Daily Motivation */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-2">Today's Motivation</h2>
          <p className="text-lg opacity-90">{getDailyMotivation(currentDay)}</p>
        </div>

        {/* Week Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 flex space-x-2">
            {[1, 2, 3, 4].map(week => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedWeek === week
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Week {selectedWeek} Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getWeeklyGoals(selectedWeek).map((goal, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Lessons Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Week {selectedWeek} - Daily Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getWeekDays(selectedWeek).map((dayPlan) => {
              const status = getDayStatus(dayPlan.day);
              const isClickable = status === 'current' || status === 'available';
              
              return (
                <div
                  key={dayPlan.day}
                  className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed'
                  } ${getStatusColor(status)}`}
                  onClick={() => isClickable && onStartDay(dayPlan.day)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">Day {dayPlan.day}</span>
                      {status === 'completed' && <CheckCircle className="w-5 h-5" />}
                      {status === 'locked' && <Lock className="w-5 h-5" />}
                      {status === 'current' && <Play className="w-5 h-5" />}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(dayPlan.difficulty)}`}>
                      {dayPlan.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{dayPlan.theme}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {dayPlan.lessons.map((lesson, index) => (
                      <div key={index} className="text-sm opacity-80">
                        • {lesson}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm opacity-70">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{dayPlan.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{dayPlan.goals.length} goals</span>
                    </div>
                  </div>
                  
                  {status === 'current' && (
                    <div className="mt-4 text-center">
                      <span className="text-sm font-medium">Ready to start!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlan;