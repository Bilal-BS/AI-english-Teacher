import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, Brain, CheckCircle, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';
import { enhancedSpeechRecognition, SpeechRecognitionResult } from '../utils/enhancedSpeechRecognition';

interface LevelBasedConversationPracticeProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface GrammarError {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  severity: 'low' | 'medium' | 'high';
  position: { start: number; end: number };
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'correction';
  content: string;
  timestamp: Date;
  isSpoken?: boolean;
  hasErrors?: boolean;
  errors?: GrammarError[];
  correctedText?: string;
  explanation?: string;
  grammarScore?: number;
  suggestions?: string[];
}

const LevelBasedConversationPractice: React.FC<LevelBasedConversationPracticeProps> = ({ onClose, onComplete }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string>('');
  const [overallScore, setOverallScore] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [totalErrors, setTotalErrors] = useState(0);
  const [apiStatus, setApiStatus] = useState<'free' | 'fallback' | 'testing'>('free');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = () => {
    setSessionStarted(true);
    setError('');
    setApiStatus('testing');
    
    const levelPrompts = {
      beginner: "Hello! I'm here to help you practice English. Let's start with something simple - tell me about your day today. What did you do this morning?",
      intermediate: "Welcome to our conversation practice! I'd like to learn more about you. Could you describe your favorite hobby and explain why you enjoy it?",
      advanced: "Greetings! Let's engage in a meaningful conversation. I'm curious about your perspective on modern technology's impact on daily life. What are your thoughts on this topic?"
    };
    
    const initialMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: levelPrompts[userLevel],
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setTurnCount(0);
    setOverallScore(0);
    setTotalErrors(0);
  };

  const handleSpeechInput = async () => {
    if (isRecording) {
      setIsRecording(false);
      enhancedSpeechRecognition.stopListening();
      return;
    }

    if (!enhancedSpeechRecognition.isSupported()) {
      setError('Speech recognition is not supported in your browser. Please use text input instead.');
      return;
    }

    setIsRecording(true);
    setError('');

    try {
      const result: SpeechRecognitionResult = await enhancedSpeechRecognition.startListening();
      
      if (result.transcript.trim()) {
        await handleUserInput(result.transcript, true, result.confidence);
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch (error: any) {
      console.error('Speech recognition error:', error);
      setError(`Speech recognition failed: ${error.message || 'Please check your microphone and try again.'}`);
    } finally {
      setIsRecording(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      await handleUserInput(textInput, false);
      setTextInput('');
    }
  };

  const handleUserInput = async (
    input: string,
    isSpoken = false,
    confidence = 1.0
  ) => {
    setIsProcessing(true);
    setError('');

    try {
      // Add user message first
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date(),
        isSpoken,
      };

      setMessages(prev => [...prev, userMessage]);

      // Use free grammar APIs with level-based conversation
      const response = await fetch('/api/level-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: input,
          userLevel,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze conversation');
      }

      const analysisResult = await response.json();
      setApiStatus('free'); // API is working

      // Create correction message if there are errors
      if (analysisResult.hasErrors) {
        const correctionMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'correction',
          content: `Grammar Analysis (${userLevel} level)`,
          timestamp: new Date(),
          hasErrors: true,
          errors: analysisResult.errors,
          correctedText: analysisResult.correctedText,
          explanation: analysisResult.explanation,
          grammarScore: analysisResult.grammarScore,
          suggestions: analysisResult.suggestions
        };

        setMessages(prev => [...prev, correctionMessage]);
        setTotalErrors(prev => prev + analysisResult.errors.length);
      }

      // Add assistant conversation reply
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: analysisResult.conversationReply,
        timestamp: new Date(),
        grammarScore: analysisResult.grammarScore
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update scores
      const newScore = Math.round((overallScore + analysisResult.grammarScore) / 2);
      setOverallScore(newScore);
      setTurnCount(prev => prev + 1);

      // Complete session after 8 turns
      if (turnCount >= 7) {
        setTimeout(() => {
          onComplete(newScore);
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing input:', error);
      setApiStatus('fallback');
      
      const errorMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I had trouble processing your message. Could you please try again? I\'m using backup grammar checking now.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Simple corrections and explanations. Focus on basic grammar and vocabulary.';
      case 'intermediate':
        return 'Moderate corrections with detailed explanations. Practice complex sentences.';
      case 'advanced':
        return 'Advanced grammar analysis. Focus on style, nuance, and sophisticated expressions.';
      default:
        return '';
    }
  };

  const getApiStatusDisplay = () => {
    switch (apiStatus) {
      case 'free':
        return { text: 'Free Grammar APIs Active', color: 'text-green-600 dark:text-green-400', icon: CheckCircle };
      case 'fallback':
        return { text: 'Using Backup System', color: 'text-yellow-600 dark:text-yellow-400', icon: AlertTriangle };
      case 'testing':
        return { text: 'Testing APIs...', color: 'text-blue-600 dark:text-blue-400', icon: Brain };
    }
  };

  const renderMessage = (message: ConversationMessage) => {
    if (message.role === 'correction') {
      return (
        <div className="w-full max-w-4xl mx-auto mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    {message.content}
                  </h4>
                  {message.grammarScore && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold text-lg">{message.grammarScore}%</span>
                    </div>
                  )}
                </div>

                {/* Original vs Corrected */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-700">
                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Original:</div>
                    <div className="text-red-800 dark:text-red-200 font-mono text-sm">
                      "{message.content.replace('Grammar Analysis (', '').replace(' level)', '')}"
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-700">
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Corrected:</div>
                    <div className="text-green-800 dark:text-green-200 font-mono text-sm">
                      "{message.correctedText}"
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                {message.explanation && (
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Explanation ({userLevel} level):
                    </div>
                    <div className="text-gray-800 dark:text-gray-200">{message.explanation}</div>
                  </div>
                )}

                {/* Detailed Errors */}
                {message.errors && message.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detailed Analysis:
                    </div>
                    {message.errors.map((error, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize text-blue-700 dark:text-blue-300">
                            {error.type} Error
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            error.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            error.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {error.severity}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          "<span className="bg-red-100 dark:bg-red-900/30 px-1 rounded">{error.original}</span>" → 
                          "<span className="bg-green-100 dark:bg-green-900/30 px-1 rounded ml-1">{error.corrected}</span>"
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {error.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700">
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                      Additional Tips:
                    </div>
                    <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                      {message.suggestions.slice(0, 3).map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`message-bubble ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white message-user max-w-md' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 message-assistant max-w-lg'
        }`}>
          <div className="flex items-start gap-2">
            {message.role === 'assistant' && <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <div className="flex-1">
              <p className="leading-relaxed">{message.content}</p>
              
              <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                <div className="flex items-center gap-2">
                  {message.isSpoken && (
                    <div className="flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      <span>Spoken</span>
                    </div>
                  )}
                </div>
                {message.grammarScore && (
                  <div className="font-medium">{message.grammarScore}% accuracy</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!sessionStarted) {
    const statusDisplay = getApiStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    return (
      <div className="conversation-container">
        <div className="modal-content-responsive">
          <div className="conversation-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Level-Based Conversation Practice
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Practice English conversation with free grammar APIs and level-appropriate feedback
            </p>
          </div>

          <div className="p-6">
            {/* API Status */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
                <span className={`text-sm font-medium ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Using LanguageTool, Sapling, and TextGears APIs with intelligent fallback
              </div>
            </div>

            {/* Level Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Your English Level:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUserLevel(level)}
                    className={`btn-responsive text-left ${
                      userLevel === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize">{level}</div>
                    <div className="text-xs mt-1 opacity-80">
                      {getLevelDescription(level)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What you'll get:</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Free grammar checking using multiple professional APIs</li>
                <li>• Level-appropriate corrections and explanations</li>
                <li>• Real-time conversation practice with AI feedback</li>
                <li>• Detailed error analysis and improvement suggestions</li>
                <li>• Speech recognition for pronunciation practice</li>
              </ul>
            </div>

            <button
              onClick={startConversation}
              className="w-full btn-responsive bg-green-500 hover:bg-green-600 text-white"
            >
              Start {userLevel} Level Conversation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getApiStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="conversation-container">
      <div className="conversation-modal">
        {/* Header */}
        <div className="conversation-header">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Level Practice ({userLevel})
              </h2>
              {turnCount > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  Turn {turnCount}/8
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
                <span className={`text-xs ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-semibold">
                  {overallScore}%
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Errors:</span>
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-sm">
                  {totalErrors}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="conversation-messages">
          {messages.map((message) => renderMessage(message))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 shadow-sm max-w-md">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Analyzing with free grammar APIs...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 sm:px-6 pb-2">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <X className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="conversation-input">
          <form onSubmit={handleTextSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Type your ${userLevel}-level English message...`}
                className="input-responsive"
                disabled={isProcessing}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSpeechInput}
                disabled={isProcessing}
                className={`btn-responsive ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                type="submit"
                disabled={!textInput.trim() || isProcessing}
                className="btn-responsive bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 text-white"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>🎤 Speak naturally</span>
              <span>⌨️ Type your thoughts</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Level: {userLevel}</span>
              <span>• Free grammar APIs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelBasedConversationPractice;