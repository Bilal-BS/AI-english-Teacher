import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Trophy, Target, CheckCircle, X } from 'lucide-react';
import { DailyChallenge as DailyChallengeType, Exercise } from '../types';

interface DailyChallengeProps {
  onComplete: (xp: number) => void;
  onClose: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onComplete, onClose }) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<(string | number)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Generate today's challenge
  const generateDailyChallenge = (): DailyChallengeType => {
    const today = new Date().toISOString().split('T')[0];
    const challengeTypes = ['vocabulary', 'grammar', 'pronunciation'] as const;
    const type = challengeTypes[new Date().getDate() % challengeTypes.length];

    const challenges = {
      vocabulary: {
        title: "Word Power Challenge",
        description: "Test your vocabulary knowledge with these words",
        exercises: [
          {
            id: 'v1',
            type: 'multiple-choice' as const,
            instruction: 'What does "ambitious" mean?',
            options: ['Lazy', 'Having strong desire for success', 'Confused', 'Tired'],
            correctAnswer: 1,
            completed: false
          },
          {
            id: 'v2',
            type: 'multiple-choice' as const,
            instruction: 'Choose the synonym for "enormous":',
            options: ['Tiny', 'Huge', 'Medium', 'Narrow'],
            correctAnswer: 1,
            completed: false
          },
          {
            id: 'v3',
            type: 'multiple-choice' as const,
            instruction: 'What does "procrastinate" mean?',
            options: ['To work quickly', 'To delay doing something', 'To celebrate', 'To organize'],
            correctAnswer: 1,
            completed: false
          }
        ]
      },
      grammar: {
        title: "Grammar Master Challenge",
        description: "Perfect your grammar skills",
        exercises: [
          {
            id: 'g1',
            type: 'multiple-choice' as const,
            instruction: 'Choose the correct form: "She _____ to the store yesterday."',
            options: ['go', 'goes', 'went', 'going'],
            correctAnswer: 2,
            completed: false
          },
          {
            id: 'g2',
            type: 'multiple-choice' as const,
            instruction: 'Which is correct?',
            options: ['I have went there', 'I have gone there', 'I has gone there', 'I had went there'],
            correctAnswer: 1,
            completed: false
          },
          {
            id: 'g3',
            type: 'multiple-choice' as const,
            instruction: 'Complete: "If I _____ rich, I would travel the world."',
            options: ['am', 'was', 'were', 'be'],
            correctAnswer: 2,
            completed: false
          }
        ]
      },
      pronunciation: {
        title: "Pronunciation Practice",
        description: "Master difficult English sounds",
        exercises: [
          {
            id: 'p1',
            type: 'multiple-choice' as const,
            instruction: 'Which word has the /θ/ sound (as in "think")?',
            options: ['This', 'Think', 'The', 'That'],
            correctAnswer: 1,
            completed: false
          },
          {
            id: 'p2',
            type: 'multiple-choice' as const,
            instruction: 'Which word rhymes with "through"?',
            options: ['Throw', 'Though', 'Tough', 'Blue'],
            correctAnswer: 3,
            completed: false
          },
          {
            id: 'p3',
            type: 'multiple-choice' as const,
            instruction: 'How many syllables are in "comfortable"?',
            options: ['2', '3', '4', '5'],
            correctAnswer: 1,
            completed: false
          }
        ]
      }
    };

    return {
      id: `daily-${today}`,
      date: today,
      type,
      title: challenges[type].title,
      description: challenges[type].description,
      exercises: challenges[type].exercises,
      xpReward: 50,
      completed: false
    };
  };

  const [challenge] = useState<DailyChallengeType>(generateDailyChallenge);

  const handleAnswer = (answer: string | number) => {
    const newAnswers = [...answers];
    newAnswers[currentExercise] = answer;
    setAnswers(newAnswers);
  };

  const nextExercise = () => {
    if (currentExercise < challenge.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    challenge.exercises.forEach((exercise, index) => {
      if (answers[index] === exercise.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / challenge.exercises.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const handleComplete = () => {
    const xpEarned = Math.round((score / 100) * challenge.xpReward);
    onComplete(xpEarned);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return '📚';
      case 'grammar': return '📝';
      case 'pronunciation': return '🎤';
      default: return '🎯';
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'from-purple-500 to-pink-500';
      case 'grammar': return 'from-blue-500 to-cyan-500';
      case 'pronunciation': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Challenge Complete!</h2>
              <p className="text-gray-600">Great job on today's challenge</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    +{Math.round((score / 100) * challenge.xpReward)}
                  </div>
                  <div className="text-sm text-gray-600">XP Earned</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {challenge.exercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Question {index + 1}</span>
                  {answers[index] === exercise.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Claim Reward
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exercise = challenge.exercises[currentExercise];
  const progress = ((currentExercise + 1) / challenge.exercises.length) * 100;
  const hasAnswer = answers[currentExercise] !== undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getChallengeColor(challenge.type)} p-6 rounded-t-3xl text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getChallengeIcon(challenge.type)}</span>
              <div>
                <h2 className="text-xl font-bold">{challenge.title}</h2>
                <p className="text-sm opacity-90">{challenge.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span>Question {currentExercise + 1} of {challenge.exercises.length}</span>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>+{challenge.xpReward} XP</span>
            </div>
          </div>
          
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-3">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {exercise.instruction}
            </h3>

            {exercise.type === 'multiple-choice' && exercise.options && (
              <div className="space-y-3">
                {exercise.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-300 ${
                      answers[currentExercise] === index
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentExercise] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentExercise] === index && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {hasAnswer ? 'Answer selected' : 'Select an answer to continue'}
            </div>
            
            <button
              onClick={nextExercise}
              disabled={!hasAnswer}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                hasAnswer
                  ? `bg-gradient-to-r ${getChallengeColor(challenge.type)} text-white hover:scale-105`
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentExercise === challenge.exercises.length - 1 ? 'Finish Challenge' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;