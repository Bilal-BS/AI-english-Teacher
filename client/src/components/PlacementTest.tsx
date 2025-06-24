import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, X, ArrowRight, Brain, Target, Award, Star, AlertCircle } from 'lucide-react';
import { PlacementTestResult } from '../types';

interface PlacementTestProps {
  onComplete: (result: PlacementTestResult) => void;
  onSkip: () => void;
}

interface TestQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'grammar' | 'vocabulary';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skill: 'grammar' | 'vocabulary' | 'reading' | 'listening';
}

const placementQuestions: TestQuestion[] = [
  // Beginner Level
  {
    id: '1',
    type: 'multiple-choice',
    question: 'What is your name?',
    options: ['My name is John', 'My name John', 'I name is John', 'Name my is John'],
    correctAnswer: 0,
    difficulty: 'beginner',
    skill: 'grammar'
  },
  {
    id: '2',
    type: 'multiple-choice',
    question: 'Choose the correct verb: "She _____ to school every day."',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 1,
    difficulty: 'beginner',
    skill: 'grammar'
  },
  {
    id: '3',
    type: 'multiple-choice',
    question: 'What does "happy" mean?',
    options: ['Sad', 'Angry', 'Joyful', 'Tired'],
    correctAnswer: 2,
    difficulty: 'beginner',
    skill: 'vocabulary'
  },
  {
    id: '4',
    type: 'fill-blank',
    question: 'I _____ a student.',
    correctAnswer: 'am',
    difficulty: 'beginner',
    skill: 'grammar'
  },
  {
    id: '5',
    type: 'multiple-choice',
    question: 'Which is correct?',
    options: ['I have 25 years old', 'I am 25 years old', 'I has 25 years old', 'I be 25 years old'],
    correctAnswer: 1,
    difficulty: 'beginner',
    skill: 'grammar'
  },

  // Intermediate Level
  {
    id: '6',
    type: 'multiple-choice',
    question: 'If I _____ rich, I would travel the world.',
    options: ['am', 'was', 'were', 'be'],
    correctAnswer: 2,
    difficulty: 'intermediate',
    skill: 'grammar'
  },
  {
    id: '7',
    type: 'multiple-choice',
    question: 'She has been working here _____ 2019.',
    options: ['since', 'for', 'from', 'during'],
    correctAnswer: 0,
    difficulty: 'intermediate',
    skill: 'grammar'
  },
  {
    id: '8',
    type: 'multiple-choice',
    question: 'What does "procrastinate" mean?',
    options: ['To work quickly', 'To delay doing something', 'To finish early', 'To work together'],
    correctAnswer: 1,
    difficulty: 'intermediate',
    skill: 'vocabulary'
  },
  {
    id: '9',
    type: 'fill-blank',
    question: 'By the time you arrive, I _____ already left.',
    correctAnswer: 'will have',
    difficulty: 'intermediate',
    skill: 'grammar'
  },
  {
    id: '10',
    type: 'multiple-choice',
    question: 'The meeting was postponed _____ the bad weather.',
    options: ['because', 'due to', 'since', 'as'],
    correctAnswer: 1,
    difficulty: 'intermediate',
    skill: 'grammar'
  },

  // Advanced Level
  {
    id: '11',
    type: 'multiple-choice',
    question: 'Had I known about the traffic, I _____ earlier.',
    options: ['would leave', 'would have left', 'will leave', 'left'],
    correctAnswer: 1,
    difficulty: 'advanced',
    skill: 'grammar'
  },
  {
    id: '12',
    type: 'multiple-choice',
    question: 'What does "ubiquitous" mean?',
    options: ['Rare', 'Present everywhere', 'Ancient', 'Mysterious'],
    correctAnswer: 1,
    difficulty: 'advanced',
    skill: 'vocabulary'
  },
  {
    id: '13',
    type: 'multiple-choice',
    question: 'The proposal was met with _____ criticism from the board.',
    options: ['scathing', 'scalding', 'scorching', 'searing'],
    correctAnswer: 0,
    difficulty: 'advanced',
    skill: 'vocabulary'
  },
  {
    id: '14',
    type: 'fill-blank',
    question: 'Not only _____ he finish the project, but he also exceeded expectations.',
    correctAnswer: 'did',
    difficulty: 'advanced',
    skill: 'grammar'
  },
  {
    id: '15',
    type: 'multiple-choice',
    question: 'The research findings were _____ with previous studies.',
    options: ['consistent', 'persistent', 'resistant', 'insistent'],
    correctAnswer: 0,
    difficulty: 'advanced',
    skill: 'vocabulary'
  }
];

const PlacementTest: React.FC<PlacementTestProps> = ({ onComplete, onSkip }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isStarted, setIsStarted] = useState(false);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<PlacementTestResult | null>(null);
  const [fillBlankError, setFillBlankError] = useState('');

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Use setTimeout to avoid state update conflicts
            setTimeout(() => handleComplete(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateFillBlank = (answer: string): boolean => {
    if (!answer) {
      setFillBlankError('Please enter an answer');
      return false;
    }
    
    const trimmed = answer.trim();
    if (trimmed.length === 0) {
      setFillBlankError('Please enter an answer');
      return false;
    }
    if (trimmed.length > 50) {
      setFillBlankError('Answer is too long (max 50 characters)');
      return false;
    }
    // Allow letters, spaces, hyphens, apostrophes, and basic punctuation
    if (!/^[a-zA-Z\s'\-.,!?]+$/.test(trimmed)) {
      setFillBlankError('Please use only letters, spaces, and basic punctuation');
      return false;
    }
    setFillBlankError('');
    return true;
  };

  const handleAnswer = (answer: string | number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    // For fill-blank questions, sync with input state
    if (placementQuestions[currentQuestion].type === 'fill-blank') {
      const answerStr = answer as string;
      if (fillBlankAnswer !== answerStr) {
        setFillBlankAnswer(answerStr);
      }
    }
  };

  const nextQuestion = () => {
    const question = placementQuestions[currentQuestion];
    
    // Validate fill-blank answers before proceeding
    if (question.type === 'fill-blank') {
      const answer = answers[currentQuestion] as string || '';
      if (!answer.trim() || !validateFillBlank(answer)) {
        return;
      }
    }

    if (currentQuestion < placementQuestions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      
      // Reset fill-blank state for next question
      setTimeout(() => {
        const nextQuestion = placementQuestions[nextIndex];
        if (nextQuestion.type === 'fill-blank') {
          const existingAnswer = answers[nextIndex] as string || '';
          setFillBlankAnswer(existingAnswer);
        } else {
          setFillBlankAnswer('');
        }
        setFillBlankError('');
      }, 0);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const result = calculateResult();
    setTestResult(result);
    setShowResults(true);
  };

  const calculateResult = (): PlacementTestResult => {
    let correctAnswers = 0;
    let beginnerCorrect = 0;
    let intermediateCorrect = 0;
    let advancedCorrect = 0;

    const skillScores = {
      grammar: { correct: 0, total: 0 },
      vocabulary: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 }
    };

    placementQuestions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      if (question.type === 'fill-blank') {
        // For fill-blank questions, check if the answer matches the correct answer
        const correctAnswer = question.correctAnswer as string;
        const userAnswerStr = (userAnswer as string || '').toLowerCase().trim();
        const correctLower = correctAnswer.toLowerCase().trim();
        
        // Check for exact match or key word match
        isCorrect = userAnswerStr === correctLower || 
                   userAnswerStr.includes(correctLower) ||
                   correctLower.includes(userAnswerStr) ||
                   // Handle multi-word answers by checking if user got the key part
                   (correctLower.includes(' ') && correctLower.split(' ').some(word => 
                     word.length > 2 && userAnswerStr.includes(word)));
      } else {
        // For multiple choice questions
        isCorrect = userAnswer === question.correctAnswer;
      }

      if (isCorrect) {
        correctAnswers++;
        
        switch (question.difficulty) {
          case 'beginner':
            beginnerCorrect++;
            break;
          case 'intermediate':
            intermediateCorrect++;
            break;
          case 'advanced':
            advancedCorrect++;
            break;
        }
      }

      skillScores[question.skill].total++;
      if (isCorrect) {
        skillScores[question.skill].correct++;
      }
    });

    const totalScore = Math.round((correctAnswers / placementQuestions.length) * 100);
    
    // Determine level based on performance
    let level: 'beginner' | 'intermediate' | 'advanced';
    if (advancedCorrect >= 3 && totalScore >= 80) {
      level = 'advanced';
    } else if (intermediateCorrect >= 3 && totalScore >= 60) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(skillScores).forEach(([skill, scores]) => {
      const percentage = scores.total > 0 ? (scores.correct / scores.total) * 100 : 0;
      if (percentage >= 70) {
        strengths.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      } else if (percentage < 50) {
        weaknesses.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    if (level === 'beginner') {
      recommendations.push('Focus on basic grammar structures and common vocabulary');
      recommendations.push('Practice daily conversations and simple sentence formation');
      recommendations.push('Start with pronunciation exercises for clear communication');
    } else if (level === 'intermediate') {
      recommendations.push('Work on complex grammar patterns and tenses');
      recommendations.push('Expand vocabulary with academic and professional terms');
      recommendations.push('Practice longer conversations and presentations');
    } else {
      recommendations.push('Focus on advanced grammar and idiomatic expressions');
      recommendations.push('Practice formal writing and presentation skills');
      recommendations.push('Work on nuanced vocabulary and cultural context');
    }

    if (weaknesses.includes('Grammar')) {
      recommendations.push('Dedicate extra time to grammar exercises and rules');
    }
    if (weaknesses.includes('Vocabulary')) {
      recommendations.push('Use flashcards and spaced repetition for vocabulary building');
    }

    return {
      level,
      score: totalScore,
      strengths,
      weaknesses,
      recommendations
    };
  };

  const finishTest = () => {
    if (testResult) {
      onComplete(testResult);
    }
  };

  const handleSkipTest = () => {
    console.log('Skip test clicked');
    onSkip();
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl w-full">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">English Placement Test</h1>
              <p className="text-lg text-gray-600 mb-6">
                Let's assess your current English level to create the perfect learning plan for you.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Test Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>15 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span>15 questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Multiple choice & fill-in</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setIsStarted(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Start Placement Test
              </button>
              
              <button
                onClick={handleSkipTest}
                className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors font-medium"
              >
                Skip for now (you can take it later)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center space-y-6 mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="w-12 h-12 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Complete!</h1>
                <p className="text-lg text-gray-600">Here are your results</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{testResult.score}%</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1 capitalize">{testResult.level}</div>
                    <div className="text-sm text-gray-600">English Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">{answers.filter(a => a !== undefined).length}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Strengths */}
              {testResult.strengths.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Your Strengths
                  </h3>
                  <div className="space-y-2">
                    {testResult.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas to Improve */}
              {testResult.weaknesses.length > 0 && (
                <div className="bg-orange-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Areas to Improve
                  </h3>
                  <div className="space-y-2">
                    {testResult.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-orange-300"></div>
                        <span className="text-orange-700">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Personalized Recommendations</h3>
              <div className="space-y-3">
                {testResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-800 text-sm font-semibold">{index + 1}</span>
                    </div>
                    <span className="text-blue-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={finishTest}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Start Learning Journey
              </button>
              <button
                onClick={handleSkipTest}
                className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = placementQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / placementQuestions.length) * 100;
  const hasAnswer = answers[currentQuestion] !== undefined;
  const isValidAnswer = question.type === 'fill-blank' ? 
    hasAnswer && !fillBlankError && fillBlankAnswer.trim().length > 0 : 
    hasAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Placement Test</h1>
              <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {placementQuestions.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleSkipTest}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Skip Test
              </button>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                question.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                {question.skill}
              </span>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {question.question}
            </h2>

            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-300 ${
                      answers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion] === index && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'fill-blank' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={fillBlankAnswer}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFillBlankAnswer(value);
                    handleAnswer(value);
                    
                    // Clear error when user starts typing
                    if (fillBlankError && value.trim()) {
                      setFillBlankError('');
                    }
                    
                    // Validate on the fly
                    if (value.trim()) {
                      validateFillBlank(value);
                    }
                  }}
                  onBlur={() => {
                    if (fillBlankAnswer.trim()) {
                      validateFillBlank(fillBlankAnswer);
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-lg transition-colors ${
                    fillBlankError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Type your answer here..."
                  maxLength={50}
                />
                {fillBlankError && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{fillBlankError}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600">Fill in the blank with the correct word or phrase.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {isValidAnswer ? 'Answer selected' : 'Select an answer to continue'}
            </div>
            
            <button
              onClick={nextQuestion}
              disabled={!isValidAnswer}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isValidAnswer
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{currentQuestion === placementQuestions.length - 1 ? 'Finish Test' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;