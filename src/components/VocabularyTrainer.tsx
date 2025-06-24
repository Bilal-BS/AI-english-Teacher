import React, { useState, useEffect } from 'react';
import { BookOpen, RotateCcw, Volume2, Star, CheckCircle, X, Brain, Target } from 'lucide-react';
import { VocabularyCard } from '../types';

interface VocabularyTrainerProps {
  onClose: () => void;
  onProgress: (masteredWords: number) => void;
}

const VocabularyTrainer: React.FC<VocabularyTrainerProps> = ({ onClose, onProgress }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [studyMode, setStudyMode] = useState<'learn' | 'review' | 'test'>('learn');
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // Sample vocabulary cards
  const [vocabularyCards] = useState<VocabularyCard[]>([
    {
      id: '1',
      word: 'Ambitious',
      definition: 'Having a strong desire for success or achievement',
      pronunciation: '/æmˈbɪʃəs/',
      example: 'She is very ambitious and wants to become a CEO.',
      difficulty: 'intermediate',
      category: 'personality',
      mastered: false,
      reviewCount: 0,
      nextReview: new Date()
    },
    {
      id: '2',
      word: 'Procrastinate',
      definition: 'To delay or postpone action; to put off doing something',
      pronunciation: '/proʊˈkræstɪˌneɪt/',
      example: 'I tend to procrastinate when I have difficult tasks to complete.',
      difficulty: 'advanced',
      category: 'behavior',
      mastered: false,
      reviewCount: 0,
      nextReview: new Date()
    },
    {
      id: '3',
      word: 'Resilient',
      definition: 'Able to recover quickly from difficult conditions',
      pronunciation: '/rɪˈzɪljənt/',
      example: 'Children are often more resilient than adults when facing challenges.',
      difficulty: 'advanced',
      category: 'personality',
      mastered: false,
      reviewCount: 0,
      nextReview: new Date()
    },
    {
      id: '4',
      word: 'Collaborate',
      definition: 'To work jointly with others or together especially in an intellectual endeavor',
      pronunciation: '/kəˈlæbəˌreɪt/',
      example: 'We need to collaborate with other departments to complete this project.',
      difficulty: 'intermediate',
      category: 'work',
      mastered: false,
      reviewCount: 0,
      nextReview: new Date()
    },
    {
      id: '5',
      word: 'Innovative',
      definition: 'Featuring new methods; advanced and original',
      pronunciation: '/ˈɪnəˌveɪtɪv/',
      example: 'The company is known for its innovative approach to technology.',
      difficulty: 'intermediate',
      category: 'business',
      mastered: false,
      reviewCount: 0,
      nextReview: new Date()
    }
  ]);

  const card = vocabularyCards[currentCard];

  const nextCard = () => {
    if (currentCard < vocabularyCards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      setCurrentCard(0);
    }
    resetCard();
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    } else {
      setCurrentCard(vocabularyCards.length - 1);
    }
    resetCard();
  };

  const resetCard = () => {
    setShowDefinition(false);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  const handleFlip = () => {
    setShowDefinition(!showDefinition);
  };

  const handleTestAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === card.word.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct && !card.mastered) {
      card.mastered = true;
      setMasteredCount(prev => prev + 1);
      onProgress(masteredCount + 1);
    }
  };

  const playPronunciation = () => {
    // In a real app, this would play audio
    console.log(`Playing pronunciation for: ${card.word}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Vocabulary Trainer</h2>
                <p className="text-sm opacity-90">Master new words with spaced repetition</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {['learn', 'review', 'test'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setStudyMode(mode as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    studyMode === mode
                      ? 'bg-white text-purple-600'
                      : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <div className="text-sm">
              {currentCard + 1} / {vocabularyCards.length}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {studyMode === 'learn' && (
            <div className="space-y-6">
              {/* Card */}
              <div 
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={handleFlip}
              >
                <div className="text-center space-y-4">
                  {!showDefinition ? (
                    <>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                          {card.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {card.category}
                        </span>
                      </div>
                      <h3 className="text-4xl font-bold text-gray-800 mb-2">{card.word}</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg text-gray-600">{card.pronunciation}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation();
                          }}
                          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                        >
                          <Volume2 className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                      <p className="text-gray-500 mt-4">Click to see definition</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{card.word}</h3>
                      <p className="text-lg text-gray-700 mb-4">{card.definition}</p>
                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Example:</p>
                        <p className="text-gray-800 italic">"{card.example}"</p>
                      </div>
                      <p className="text-gray-500 mt-4">Click to flip back</p>
                    </>
                  )}
                </div>
              </div>

              {/* Mastery Buttons */}
              {showDefinition && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      // Mark as difficult
                      nextCard();
                    }}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                  >
                    Difficult
                  </button>
                  <button
                    onClick={() => {
                      // Mark as good
                      nextCard();
                    }}
                    className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => {
                      // Mark as easy/mastered
                      card.mastered = true;
                      setMasteredCount(prev => prev + 1);
                      nextCard();
                    }}
                    className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                  >
                    Easy
                  </button>
                </div>
              )}
            </div>
          )}

          {studyMode === 'test' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Test Your Knowledge</h3>
                <p className="text-gray-600">What does this word mean?</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Definition:</p>
                <p className="text-lg text-gray-800">{card.definition}</p>
              </div>

              {!showResult ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type the word..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg text-center"
                  />
                  <button
                    onClick={handleTestAnswer}
                    disabled={!userAnswer.trim()}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                      userAnswer.trim()
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl text-center ${
                    isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <X className="w-6 h-6" />
                      )}
                      <span className="font-semibold">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <p>The word is: <strong>{card.word}</strong></p>
                    {!isCorrect && (
                      <p className="text-sm mt-2">Your answer: {userAnswer}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      nextCard();
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  >
                    Next Word
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevCard}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{masteredCount} mastered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span>{vocabularyCards.length - masteredCount} remaining</span>
              </div>
            </div>

            <button
              onClick={nextCard}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>Next</span>
              <RotateCcw className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyTrainer;