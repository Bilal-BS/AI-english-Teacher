import React from 'react';
import { Play, Clock, Star, CheckCircle } from 'lucide-react';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  onStart: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onStart }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pronunciation': return 'from-blue-500 to-blue-600';
      case 'conversation': return 'from-green-500 to-green-600';
      case 'vocabulary': return 'from-purple-500 to-purple-600';
      case 'grammar': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
              {lesson.difficulty}
            </span>
            <span className="text-xs text-gray-500 capitalize">{lesson.category}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{lesson.duration} min</span>
            </div>
            {lesson.score && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{lesson.score}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end space-y-3">
          {lesson.completed && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
          <button
            onClick={onStart}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r ${getCategoryColor(lesson.category)} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">
              {lesson.completed ? 'Review' : 'Start'}
            </span>
          </button>
        </div>
      </div>
      
      {lesson.completed && lesson.score && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Your Score</span>
            <span className="text-sm font-semibold text-gray-800">{lesson.score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${lesson.score}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonCard;