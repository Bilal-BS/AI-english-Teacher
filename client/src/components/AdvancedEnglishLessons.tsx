import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, BookOpen, Calendar, Target, Zap, Trophy, Clock } from "lucide-react";

interface AdvancedEnglishLessonsProps {
  onClose: () => void;
}

export default function AdvancedEnglishLessons({ onClose }: AdvancedEnglishLessonsProps) {
  const [lessons, setLessons] = useState<string[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advanced-lessons");
      const data = await res.text();

      // Parse lessons by splitting on "Day X:" pattern and filtering empty entries
      const parsedLessons = data.split(/(?=Day \d+:)/).filter(lesson => lesson.trim().length > 0);
      setLessons(parsedLessons);
      setCurrentDay(0);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
    setLoading(false);
  };

  const nextLesson = () => {
    if (currentDay < lessons.length - 1) setCurrentDay(currentDay + 1);
  };

  const prevLesson = () => {
    if (currentDay > 0) setCurrentDay(currentDay - 1);
  };

  const getCurrentDayNumber = () => {
    if (lessons.length === 0) return 0;
    const match = lessons[currentDay]?.match(/Day (\d+):/);
    return match ? parseInt(match[1]) : currentDay + 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">30-Day Advanced English Lessons</h1>
                <p className="text-blue-100">Master English with structured daily practice</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {lessons.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress: Day {getCurrentDayNumber()} of 30</span>
                <span>{Math.round(((currentDay + 1) / 30) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentDay + 1) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Ready to Start Your 30-Day Journey?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Get personalized daily lessons covering grammar, vocabulary, pronunciation, and conversation skills.
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Structured Learning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Daily progressive lessons</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-30 rounded-lg p-4">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Interactive Practice</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Speaking & listening exercises</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg p-4">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Achievement Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your progress</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-30 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Flexible Timing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Learn at your own pace</p>
                </div>
              </div>

              <button 
                onClick={fetchLessons} 
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
              >
                {loading ? "Generating Lessons..." : "🚀 Generate 30-Day Lessons"}
              </button>
            </div>
          ) : (
            <>
              {/* Lesson Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Day {getCurrentDayNumber()} Advanced Lesson
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{currentDay + 1} of {lessons.length}</span>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      {lessons[currentDay]}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={prevLesson} 
                  disabled={currentDay === 0}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Day</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Day {getCurrentDayNumber()}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(lessons.length, 10) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentDay(i)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          i === currentDay
                            ? 'bg-blue-600'
                            : i <= currentDay
                            ? 'bg-green-400'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                    {lessons.length > 10 && (
                      <span className="text-gray-400 text-xs">+{lessons.length - 10}</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={nextLesson} 
                  disabled={currentDay === lessons.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next Day</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}