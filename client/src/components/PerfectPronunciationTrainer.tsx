import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, X, Target, Award, TrendingUp, Eye } from 'lucide-react';
import { speechRecognition, SpeechRecognitionResult } from '../utils/speechRecognition';
import { advancedPronunciationAnalyzer, PronunciationAnalysis, difficultSounds } from '../utils/advancedPronunciationAnalyzer';

interface PerfectPronunciationTrainerProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface PronunciationChallenge {
  id: string;
  type: 'minimal_pairs' | 'tongue_twisters' | 'sound_focus' | 'connected_speech';
  title: string;
  instruction: string;
  targetText: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusSound: string;
  tips: string[];
  examples: string[];
}

const pronunciationChallenges: PronunciationChallenge[] = [
  {
    id: 'th_1',
    type: 'minimal_pairs',
    title: 'TH Sound Mastery',
    instruction: 'Practice the TH sound with perfect tongue placement',
    targetText: 'Think about three thick things. This, that, there, they think.',
    difficulty: 'advanced',
    focusSound: '/θ/ and /ð/',
    tips: [
      'Place tongue lightly between teeth',
      'Feel air flowing over tongue',
      'Voice vibrates for "this", no vibration for "think"'
    ],
    examples: ['think - sink', 'this - dis', 'three - tree', 'thank - tank']
  },
  {
    id: 'rl_1',
    type: 'minimal_pairs',
    title: 'R vs L Perfection',
    instruction: 'Master the difference between R and L sounds',
    targetText: 'Red lorry, yellow lorry. Really light, little right.',
    difficulty: 'intermediate',
    focusSound: '/r/ and /l/',
    tips: [
      'R: Curl tongue tip back, don\'t touch roof',
      'L: Touch tongue tip to roof of mouth',
      'Practice slowly, then increase speed'
    ],
    examples: ['red - led', 'right - light', 'very - belly', 'sorry - solly']
  },
  {
    id: 'vw_1',
    type: 'sound_focus',
    title: 'V vs W Precision',
    instruction: 'Perfect the lip movements for V and W',
    targetText: 'Very wet weather with wonderful waves.',
    difficulty: 'beginner',
    focusSound: '/v/ and /w/',
    tips: [
      'V: Upper teeth touch lower lip',
      'W: Round lips like saying "oo"',
      'Feel vibration for V, no teeth for W'
    ],
    examples: ['very - wary', 'vest - west', 'vine - wine', 'voice - woise']
  },
  {
    id: 'vowels_1',
    type: 'minimal_pairs',
    title: 'Short vs Long Vowels',
    instruction: 'Distinguish between short and long vowel sounds',
    targetText: 'Bit beat, sit seat, ship sheep, fill feel.',
    difficulty: 'intermediate',
    focusSound: '/ɪ/ vs /i:/',
    tips: [
      'Short I: Quick, relaxed tongue',
      'Long E: Tense, spread lips',
      'Feel the length difference'
    ],
    examples: ['bit - beat', 'sit - seat', 'ship - sheep', 'fill - feel']
  },
  {
    id: 'schwa_1',
    type: 'connected_speech',
    title: 'Schwa and Stress Mastery',
    instruction: 'Use the schwa sound in unstressed syllables',
    targetText: 'About a problem with a camera in America.',
    difficulty: 'advanced',
    focusSound: '/ə/ schwa',
    tips: [
      'Schwa is the most relaxed vowel',
      'Only in unstressed syllables',
      'Very quick and neutral'
    ],
    examples: ['about', 'problem', 'camera', 'America']
  },
  {
    id: 'linking_1',
    type: 'connected_speech',
    title: 'Connected Speech Patterns',
    instruction: 'Link words together naturally like native speakers',
    targetText: 'I\'ll pick it up at eight o\'clock in an hour.',
    difficulty: 'advanced',
    focusSound: 'Linking sounds',
    tips: [
      'Connect consonant to vowel',
      'Link similar sounds together',
      'Use weak forms for function words'
    ],
    examples: ['pick_it_up', 'at_eight', 'in_an_hour', 'I\'ll = I will']
  }
];

const PerfectPronunciationTrainer: React.FC<PerfectPronunciationTrainerProps> = ({ onClose, onComplete }) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState<PronunciationAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<PronunciationAnalysis | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [perfectAttempts, setPerfectAttempts] = useState(0);
  const [error, setError] = useState<string>('');

  const challenge = pronunciationChallenges[currentChallenge];

  const handleStartRecording = async () => {
    setIsRecording(true);
    setIsProcessing(false);
    
    try {
      const result: SpeechRecognitionResult = await speechRecognition.startListening();
      setIsRecording(false);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.transcript) {
        setIsProcessing(true);
        
        try {
          const analysis = await advancedPronunciationAnalyzer.analyzePronunciation(
            challenge.targetText,
            result.transcript
          );
          
          setCurrentAnalysis(analysis);
          setAttempts(prev => [...prev, analysis]);
          
          // Track perfect attempts (90%+ score)
          if (analysis.overallScore >= 90) {
            setPerfectAttempts(prev => prev + 1);
          }
          
          // Update overall score
          const totalScore = [...attempts, analysis].reduce((sum, a) => sum + a.overallScore, 0);
          setOverallScore(Math.round(totalScore / (attempts.length + 1)));
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          setError('Failed to analyze pronunciation. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Recording error:', error);
      setError('Recording failed. Please try again.');
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const handleNextChallenge = () => {
    if (currentChallenge < pronunciationChallenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      setCurrentAnalysis(null);
    } else {
      // Complete training
      onComplete(overallScore);
    }
  };

  const handleRetry = () => {
    setCurrentAnalysis(null);
    setError('');
  };

  const playTargetAudio = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to prevent interruption
      speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(challenge.targetText);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Add event handlers to prevent interruption errors
        utterance.onstart = () => console.log('Pronunciation audio started');
        utterance.onend = () => console.log('Pronunciation audio ended');
        utterance.onerror = (event) => {
          console.log('Pronunciation audio error:', event.error);
          // Retry once if it fails
          if (event.error !== 'interrupted') {
            setTimeout(() => speechSynthesis.speak(utterance), 500);
          }
        };
        
        speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const renderSoundVisual = (sound: string) => {
    const soundMap: { [key: string]: string } = {
      '/θ/': '🗣️ Tongue between teeth',
      '/ð/': '🗣️ Tongue between teeth + voice',
      '/r/': '👅 Curl tongue back',
      '/l/': '👅 Touch roof of mouth',
      '/v/': '🦷 Teeth on lip',
      '/w/': '👄 Round lips',
      '/ɪ/': '😐 Relaxed mouth',
      '/i:/': '😊 Spread lips',
      '/ə/': '😑 Neutral position'
    };
    
    return soundMap[sound] || sound;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Perfect Pronunciation Trainer</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Challenge {currentChallenge + 1} of {pronunciationChallenges.length}
              </span>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{perfectAttempts} Perfect</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentChallenge + 1) / pronunciationChallenges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenge Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Challenge */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{challenge.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{challenge.instruction}</p>
                
                {/* Focus Sound */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Focus Sound: {challenge.focusSound}</span>
                  </div>
                  <div className="text-blue-800">{renderSoundVisual(challenge.focusSound)}</div>
                </div>
              </div>

              {/* Target Text */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Practice Text:</span>
                  <button
                    onClick={playTargetAudio}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="text-lg font-medium text-gray-900 leading-relaxed">
                  "{challenge.targetText}"
                </p>
              </div>

              {/* Recording Controls */}
              <div className="text-center">
                <button
                  onClick={isRecording ? () => {} : handleStartRecording}
                  disabled={isProcessing}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {isRecording ? 'Recording... Speak clearly' : 
                   isProcessing ? 'Analyzing pronunciation...' : 
                   'Tap to start recording'}
                </p>
                
                {/* Error Display */}
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Tips Toggle */}
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                {showTips ? 'Hide Tips' : 'Show Pronunciation Tips'}
              </button>

              {/* Tips */}
              {showTips && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Pronunciation Tips:</h4>
                  <ul className="space-y-1">
                    {challenge.tips.map((tip, index) => (
                      <li key={index} className="text-yellow-800 text-sm">• {tip}</li>
                    ))}
                  </ul>
                  <h4 className="font-medium text-yellow-900 mt-3 mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {challenge.examples.map((example, index) => (
                      <li key={index} className="text-yellow-800 text-sm">• {example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {currentAnalysis ? (
                <div className={`border rounded-lg p-4 ${getScoreBackground(currentAnalysis.overallScore)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Analysis Results</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(currentAnalysis.overallScore)}`}>
                      {currentAnalysis.overallScore}%
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{currentAnalysis.accuracy}%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{currentAnalysis.fluency}%</div>
                      <div className="text-xs text-gray-600">Fluency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{currentAnalysis.clarity}%</div>
                      <div className="text-xs text-gray-600">Clarity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{currentAnalysis.pacing}%</div>
                      <div className="text-xs text-gray-600">Pacing</div>
                    </div>
                  </div>

                  {/* Sound-specific feedback */}
                  {currentAnalysis.soundAccuracies.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Sound Analysis:</h5>
                      {currentAnalysis.soundAccuracies.map((sa, index) => (
                        <div key={index} className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">{sa.targetSound}:</span> {sa.feedback}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {currentAnalysis.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {currentAnalysis.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {currentAnalysis.strengths.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-green-900 mb-2">Strengths:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {currentAnalysis.strengths.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleRetry}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-2" />
                      Try Again
                    </button>
                    {currentAnalysis.overallScore >= 80 && (
                      <button
                        onClick={handleNextChallenge}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        {currentChallenge < pronunciationChallenges.length - 1 ? 'Next Challenge' : 'Complete Training'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <TrendingUp className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600">Record your pronunciation to see detailed analysis</p>
                </div>
              )}

              {/* Previous Attempts */}
              {attempts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Previous Attempts</h4>
                  <div className="space-y-2">
                    {attempts.slice(-3).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Attempt {attempts.length - attempts.slice(-3).length + index + 1}</span>
                        <span className={`font-medium ${getScoreColor(attempt.overallScore)}`}>
                          {attempt.overallScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfectPronunciationTrainer;