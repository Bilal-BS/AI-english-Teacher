import React, { useState } from 'react';
import { BookOpen, Play, Clock, Star, Users, Zap, Target, Award, X, ChevronRight, Mic, Volume2, PenTool, Eye } from 'lucide-react';

interface InteractiveLesson {
  id: string;
  title: string;
  description: string;
  category: 'speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  xpReward: number;
  rating: number;
  studentsEnrolled: number;
  isInteractive: boolean;
  hasAI: boolean;
  features: string[];
  thumbnail: string;
  instructor?: string;
  completionRate: number;
}

interface InteractiveLessonsProps {
  onClose: () => void;
  onStartLesson: (lessonId: string) => void;
}

const InteractiveLessons: React.FC<InteractiveLessonsProps> = ({ onClose, onStartLesson }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const lessons: InteractiveLesson[] = [
    {
      id: '1',
      title: 'AI-Powered Conversation Practice',
      description: 'Practice real conversations with our advanced AI that adapts to your level and provides instant feedback.',
      category: 'speaking',
      difficulty: 'intermediate',
      duration: 25,
      xpReward: 100,
      rating: 4.9,
      studentsEnrolled: 15420,
      isInteractive: true,
      hasAI: true,
      features: ['Real-time feedback', 'Voice recognition', 'Adaptive difficulty', 'Progress tracking'],
      thumbnail: '🤖',
      instructor: 'AI Assistant',
      completionRate: 87
    },
    {
      id: '2',
      title: 'Interactive Pronunciation Masterclass',
      description: 'Master English pronunciation with visual feedback, mouth position guides, and AI-powered analysis.',
      category: 'speaking',
      difficulty: 'beginner',
      duration: 30,
      xpReward: 120,
      rating: 4.8,
      studentsEnrolled: 12350,
      isInteractive: true,
      hasAI: true,
      features: ['Visual mouth guides', 'Sound wave analysis', 'IPA notation', 'Recording comparison'],
      thumbnail: '🎤',
      instructor: 'Dr. Sarah Johnson',
      completionRate: 92
    },
    {
      id: '3',
      title: 'Immersive Listening Adventures',
      description: 'Dive into interactive stories where your listening skills determine the outcome of the adventure.',
      category: 'listening',
      difficulty: 'intermediate',
      duration: 35,
      xpReward: 150,
      rating: 4.7,
      studentsEnrolled: 8900,
      isInteractive: true,
      hasAI: false,
      features: ['Interactive storytelling', 'Multiple endings', 'Context clues', 'Comprehension games'],
      thumbnail: '🎧',
      instructor: 'Interactive Team',
      completionRate: 78
    },
    {
      id: '4',
      title: 'Smart Grammar Detective',
      description: 'Solve grammar mysteries using AI-powered hints and explanations. Learn by doing, not memorizing.',
      category: 'grammar',
      difficulty: 'advanced',
      duration: 40,
      xpReward: 180,
      rating: 4.6,
      studentsEnrolled: 6750,
      isInteractive: true,
      hasAI: true,
      features: ['Mystery scenarios', 'AI explanations', 'Pattern recognition', 'Contextual learning'],
      thumbnail: '🔍',
      instructor: 'Prof. Michael Chen',
      completionRate: 85
    },
    {
      id: '5',
      title: 'Virtual Reality Reading Worlds',
      description: 'Explore different worlds while improving reading comprehension through immersive VR experiences.',
      category: 'reading',
      difficulty: 'intermediate',
      duration: 45,
      xpReward: 200,
      rating: 4.9,
      studentsEnrolled: 4200,
      isInteractive: true,
      hasAI: true,
      features: ['VR environments', 'Interactive objects', 'Comprehension quests', 'Adaptive text difficulty'],
      thumbnail: '🌍',
      instructor: 'VR Learning Lab',
      completionRate: 91
    },
    {
      id: '6',
      title: 'AI Writing Coach',
      description: 'Get personalized writing feedback from our AI coach that understands your style and helps you improve.',
      category: 'writing',
      difficulty: 'advanced',
      duration: 50,
      xpReward: 220,
      rating: 4.8,
      studentsEnrolled: 7800,
      isInteractive: true,
      hasAI: true,
      features: ['Style analysis', 'Grammar correction', 'Tone suggestions', 'Plagiarism detection'],
      thumbnail: '✍️',
      instructor: 'AI Writing Assistant',
      completionRate: 89
    },
    {
      id: '7',
      title: 'Vocabulary Memory Palace',
      description: 'Build your vocabulary using memory palace techniques with interactive 3D environments.',
      category: 'vocabulary',
      difficulty: 'beginner',
      duration: 20,
      xpReward: 80,
      rating: 4.7,
      studentsEnrolled: 11200,
      isInteractive: true,
      hasAI: false,
      features: ['3D memory palaces', 'Spaced repetition', 'Visual associations', 'Progress tracking'],
      thumbnail: '🏰',
      instructor: 'Memory Expert Team',
      completionRate: 94
    },
    {
      id: '8',
      title: 'Live Conversation Simulator',
      description: 'Practice conversations in realistic scenarios with AI characters that respond naturally.',
      category: 'speaking',
      difficulty: 'advanced',
      duration: 35,
      xpReward: 160,
      rating: 4.9,
      studentsEnrolled: 9500,
      isInteractive: true,
      hasAI: true,
      features: ['Realistic scenarios', 'Emotion recognition', 'Cultural context', 'Confidence building'],
      thumbnail: '💬',
      instructor: 'Conversation AI',
      completionRate: 86
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: '🎯' },
    { id: 'speaking', label: 'Speaking', icon: '🎤' },
    { id: 'listening', label: 'Listening', icon: '👂' },
    { id: 'reading', label: 'Reading', icon: '📖' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'grammar', label: 'Grammar', icon: '📝' }
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'speaking': return <Mic className="w-4 h-4" />;
      case 'listening': return <Volume2 className="w-4 h-4" />;
      case 'reading': return <Eye className="w-4 h-4" />;
      case 'writing': return <PenTool className="w-4 h-4" />;
      case 'vocabulary': return <BookOpen className="w-4 h-4" />;
      case 'grammar': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Interactive Lessons</h2>
                <p className="text-sm opacity-90">AI-powered learning experiences that adapt to you</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                {difficulties.map(diff => (
                  <option key={diff.id} value={diff.id}>{diff.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Featured Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🌟 Featured Interactive Lessons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.slice(0, 3).map(lesson => (
                <div key={lesson.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{lesson.thumbnail}</div>
                    <div className="flex items-center space-x-1">
                      {lesson.hasAI && <Zap className="w-4 h-4 text-yellow-500" />}
                      <span className="text-sm font-medium text-blue-600">Featured</span>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">{lesson.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-blue-600">
                      {getCategoryIcon(lesson.category)}
                      <span className="text-xs capitalize">{lesson.category}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onStartLesson(lesson.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Learning
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All Lessons */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">All Interactive Lessons</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLessons.map(lesson => (
                <div key={lesson.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{lesson.thumbnail}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                        <div className="flex items-center space-x-1">
                          {lesson.hasAI && (
                            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              <Zap className="w-3 h-3" />
                              <span>AI</span>
                            </div>
                          )}
                          {lesson.isInteractive && (
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              Interactive
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                      
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{lesson.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{lesson.studentsEnrolled.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span>{lesson.xpReward} XP</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                          {lesson.difficulty}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-600">
                          {getCategoryIcon(lesson.category)}
                          <span className="text-xs capitalize">{lesson.category}</span>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {lesson.features.slice(0, 3).map(feature => (
                            <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                          {lesson.features.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{lesson.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Completion Rate</span>
                          <span>{lesson.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${lesson.completionRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          by {lesson.instructor}
                        </div>
                        <button
                          onClick={() => onStartLesson(lesson.id)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredLessons.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Lessons Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLessons;