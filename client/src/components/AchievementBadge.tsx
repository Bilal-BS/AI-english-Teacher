import React from 'react';
import { Award, Lock } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
      achievement.unlocked 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
        : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
        achievement.unlocked
          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
          : 'bg-gray-300 text-gray-500'
      }`}>
        {achievement.unlocked ? (
          <Award className="w-5 h-5" />
        ) : (
          <Lock className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <h4 className={`text-sm font-semibold ${
          achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
        }`}>
          {achievement.title}
        </h4>
        <p className={`text-xs ${
          achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {achievement.description}
        </p>
        {achievement.unlocked && achievement.unlockedAt && (
          <p className="text-xs text-yellow-600 mt-1">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;