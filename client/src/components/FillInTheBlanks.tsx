import React, { useState, useEffect } from 'react';
import { CheckCircle, X, RotateCcw, Lightbulb, Target, Award, Clock } from 'lucide-react';

interface FillInTheBlanksProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface BlankExercise {
  id: string;
  sentence: string;
  blanks: {
    position: number;
    correctAnswer: string;
    alternatives?: string[];
    hint?: string;
  }[];
  category: 'grammar' | 'vocabulary' | 'prepositions' | 'tenses';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
}

const FillInTheBlanks: React.FC<FillInTheBlanksProps> = ({ onClose, onComplete }) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const exercises: BlankExercise[] = [
    // Beginner Level
    {
      id: '1',
      sentence: 'I _____ a student at the university.',
      blanks: [
        {
          position: 2,
          correctAnswer: 'am',
          alternatives: ['am'],
          hint: 'Use the verb "to be" for "I"'
        }
      ],
      category: 'grammar',
      difficulty: 'beginner',
      explanation: 'We use "am" with the pronoun "I" in the present tense.'
    },
    {
      id: '2',
      sentence: 'She _____ to school every day.',
      blanks: [
        {
          position: 2,
          correctAnswer: 'goes',
          alternatives: ['goes'],
          hint: 'Third person singular present tense'
        }
      ],
      category: 'grammar',
      difficulty: 'beginner',
      explanation: 'With third person singular (he/she/it), we add "s" to the verb in present tense.'
    },
    {
      id: '3',
      sentence: 'The cat is _____ the table.',
      blanks: [
        {
          position: 4,
          correctAnswer: 'on',
          alternatives: ['on', 'under', 'beside'],
          hint: 'Think about position/location'
        }
      ],
      category: 'prepositions',
      difficulty: 'beginner',
      explanation: 'Prepositions show the relationship between objects in space.'
    },
    {
      id: '4',
      sentence: 'I _____ coffee every morning.',
      blanks: [
        {
          position: 2,
          correctAnswer: 'drink',
          alternatives: ['drink', 'have'],
          hint: 'What do you do with coffee?'
        }
      ],
      category: 'vocabulary',
      difficulty: 'beginner',
      explanation: 'We "drink" liquids like coffee, tea, or water.'
    },

    // Intermediate Level
    {
      id: '5',
      sentence: 'If I _____ more time, I would learn Spanish.',
      blanks: [
        {
          position: 3,
          correctAnswer: 'had',
          alternatives: ['had'],
          hint: 'Second conditional - hypothetical situation'
        }
      ],
      category: 'grammar',
      difficulty: 'intermediate',
      explanation: 'In second conditional, we use "if + past simple" for hypothetical situations.'
    },
    {
      id: '6',
      sentence: 'She has been _____ here since 2020.',
      blanks: [
        {
          position: 4,
          correctAnswer: 'working',
          alternatives: ['working', 'living'],
          hint: 'Present perfect continuous tense'
        }
      ],
      category: 'tenses',
      difficulty: 'intermediate',
      explanation: 'Present perfect continuous shows an action that started in the past and continues now.'
    },
    {
      id: '7',
      sentence: 'The project was _____ by the team yesterday.',
      blanks: [
        {
          position: 4,
          correctAnswer: 'completed',
          alternatives: ['completed', 'finished'],
          hint: 'Passive voice - past participle'
        }
      ],
      category: 'grammar',
      difficulty: 'intermediate',
      explanation: 'In passive voice, we use "was/were + past participle".'
    },
    {
      id: '8',
      sentence: 'I\'m looking forward _____ meeting you.',
      blanks: [
        {
          position: 4,
          correctAnswer: 'to',
          alternatives: ['to'],
          hint: 'Phrasal verb + preposition'
        }
      ],
      category: 'prepositions',
      difficulty: 'intermediate',
      explanation: '"Look forward to" is always followed by the preposition "to".'
    },

    // Advanced Level
    {
      id: '9',
      sentence: 'Had I known about the meeting, I _____ attended.',
      blanks: [
        {
          position: 8,
          correctAnswer: 'would have',
          alternatives: ['would have'],
          hint: 'Third conditional - past hypothetical'
        }
      ],
      category: 'grammar',
      difficulty: 'advanced',
      explanation: 'Third conditional uses "had + past participle" and "would have + past participle".'
    },
    {
      id: '10',
      sentence: 'The research _____ that climate change is accelerating.',
      blanks: [
        {
          position: 3,
          correctAnswer: 'indicates',
          alternatives: ['indicates', 'suggests', 'shows'],
          hint: 'Academic vocabulary for presenting findings'
        }
      ],
      category: 'vocabulary',
      difficulty: 'advanced',
      explanation: 'Academic verbs like "indicates" are used to present research findings.'
    },
    {
      id: '11',
      sentence: 'Not only _____ he finish the project, but he also exceeded expectations.',
      blanks: [
        {
          position: 3,
          correctAnswer: 'did',
          alternatives: ['did'],
          hint: 'Inversion after "not only"'
        }
      ],
      category: 'grammar',
      difficulty: 'advanced',
      explanation: 'After "not only" at the beginning of a sentence, we use inversion (auxiliary + subject).'
    },
    {
      id: '12',
      sentence: 'The proposal was met _____ fierce opposition.',
      blanks: [
        {
          position: 5,
          correctAnswer: 'with',
          alternatives: ['with'],
          hint: 'Phrasal verb "met with"'
        }
      ],
      category: 'prepositions',
      difficulty: 'advanced',
      explanation: '"Met with" means to encounter or experience something.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'grammar', label: 'Grammar' },
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'prepositions', label: 'Prepositions' },
    { id: 'tenses', label: 'Tenses' }
  ];

  const filteredExercises = exercises.filter(ex => 
    selectedCategory === 'all' || ex.category === selectedCategory
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Reset when category changes
    setCurrentExercise(0);
    setUserAnswers([]);
    setShowResults(false);
    setExerciseResults([]);
  }, [selectedCategory]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentExercise = () => filteredExercises[currentExercise];

  const renderSentenceWithBlanks = (exercise: BlankExercise) => {
    const words = exercise.sentence.split(' ');
    return words.map((word, index) => {
      const blank = exercise.blanks.find(b => b.position === index + 1);
      if (blank) {
        const blankIndex = exercise.blanks.indexOf(blank);
        return (
          <span key={index} className="inline-block mx-1">
            <input
              type="text"
              value={userAnswers[blankIndex] || ''}
              onChange={(e) => {
                const newAnswers = [...userAnswers];
                newAnswers[blankIndex] = e.target.value;
                setUserAnswers(newAnswers);
              }}
              className="px-2 py-1 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none text-center min-w-[80px]"
              placeholder="___"
            />
          </span>
        );
      }
      return <span key={index} className="mx-1">{word}</span>;
    });
  };

  const checkAnswers = () => {
    const exercise = getCurrentExercise();
    const results = exercise.blanks.map((blank, index) => {
      const userAnswer = userAnswers[index]?.toLowerCase().trim();
      const correctAnswer = blank.correctAnswer.toLowerCase();
      const alternatives = blank.alternatives?.map(alt => alt.toLowerCase()) || [];
      
      return userAnswer === correctAnswer || alternatives.includes(userAnswer);
    });
    
    setExerciseResults(results);
    setShowResults(true);
  };

  const nextExercise = () => {
    if (currentExercise < filteredExercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserAnswers([]);
      setShowResults(false);
      setExerciseResults([]);
      setShowHints(false);
    } else {
      // Calculate final score
      const totalExercises = filteredExercises.length;
      const correctExercises = exerciseResults.filter(result => 
        result === true || (Array.isArray(result) && result.every(r => r))
      ).length;
      const score = Math.round((correctExercises / totalExercises) * 100);
      onComplete(score);
    }
  };

  const resetExercise = () => {
    setUserAnswers([]);
    setShowResults(false);
    setExerciseResults([]);
    setShowHints(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'grammar': return 'bg-blue-100 text-blue-800';
      case 'vocabulary': return 'bg-purple-100 text-purple-800';
      case 'prepositions': return 'bg-orange-100 text-orange-800';
      case 'tenses': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (filteredExercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Exercises Found</h3>
          <p className="text-gray-600 mb-6">No exercises available for the selected category.</p>
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const exercise = getCurrentExercise();
  const progress = ((currentExercise + 1) / filteredExercises.length) * 100;
  const allBlanksCompleted = userAnswers.length === exercise.blanks.length && 
                            userAnswers.every(answer => answer.trim().length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Fill in the Blanks</h2>
                <p className="text-sm opacity-90">Complete the sentences with the correct words</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm opacity-90">Time</div>
                <div className="font-mono text-lg">{formatTime(timeSpent)}</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span>Exercise {currentExercise + 1} of {filteredExercises.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Exercise Info */}
          <div className="flex items-center space-x-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
              {exercise.difficulty}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
              {exercise.category}
            </span>
          </div>

          {/* Sentence with Blanks */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-6">
            <div className="text-xl leading-relaxed text-center">
              {renderSentenceWithBlanks(exercise)}
            </div>
          </div>

          {/* Hints */}
          {exercise.blanks.some(blank => blank.hint) && (
            <div className="mb-6">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </span>
              </button>
              
              {showHints && (
                <div className="mt-3 space-y-2">
                  {exercise.blanks.map((blank, index) => (
                    blank.hint && (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Hint {index + 1}:</strong> {blank.hint}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-semibold text-blue-800 mb-4">Results</h3>
                <div className="space-y-3">
                  {exercise.blanks.map((blank, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        Blank {index + 1}: <strong>{blank.correctAnswer}</strong>
                        {blank.alternatives && blank.alternatives.length > 1 && (
                          <span className="text-xs text-blue-600 ml-2">
                            (or: {blank.alternatives.filter(alt => alt !== blank.correctAnswer).join(', ')})
                          </span>
                        )}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Your answer: {userAnswers[index] || 'Empty'}</span>
                        {exerciseResults[index] ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {exercise.explanation && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Explanation</h4>
                    <p className="text-sm text-blue-700">{exercise.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={resetExercise}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <div className="flex space-x-3">
              {!showResults ? (
                <button
                  onClick={checkAnswers}
                  disabled={!allBlanksCompleted}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    allBlanksCompleted
                      ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Check Answers
                </button>
              ) : (
                <button
                  onClick={nextExercise}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  {currentExercise === filteredExercises.length - 1 ? (
                    <>
                      <Award className="w-5 h-5" />
                      <span>Complete Session</span>
                    </>
                  ) : (
                    <>
                      <span>Next Exercise</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlanks;