import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Lock, Clock, Target, BookOpen, Volume2, Award, Users, Globe, Star } from 'lucide-react';
import { levelBasedTracks, getTrackByLevel, getDayLesson, LevelTrack, DayLesson } from '../data/levelBasedCurriculum';

interface LevelBasedLearningPlanProps {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  currentDay: number;
  completedDays: number[];
  onStartDay: (day: number) => void;
  onBack: () => void;
  onChangeTrack: (track: LevelTrack) => void;
}

const LevelBasedLearningPlan: React.FC<LevelBasedLearningPlanProps> = ({
  userLevel,
  currentDay,
  completedDays,
  onStartDay,
  onBack,
  onChangeTrack
}) => {
  const [selectedTrack, setSelectedTrack] = useState<LevelTrack>(getTrackByLevel(userLevel));
  const [selectedDay, setSelectedDay] = useState<DayLesson | null>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);

  const getTrackIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';  
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'speaking': return '🗣️';
      case 'listening': return '👂';
      case 'reading': return '📖';
      case 'writing': return '✍️';
      case 'vocabulary': return '📝';
      case 'grammar': return '📐';
      default: return '📚';
    }
  };

  const getDayStatus = (day: number) => {
    if (completedDays.includes(day)) return 'completed';
    if (day === currentDay) return 'current';
    if (day < currentDay) return 'available';
    return 'locked';
  };

  const getDayStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      case 'available': return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      case 'locked': return 'bg-gray-100 text-gray-400';
      default: return 'bg-gray-200';
    }
  };

  const handleTrackChange = (track: LevelTrack) => {
    setSelectedTrack(track);
    onChangeTrack(track);
    setShowTrackSelector(false);
  };

  const handleDayClick = (day: number) => {
    const dayLesson = getDayLesson(selectedTrack, day);
    if (dayLesson) {
      setSelectedDay(dayLesson);
    }
  };

  const handleStartLesson = (day: number) => {
    onStartDay(day);
    setSelectedDay(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTrackSelector(true)}
                className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Change Track</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">{getTrackIcon(selectedTrack.level)}</span>
                <h1 className="text-3xl font-bold">{selectedTrack.name}</h1>
              </div>
              <p className="text-lg opacity-90 mb-4">{selectedTrack.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm opacity-80">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTrack.dailyTimeMinutes} min/day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{selectedTrack.totalDays} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>{completedDays.length}/{selectedTrack.totalDays} completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>{selectedTrack.level} level</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Skills */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Target Skills</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {selectedTrack.targetSkills.map((skill, index) => (
              <div key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedTrack.weeklyGoals.map((goal, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">Week {index + 1}</span>
                </div>
                <p className="text-sm text-gray-600">{goal.replace(`Week ${index + 1}: `, '')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Lessons Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Daily Lessons</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {Array.from({ length: selectedTrack.totalDays }, (_, i) => i + 1).map((day) => {
              const status = getDayStatus(day);
              const dayLesson = getDayLesson(selectedTrack, day);
              
              return (
                <button
                  key={day}
                  onClick={() => status !== 'locked' && handleDayClick(day)}
                  disabled={status === 'locked'}
                  className={`
                    aspect-square rounded-xl p-3 flex flex-col items-center justify-center space-y-1 transition-all duration-200 transform hover:scale-105
                    ${getDayStatusColor(status)}
                    ${status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : status === 'locked' ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="font-bold">{day}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium">Day {day}</span>
                  {dayLesson && (
                    <div className="flex space-x-1">
                      {dayLesson.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-xs">{getSkillIcon(skill)}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Track Selector Modal */}
      {showTrackSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Choose Your Learning Track</h2>
              <p className="text-gray-600 mt-2">Select the track that best matches your current English level</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {levelBasedTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackChange(track)}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all duration-200 hover:shadow-lg"
                >
                  <div className="text-center mb-4">
                    <span className="text-4xl">{getTrackIcon(track.level)}</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2">{track.name}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{track.description}</p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{track.totalDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Time:</span>
                      <span>{track.dailyTimeMinutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="capitalize font-medium">{track.level}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                    <div className="text-xs text-gray-600 mb-2">Key Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {track.targetSkills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {track.targetSkills.length > 3 && (
                        <span className="text-indigo-600 text-xs">+{track.targetSkills.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setShowTrackSelector(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Day {selectedDay.day}: {selectedDay.title}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedDay.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedDay.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Learning Objectives */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  {selectedDay.objectives.map((objective, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-700">
                      <Target className="w-4 h-4 text-green-500" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Activities</h3>
                <div className="space-y-3">
                  {selectedDay.activities.map((activity, index) => (
                    <div key={activity.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{activity.title}</h4>
                        <span className="text-sm text-gray-500">{activity.timeEstimate} min</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.instruction}</p>
                      <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                        {activity.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">New Vocabulary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDay.vocabulary.map((vocab, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-800">{vocab.word}</div>
                      <div className="text-sm text-blue-600">{vocab.pronunciation}</div>
                      <div className="text-sm text-gray-700 mt-1">{vocab.definition}</div>
                      <div className="text-sm text-gray-600 italic mt-1">"{vocab.example}"</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Grammar Focus</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">{selectedDay.grammar.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{selectedDay.grammar.explanation}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-2">Examples:</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedDay.grammar.examples.map((example, index) => (
                          <li key={index}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-2">Practice:</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedDay.grammar.practice.map((practice, index) => (
                          <li key={index}>• {practice}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cultural Note */}
              {selectedDay.culturalNote && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Cultural Note</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800">{selectedDay.culturalNote}</p>
                  </div>
                </div>
              )}

              {/* Daily Challenge */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Daily Challenge</h3>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-800">{selectedDay.dailyChallenge}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-between">
              <button
                onClick={() => setSelectedDay(null)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleStartLesson(selectedDay.day)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Lesson</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelBasedLearningPlan;