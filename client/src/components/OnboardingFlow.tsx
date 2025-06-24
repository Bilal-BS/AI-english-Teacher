import React, { useState, useCallback } from 'react';
import { Globe, Target, BookOpen, Brain, Users, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (userData: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  nativeLanguage: string;
  englishLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  dailyGoal: number;
  focusAreas: string[];
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [nameError, setNameError] = useState('');
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    nativeLanguage: '',
    englishLevel: 'beginner',
    goals: [],
    dailyGoal: 3,
    focusAreas: []
  });

  const languages = [
    'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
  ];

  const learningGoals = [
    { id: 'travel', label: 'Travel & Tourism', icon: '✈️' },
    { id: 'business', label: 'Business & Career', icon: '💼' },
    { id: 'academic', label: 'Academic Studies', icon: '🎓' },
    { id: 'conversation', label: 'Daily Conversation', icon: '💬' },
    { id: 'exams', label: 'IELTS/TOEFL Prep', icon: '📝' },
    { id: 'culture', label: 'Culture & Entertainment', icon: '🎭' }
  ];

  const focusAreas = [
    { id: 'speaking', label: 'Speaking & Pronunciation', icon: '🎤' },
    { id: 'listening', label: 'Listening Comprehension', icon: '👂' },
    { id: 'reading', label: 'Reading Skills', icon: '📖' },
    { id: 'writing', label: 'Writing Skills', icon: '✍️' },
    { id: 'grammar', label: 'Grammar & Structure', icon: '📚' },
    { id: 'vocabulary', label: 'Vocabulary Building', icon: '🔤' }
  ];

  const steps = [
    {
      title: "Welcome to BS AI Teacher!",
      subtitle: "Let's personalize your English learning journey",
      component: WelcomeStep
    },
    {
      title: "Tell us about yourself",
      subtitle: "Basic information to get started",
      component: PersonalInfoStep
    },
    {
      title: "What are your goals?",
      subtitle: "Choose what you want to achieve",
      component: GoalsStep
    },
    {
      title: "How much time can you dedicate?",
      subtitle: "Set your daily learning goal",
      component: TimeCommitmentStep
    },
    {
      title: "What would you like to focus on?",
      subtitle: "Select your priority areas",
      component: FocusAreasStep
    },
    {
      title: "You're all set!",
      subtitle: "Ready to start your English journey",
      component: CompletionStep
    }
  ];

  const validateName = useCallback((name: string): boolean => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters long');
      return false;
    }
    if (trimmedName.length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
      setNameError('Name can only contain letters, spaces, hyphens, and apostrophes');
      return false;
    }
    setNameError('');
    return true;
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length >= 2 && formData.nativeLanguage !== '';
      case 2:
        return formData.goals.length > 0;
      case 4:
        return formData.focusAreas.length > 0;
      default:
        return true;
    }
  }, [currentStep, formData.name, formData.nativeLanguage, formData.goals.length, formData.focusAreas.length]);

  function WelcomeStep() {
    return (
      <div className="text-center space-y-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Brain className="w-16 h-16 text-white" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Welcome to BS AI Teacher</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Your personal AI English teacher that adapts to your learning style and helps you achieve fluency faster.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-blue-50 p-4 rounded-xl text-center">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-800">AI Speech Analysis</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Personalized Goals</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl text-center">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-800">Interactive Lessons</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl text-center">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-800">Community Support</p>
          </div>
        </div>
        <div className="pt-4">
          <button
            onClick={() => onComplete({
              name: 'Quick Start User',
              nativeLanguage: 'Other',
              englishLevel: 'beginner',
              goals: ['conversation'],
              dailyGoal: 2,
              focusAreas: ['speaking', 'listening']
            })}
            className="text-gray-600 hover:text-gray-800 py-2 transition-colors font-medium underline"
          >
            Skip setup and start learning immediately
          </button>
        </div>
      </div>
    );
  }

  function PersonalInfoStep() {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your name? *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              const newName = e.target.value;
              updateFormData({ name: newName });
            }}
            onBlur={() => {
              if (formData.name.trim()) {
                validateName(formData.name);
              } else {
                setNameError('');
              }
            }}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
            maxLength={50}
          />
          {nameError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {nameError}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will be used to personalize your learning experience
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's your native language? *
          </label>
          <select
            value={formData.nativeLanguage}
            onChange={(e) => updateFormData({ nativeLanguage: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your native language</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate your current English level?
          </label>
          <div className="space-y-3">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'I know basic words and phrases' },
              { value: 'intermediate', label: 'Intermediate', desc: 'I can have simple conversations' },
              { value: 'advanced', label: 'Advanced', desc: 'I can discuss complex topics' }
            ].map(level => (
              <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="englishLevel"
                  value={level.value}
                  checked={formData.englishLevel === level.value}
                  onChange={(e) => updateFormData({ englishLevel: e.target.value as any })}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-800">{level.label}</div>
                  <div className="text-sm text-gray-600">{level.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function GoalsStep() {
    const toggleGoal = (goalId: string) => {
      const newGoals = formData.goals.includes(goalId)
        ? formData.goals.filter(g => g !== goalId)
        : [...formData.goals, goalId];
      updateFormData({ goals: newGoals });
    };

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <p className="text-center text-gray-600">Select all that apply (you can change these later)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningGoals.map(goal => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                formData.goals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{goal.label}</div>
                </div>
                {formData.goals.includes(goal.id) && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function TimeCommitmentStep() {
    const timeOptions = [
      { value: 1, label: '5-10 minutes', desc: 'Quick daily practice' },
      { value: 2, label: '15-20 minutes', desc: 'Focused learning sessions' },
      { value: 3, label: '30-45 minutes', desc: 'Comprehensive practice' },
      { value: 5, label: '1+ hour', desc: 'Intensive learning' }
    ];

    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center">
          <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Consistency is key to language learning success!</p>
        </div>
        
        <div className="space-y-3">
          {timeOptions.map(option => (
            <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="dailyGoal"
                value={option.value}
                checked={formData.dailyGoal === option.value}
                onChange={(e) => updateFormData({ dailyGoal: parseInt(e.target.value) })}
                className="mr-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-800">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function FocusAreasStep() {
    const toggleFocusArea = (areaId: string) => {
      const newAreas = formData.focusAreas.includes(areaId)
        ? formData.focusAreas.filter(a => a !== areaId)
        : [...formData.focusAreas, areaId];
      updateFormData({ focusAreas: newAreas });
    };

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <p className="text-center text-gray-600">Choose 2-4 areas you'd like to focus on most</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {focusAreas.map(area => (
            <button
              key={area.id}
              onClick={() => toggleFocusArea(area.id)}
              className={`p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                formData.focusAreas.includes(area.id)
                  ? 'border-purple-500 bg-purple-50 text-purple-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{area.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{area.label}</div>
                </div>
                {formData.focusAreas.includes(area.id) && (
                  <Check className="w-5 h-5 text-purple-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function CompletionStep() {
    return (
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Perfect, {formData.name}!</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Your personalized learning plan is ready. Let's start with a quick placement test to fine-tune your experience.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-3">Your Learning Profile</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>📍 Level: {formData.englishLevel}</div>
            <div>🌍 Native Language: {formData.nativeLanguage}</div>
            <div>🎯 Goals: {formData.goals.length} selected</div>
            <div>⏰ Daily Goal: {formData.dailyGoal} lessons</div>
            <div>🎯 Focus Areas: {formData.focusAreas.length} selected</div>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <CurrentStepComponent />

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                isStepValid()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{currentStep === steps.length - 1 ? 'Start Learning' : 'Continue'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;