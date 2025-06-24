import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, CheckCircle, X, Volume2, AlertCircle } from 'lucide-react';
import { Lesson, Exercise } from '../types';
import { speechRecognition, SpeechRecognitionResult } from '../utils/speechRecognition';
import { pronunciationAnalyzer, PronunciationAnalysis } from '../utils/pronunciationAnalyzer';
import { userDataManager } from '../utils/userDataManager';

interface LessonInterfaceProps {
  lesson: Lesson;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const LessonInterface: React.FC<LessonInterfaceProps> = ({ lesson, onComplete, onExit }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [exerciseScores, setExerciseScores] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentExercise = lesson.content.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === lesson.content.exercises.length - 1;

  useEffect(() => {
    // Check if speech recognition is supported
    if (!speechRecognition.isAvailable()) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const startRecording = async () => {
    if (!speechRecognition.isAvailable()) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    setIsRecording(true);
    setUserInput('');
    setAnalysis(null);
    setShowFeedback(false);
    setError('');
    setIsProcessing(false);

    try {
      const result: SpeechRecognitionResult = await speechRecognition.startListening();
      
      setIsRecording(false);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (!result.transcript || result.transcript.trim().length === 0) {
        setError('No speech detected. Please try again and speak clearly.');
        return;
      }

      setUserInput(result.transcript);
      setIsProcessing(true);

      // Analyze pronunciation
      let pronunciationAnalysis: PronunciationAnalysis;
      
      if (currentExercise.type === 'conversation' && currentExercise.expectedResponse) {
        pronunciationAnalysis = pronunciationAnalyzer.analyzeConversation(
          currentExercise.expectedResponse,
          result.transcript
        );
      } else if (currentExercise.targetText) {
        pronunciationAnalysis = pronunciationAnalyzer.analyze(
          currentExercise.targetText,
          result.transcript
        );
      } else {
        pronunciationAnalysis = {
          similarity: 0.8,
          accuracy: 0.8,
          fluency: 0.8,
          completeness: 0.8,
          detectedWords: result.transcript.split(' '),
          missedWords: [],
          feedback: ['Good job! Keep practicing.'],
          score: 80
        };
      }

      setAnalysis(pronunciationAnalysis);
      setShowFeedback(true);
      setIsProcessing(false);

      // Save exercise progress
      userDataManager.updateExerciseProgress(
        lesson.id,
        currentExercise.id,
        pronunciationAnalysis.score,
        result.transcript,
        pronunciationAnalysis.feedback
      );

    } catch (error) {
      setIsRecording(false);
      setIsProcessing(false);
      setError('Failed to process speech. Please try again.');
      console.error('Speech recognition error:', error);
    }
  };

  const stopRecording = () => {
    speechRecognition.stopListening();
    setIsRecording(false);
  };

  const playAudio = () => {
    if (currentExercise.audioUrl && audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play();
    } else {
      // For demo purposes, simulate audio playback
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const nextExercise = () => {
    if (analysis) {
      setExerciseScores([...exerciseScores, analysis.score]);
    }
    
    if (isLastExercise) {
      // Calculate final score and complete lesson
      const allScores = [...exerciseScores, analysis?.score || 0];
      const totalScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
      
      // Calculate time spent
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
      
      // Save lesson completion
      userDataManager.completeLessonProgress(lesson.id, totalScore, timeSpent);
      
      onComplete(totalScore);
    } else {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      resetExercise();
    }
  };

  const resetExercise = () => {
    setUserInput('');
    setAnalysis(null);
    setShowFeedback(false);
    setError('');
    setIsProcessing(false);
  };

  const getFeedbackColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onExit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{lesson.title}</h1>
                <p className="text-sm text-gray-600">
                  Exercise {currentExerciseIndex + 1} of {lesson.content.exercises.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentExerciseIndex + 1) / lesson.content.exercises.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {Math.round(((currentExerciseIndex + 1) / lesson.content.exercises.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Exercise Content */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              {currentExercise.type.charAt(0).toUpperCase() + currentExercise.type.slice(1)} Exercise
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {currentExercise.instruction}
            </h2>
            
            {currentExercise.targetText && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-xl text-gray-800 font-medium leading-relaxed">
                  "{currentExercise.targetText}"
                </p>
              </div>
            )}

            {currentExercise.expectedResponse && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-blue-600 font-medium mb-2">Example Response:</p>
                <p className="text-lg text-blue-800 italic">
                  "{currentExercise.expectedResponse}"
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Audio Controls */}
          {currentExercise.audioUrl && (
            <div className="flex justify-center mb-8">
              <button
                onClick={playAudio}
                disabled={isPlaying}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
              </button>
              <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-6 mb-8">
            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || !speechRecognition.isAvailable()}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                {isProcessing ? (
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
              {isRecording && (
                <div className="absolute -inset-2 rounded-full border-4 border-red-300 animate-ping" />
              )}
            </div>
            <p className="text-lg text-gray-600 text-center">
              {isProcessing ? 'Processing your speech...' :
               isRecording ? 'Recording... Speak now!' : 
               'Tap to record your pronunciation'}
            </p>
            {!speechRecognition.isAvailable() && (
              <p className="text-sm text-red-600 text-center">
                Speech recognition requires Chrome, Edge, or Safari browser
              </p>
            )}
          </div>

          {/* User Input Display */}
          {userInput && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">What you said:</h3>
              <p className="text-lg text-blue-900">"{userInput}"</p>
            </div>
          )}

          {/* Detailed Feedback */}
          {showFeedback && analysis && (
            <div className={`border rounded-xl p-6 mb-6 ${getFeedbackColor(analysis.score)}`}>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Your Score: <span className={`text-2xl ${getScoreColor(analysis.score)}`}>
                        {analysis.score}%
                      </span>
                    </h3>
                  </div>
                  
                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm opacity-80 mb-1">Accuracy</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex-1 bg-white/50 rounded-full h-2">
                          <div
                            className="bg-current h-2 rounded-full transition-all duration-500"
                            style={{ width: `${analysis.accuracy * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round(analysis.accuracy * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm opacity-80 mb-1">Fluency</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex-1 bg-white/50 rounded-full h-2">
                          <div
                            className="bg-current h-2 rounded-full transition-all duration-500"
                            style={{ width: `${analysis.fluency * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round(analysis.fluency * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm opacity-80 mb-1">Completeness</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex-1 bg-white/50 rounded-full h-2">
                          <div
                            className="bg-current h-2 rounded-full transition-all duration-500"
                            style={{ width: `${analysis.completeness * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round(analysis.completeness * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm opacity-80 mb-1">Overall</p>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex-1 bg-white/50 rounded-full h-2">
                          <div
                            className="bg-current h-2 rounded-full transition-all duration-500"
                            style={{ width: `${analysis.similarity * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round(analysis.similarity * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Word Analysis */}
                  {analysis.detectedWords.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">✅ Words you got right:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.detectedWords.map((word, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.missedWords.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">❌ Words to work on:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missedWords.map((word, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Messages */}
                  <div className="space-y-2">
                    {analysis.feedback.map((message, index) => (
                      <p key={index} className="text-sm">
                        {message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetExercise}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            {showFeedback && (
              <button
                onClick={nextExercise}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                <span>{isLastExercise ? 'Complete Lesson' : 'Next Exercise'}</span>
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonInterface;