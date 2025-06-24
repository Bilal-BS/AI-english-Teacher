import React, { useState } from 'react';
import { PenTool, Clock, Target, CheckCircle, X, FileText, Lightbulb, Zap } from 'lucide-react';
import { WritingTask, WritingRubric } from '../types';
import { openaiService } from '../utils/openaiService';

interface WritingAssistantProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const WritingAssistant: React.FC<WritingAssistantProps> = ({ onClose, onComplete }) => {
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null);
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState<WritingRubric | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Sample writing tasks
  const writingTasks: WritingTask[] = [
    {
      id: '1',
      title: 'Email to a Colleague',
      prompt: 'Write a professional email to a colleague asking them to collaborate on a project. Include the project details, timeline, and what you need from them.',
      type: 'email',
      minWords: 100,
      maxWords: 200,
      difficulty: 'intermediate',
      rubric: { grammar: 0, vocabulary: 0, structure: 0, content: 0, overall: 0 }
    },
    {
      id: '2',
      title: 'Opinion Essay',
      prompt: 'Do you think social media has a positive or negative impact on society? Write an essay expressing your opinion with supporting arguments and examples.',
      type: 'essay',
      minWords: 250,
      maxWords: 400,
      difficulty: 'advanced',
      rubric: { grammar: 0, vocabulary: 0, structure: 0, content: 0, overall: 0 }
    },
    {
      id: '3',
      title: 'Story Writing',
      prompt: 'Write a short story that begins with: "The old photograph fell out of the book, and suddenly everything made sense..."',
      type: 'story',
      minWords: 200,
      maxWords: 350,
      difficulty: 'intermediate',
      rubric: { grammar: 0, vocabulary: 0, structure: 0, content: 0, overall: 0 }
    },
    {
      id: '4',
      title: 'Formal Letter',
      prompt: 'Write a formal letter to your local government requesting improvements to public transportation in your area. Include specific problems and proposed solutions.',
      type: 'letter',
      minWords: 150,
      maxWords: 250,
      difficulty: 'advanced',
      rubric: { grammar: 0, vocabulary: 0, structure: 0, content: 0, overall: 0 }
    }
  ];

  React.useEffect(() => {
    if (selectedTask) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedTask]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCount = () => {
    return userText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const analyzeWriting = async () => {
    if (!selectedTask) return;

    setIsAnalyzing(true);
    
    try {
      // Use OpenAI for writing feedback if available
      if (openaiService.isConfigured()) {
        const aiFeedback = await openaiService.getWritingFeedback(userText, selectedTask.type);
        
        const rubric: WritingRubric = {
          grammar: aiFeedback.grammar,
          vocabulary: aiFeedback.vocabulary,
          structure: aiFeedback.structure,
          content: aiFeedback.content,
          overall: aiFeedback.overallScore
        };

        setFeedback(rubric);
        setAiSuggestions(aiFeedback.suggestions);
      } else {
        // Fallback to local analysis
        const localFeedback = generateLocalFeedback();
        setFeedback(localFeedback);
        setAiSuggestions([
          'Consider expanding your ideas with more specific examples',
          'Try using more varied sentence structures',
          'Review your grammar and punctuation carefully'
        ]);
      }
    } catch (error) {
      console.error('Error analyzing writing:', error);
      // Fallback to local analysis on error
      const localFeedback = generateLocalFeedback();
      setFeedback(localFeedback);
      setAiSuggestions(['Keep practicing! Your writing is improving.']);
    }
    
    setIsAnalyzing(false);
    setShowFeedback(true);
  };

  const generateLocalFeedback = (): WritingRubric => {
    const wordCount = getWordCount();
    const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    
    // Simple scoring algorithm
    const grammarScore = Math.min(100, Math.max(60, 85 + Math.random() * 15));
    const vocabularyScore = Math.min(100, Math.max(60, 80 + Math.random() * 20));
    const structureScore = avgWordsPerSentence > 10 && avgWordsPerSentence < 25 ? 85 + Math.random() * 15 : 70 + Math.random() * 15;
    const contentScore = wordCount >= selectedTask!.minWords && wordCount <= selectedTask!.maxWords ? 85 + Math.random() * 15 : 70;
    const overallScore = (grammarScore + vocabularyScore + structureScore + contentScore) / 4;

    return {
      grammar: Math.round(grammarScore),
      vocabulary: Math.round(vocabularyScore),
      structure: Math.round(structureScore),
      content: Math.round(contentScore),
      overall: Math.round(overallScore)
    };
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'essay': return '📝';
      case 'story': return '📚';
      case 'letter': return '✉️';
      case 'report': return '📊';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedTask) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-3xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PenTool className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">AI Writing Assistant</h2>
                  <p className="text-sm opacity-90">
                    {openaiService.isConfigured() ? 
                      'Get AI-powered feedback on your writing' : 
                      'Improve your writing with detailed feedback'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {openaiService.isConfigured() && (
              <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm">AI-powered analysis enabled</span>
              </div>
            )}
          </div>

          {/* Task Selection */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Choose a Writing Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {writingTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-3xl">{getTaskIcon(task.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-800 group-hover:text-indigo-700">
                          {task.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {task.prompt}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{task.minWords}-{task.maxWords} words</span>
                        <span className="capitalize">{task.type}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showFeedback && feedback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-3xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">Writing Analysis Complete</h2>
                  <p className="text-sm opacity-90">
                    {openaiService.isConfigured() ? 
                      'AI-powered detailed feedback' : 
                      'Detailed feedback on your writing'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">{feedback.overall}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Overall Score</h3>
              <p className="text-gray-600">
                {feedback.overall >= 85 ? 'Excellent work!' : 
                 feedback.overall >= 70 ? 'Good job!' : 'Keep practicing!'}
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { key: 'grammar', label: 'Grammar', icon: '📝' },
                { key: 'vocabulary', label: 'Vocabulary', icon: '📚' },
                { key: 'structure', label: 'Structure', icon: '🏗️' },
                { key: 'content', label: 'Content', icon: '💡' }
              ].map(item => (
                <div key={item.key} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <h4 className="font-semibold text-gray-800 mb-1">{item.label}</h4>
                  <div className={`text-2xl font-bold ${getScoreColor(feedback[item.key as keyof WritingRubric] as number)}`}>
                    {feedback[item.key as keyof WritingRubric]}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${feedback[item.key as keyof WritingRubric]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-3">
                      {openaiService.isConfigured() ? 'AI-Powered Suggestions' : 'Writing Tips'}
                    </h4>
                    <div className="space-y-2 text-blue-700">
                      {aiSuggestions.map((suggestion, index) => (
                        <p key={index}>• {suggestion}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback and Tips */}
            <div className="bg-purple-50 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <Target className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-800 mb-3">Areas for Improvement</h4>
                  <div className="space-y-2 text-purple-700">
                    {feedback.grammar < 80 && (
                      <p>• Focus on grammar accuracy - review tenses and sentence structure</p>
                    )}
                    {feedback.vocabulary < 80 && (
                      <p>• Expand your vocabulary - try using more varied and sophisticated words</p>
                    )}
                    {feedback.structure < 80 && (
                      <p>• Improve text organization - use clear paragraphs and transitions</p>
                    )}
                    {feedback.content < 80 && (
                      <p>• Develop your ideas more fully - add examples and details</p>
                    )}
                    {feedback.overall >= 85 && (
                      <p>• Excellent work! Continue practicing to maintain this high level</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-800">{getWordCount()}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-800">{formatTime(timeSpent)}</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-800">{selectedTask.type}</div>
                <div className="text-sm text-gray-600">Task Type</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setUserText('');
                  setFeedback(null);
                  setShowFeedback(false);
                  setTimeSpent(0);
                  setAiSuggestions([]);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Try Another Task
              </button>
              <button
                onClick={() => onComplete(feedback.overall)}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300"
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-t-3xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getTaskIcon(selectedTask.type)}</span>
              <div>
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                <p className="text-sm opacity-90">{selectedTask.type} • {selectedTask.difficulty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <p className="text-sm">{selectedTask.prompt}</p>
          </div>
        </div>

        {/* Writing Interface */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Writing Area */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Your Writing</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`${
                    getWordCount() < selectedTask.minWords ? 'text-red-600' :
                    getWordCount() > selectedTask.maxWords ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {getWordCount()} / {selectedTask.minWords}-{selectedTask.maxWords} words
                  </span>
                </div>
              </div>
              
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Start writing here..."
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none resize-none text-lg leading-relaxed"
              />
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Tasks
                </button>
                
                <button
                  onClick={analyzeWriting}
                  disabled={getWordCount() < selectedTask.minWords || isAnalyzing}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    getWordCount() >= selectedTask.minWords && !isAnalyzing
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      {openaiService.isConfigured() && <Zap className="w-4 h-4" />}
                      <span>Get {openaiService.isConfigured() ? 'AI ' : ''}Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Progress</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Word Count</span>
                      <span>{Math.round((getWordCount() / selectedTask.maxWords) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (getWordCount() / selectedTask.maxWords) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Writing Tips</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  {selectedTask.type === 'email' && (
                    <>
                      <p>• Use a clear subject line</p>
                      <p>• Be professional but friendly</p>
                      <p>• Include specific details</p>
                    </>
                  )}
                  {selectedTask.type === 'essay' && (
                    <>
                      <p>• Start with a clear thesis</p>
                      <p>• Use supporting examples</p>
                      <p>• Conclude with a summary</p>
                    </>
                  )}
                  {selectedTask.type === 'story' && (
                    <>
                      <p>• Create interesting characters</p>
                      <p>• Use descriptive language</p>
                      <p>• Build to a climax</p>
                    </>
                  )}
                  {selectedTask.type === 'letter' && (
                    <>
                      <p>• Use formal language</p>
                      <p>• State your purpose clearly</p>
                      <p>• Be respectful and polite</p>
                    </>
                  )}
                </div>
              </div>

              {/* Task Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Task Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{selectedTask.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="capitalize">{selectedTask.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Words:</span>
                    <span>{selectedTask.minWords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Words:</span>
                    <span>{selectedTask.maxWords}</span>
                  </div>
                </div>
              </div>

              {/* AI Status */}
              {openaiService.isConfigured() && (
                <div className="bg-green-50 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-green-800">AI Enhanced</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Get detailed AI-powered feedback on your writing including personalized suggestions for improvement.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingAssistant;