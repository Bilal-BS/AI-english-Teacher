import React, { useState, useEffect } from 'react';
import { Target, Calendar, TrendingUp, Award, CheckCircle, Plus, Edit3, Trash2, X, Clock, Star } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'speaking' | 'listening' | 'reading' | 'writing' | 'vocabulary' | 'grammar';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
}

interface PersonalizedGoalsProps {
  onClose: () => void;
  onGoalComplete: (xp: number) => void;
}

const PersonalizedGoals: React.FC<PersonalizedGoalsProps> = ({ onClose, onGoalComplete }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize with some default goals
  useEffect(() => {
    const defaultGoals: Goal[] = [
      {
        id: '1',
        title: 'Daily Speaking Practice',
        description: 'Practice speaking for at least 15 minutes every day',
        category: 'speaking',
        targetValue: 30,
        currentValue: 12,
        unit: 'days',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'high',
        isCompleted: false,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Vocabulary Expansion',
        description: 'Learn 100 new vocabulary words this month',
        category: 'vocabulary',
        targetValue: 100,
        currentValue: 45,
        unit: 'words',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        isCompleted: false,
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'Grammar Mastery',
        description: 'Complete all intermediate grammar lessons',
        category: 'grammar',
        targetValue: 15,
        currentValue: 15,
        unit: 'lessons',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        isCompleted: true,
        createdAt: new Date()
      },
      {
        id: '4',
        title: 'Listening Comprehension',
        description: 'Watch 20 English videos with subtitles',
        category: 'listening',
        targetValue: 20,
        currentValue: 8,
        unit: 'videos',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        priority: 'low',
        isCompleted: false,
        createdAt: new Date()
      }
    ];
    setGoals(defaultGoals);
  }, []);

  const categories = [
    { id: 'all', label: 'All Goals', icon: '🎯' },
    { id: 'speaking', label: 'Speaking', icon: '🎤' },
    { id: 'listening', label: 'Listening', icon: '👂' },
    { id: 'reading', label: 'Reading', icon: '📖' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { id: 'grammar', label: 'Grammar', icon: '📝' }
  ];

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const categoryColors = {
    speaking: 'from-blue-500 to-blue-600',
    listening: 'from-green-500 to-green-600',
    reading: 'from-purple-500 to-purple-600',
    writing: 'from-indigo-500 to-indigo-600',
    vocabulary: 'from-pink-500 to-pink-600',
    grammar: 'from-orange-500 to-orange-600'
  };

  const filteredGoals = goals.filter(goal => 
    selectedCategory === 'all' || goal.category === selectedCategory
  );

  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleCompleteGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId && !goal.isCompleted) {
        const xpReward = goal.priority === 'high' ? 100 : goal.priority === 'medium' ? 75 : 50;
        onGoalComplete(xpReward);
        return { ...goal, isCompleted: true, currentValue: goal.targetValue };
      }
      return goal;
    }));
  };

  const handleUpdateProgress = (goalId: string, newValue: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, currentValue: Math.min(newValue, goal.targetValue) };
        if (updatedGoal.currentValue >= updatedGoal.targetValue && !updatedGoal.isCompleted) {
          updatedGoal.isCompleted = true;
          const xpReward = goal.priority === 'high' ? 100 : goal.priority === 'medium' ? 75 : 50;
          onGoalComplete(xpReward);
        }
        return updatedGoal;
      }
      return goal;
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const NewGoalForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'speaking' as Goal['category'],
      targetValue: 1,
      unit: 'days',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium' as Goal['priority']
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...formData,
        deadline: new Date(formData.deadline),
        currentValue: 0,
        isCompleted: false,
        createdAt: new Date()
      };
      setGoals(prev => [...prev, newGoal]);
      setShowNewGoal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., days, words, lessons"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowNewGoal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Personalized Goals</h2>
                <p className="text-sm opacity-90">Track your progress and achieve your learning objectives</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Overall Progress */}
          <div className="bg-white bg-opacity-20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-sm">{completedGoals}/{totalGoals} goals completed</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-6 border-r border-gray-200">
            <div className="space-y-4">
              <button
                onClick={() => setShowNewGoal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Goal</span>
              </button>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Goals</span>
                    <span className="font-semibold">{goals.filter(g => !g.isCompleted).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">{completedGoals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGoals.map(goal => (
                <div key={goal.id} className={`bg-white rounded-2xl p-6 border-l-4 ${
                  goal.isCompleted ? 'border-green-500' : 'border-gray-300'
                } hover:shadow-lg transition-shadow`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-semibold ${goal.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                          {goal.title}
                        </h3>
                        {goal.isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[goal.priority]}`}>
                          {goal.priority} priority
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">
                        {goal.currentValue}/{goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${categoryColors[goal.category]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${getProgressPercentage(goal.currentValue, goal.targetValue)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Deadline */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {getDaysUntilDeadline(goal.deadline) > 0 
                          ? `${getDaysUntilDeadline(goal.deadline)} days left`
                          : 'Overdue'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {!goal.isCompleted && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateProgress(goal.id, goal.currentValue + 1)}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                      >
                        +1 Progress
                      </button>
                      {goal.currentValue >= goal.targetValue && (
                        <button
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                  
                  {goal.isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <Star className="w-4 h-4" />
                        <span className="font-medium">Goal Completed!</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredGoals.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Goals Found</h3>
                <p className="text-gray-600 mb-6">
                  {selectedCategory === 'all' 
                    ? 'Create your first goal to start tracking your progress'
                    : `No goals found in the ${selectedCategory} category`
                  }
                </p>
                <button
                  onClick={() => setShowNewGoal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>
        </div>
        
        {showNewGoal && <NewGoalForm />}
      </div>
    </div>
  );
};

export default PersonalizedGoals;