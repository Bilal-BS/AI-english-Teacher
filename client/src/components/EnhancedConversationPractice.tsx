import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, RotateCcw, CheckCircle, X, MessageCircle, Bot, User, BookOpen, Settings, ArrowRight, Heart, Eye, EyeOff } from 'lucide-react';
import { enhancedSpeechRecognition, SpeechRecognitionResult } from '../utils/enhancedSpeechRecognition';
import { analyzeTextComprehensively, DetailedError, ComprehensiveAnalysis } from '../utils/advancedErrorAnalysis';

interface EnhancedConversationPracticeProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSpoken?: boolean;
  confidence?: number;
  analysis?: ComprehensiveAnalysis;
  encouragement?: string;
  nextQuestions?: string[];
}

const EnhancedConversationPractice: React.FC<EnhancedConversationPracticeProps> = ({ onClose, onComplete }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [conversationTopic, setConversationTopic] = useState<string>('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversationScore, setConversationScore] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [showCorrections, setShowCorrections] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'tamil' | 'sinhala' | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationTopics = [
    {
      id: 'daily-routine',
      title: 'Daily Routine',
      description: 'Talk about your typical day, morning routine, and daily activities',
      starter: "Hello! I'd love to hear about your daily routine. What time do you usually wake up?"
    },
    {
      id: 'hobbies',
      title: 'Hobbies & Interests',
      description: 'Discuss your favorite activities, sports, and pastimes',
      starter: "Hi there! What do you like to do in your free time? Do you have any interesting hobbies?"
    },
    {
      id: 'travel',
      title: 'Travel & Places',
      description: 'Share experiences about places you\'ve visited or want to visit',
      starter: "I love hearing travel stories! Have you been to any interesting places recently?"
    },
    {
      id: 'food',
      title: 'Food & Cooking',
      description: 'Discuss favorite foods, recipes, and cooking experiences',
      starter: "Food is such a great topic! What's your favorite dish? Do you enjoy cooking?"
    },
    {
      id: 'work-study',
      title: 'Work & Study',
      description: 'Talk about your job, studies, or career aspirations',
      starter: "I'd like to know more about what you do. Are you working or studying right now?"
    },
    {
      id: 'family-friends',
      title: 'Family & Friends',
      description: 'Share about your relationships and social connections',
      starter: "Family and friends are so important! Tell me about the people who are close to you."
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = (topic: typeof conversationTopics[0]) => {
    setConversationTopic(topic.id);
    setSessionStarted(true);
    setError('');
    
    const initialMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: topic.starter,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setTurnCount(0);
    setConversationScore(0);
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
    setIsAnalyzing(true);
    setError('');

    try {
      // Comprehensive error analysis
      const analysis = await analyzeTextComprehensively(input, userLevel);
      
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date(),
        isSpoken,
        confidence,
        analysis,
        encouragement: analysis.encouragement
      };

      setMessages(prev => [...prev, userMessage]);

      // Get dynamic AI response
      const aiResponse = await getDynamicResponse(input, analysis);
      
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        nextQuestions: aiResponse.nextQuestions
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update scores
      const newScore = Math.round((conversationScore + analysis.overallScore) / 2);
      setConversationScore(newScore);
      setTurnCount(prev => prev + 1);

      // Complete session after 10 turns
      if (turnCount >= 9) {
        setTimeout(() => {
          onComplete(newScore);
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing input:', error);
      const errorMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I had trouble processing your message. Could you please try again?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  };

  const getDynamicResponse = async (userInput: string, analysis: ComprehensiveAnalysis) => {
    try {
      const response = await fetch('/api/dynamic-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userLevel,
          topic: conversationTopic
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          response: data.response,
          nextQuestions: data.nextQuestions || []
        };
      }
    } catch (error) {
      console.error('Dynamic conversation failed:', error);
    }

    // Fallback response based on analysis
    return generateFallbackResponse(analysis);
  };

  const generateFallbackResponse = (analysis: ComprehensiveAnalysis) => {
    const responses = [
      "That's really interesting! Can you tell me more about that?",
      "I see what you mean. What do you think about it?",
      "That sounds fascinating! How did that make you feel?",
      "I'd love to hear more details about that experience.",
      "That's a great point! What happened next?",
      "How exciting! What was your favorite part?",
      "That must have been quite an experience! Tell me more.",
      "I can imagine that was important to you. Why do you think so?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      response: analysis.errors.length > 0 
        ? `${randomResponse} By the way, great job on your English! I noticed a few small improvements we can work on.`
        : `${randomResponse} Your English is excellent!`,
      nextQuestions: [
        "What do you think about that?",
        "Can you share more details?",
        "How did that experience affect you?"
      ]
    };
  };

  const renderHighlightedText = (originalText: string, errors: DetailedError[]) => {
    if (!errors || errors.length === 0) {
      return <span className="text-gray-800 dark:text-gray-200">{originalText}</span>;
    }
    
    let highlightedText = originalText;
    
    // Sort errors by position (reverse order to avoid index shifting)
    const sortedErrors = [...errors].sort((a, b) => b.position.start - a.position.start);
    
    sortedErrors.forEach((error) => {
      const errorClass = error.severity === 'high' 
        ? 'bg-red-200 text-red-800 border-red-300' 
        : error.severity === 'medium' 
        ? 'bg-orange-200 text-orange-800 border-orange-300'
        : 'bg-yellow-200 text-yellow-800 border-yellow-300';
      
      highlightedText = highlightedText.substring(0, error.position.start) +
        `<mark class="${errorClass} font-semibold px-1 py-0.5 rounded border" title="${error.explanation}">${error.original}</mark>` +
        highlightedText.substring(error.position.end);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const renderErrorAnalysis = (analysis: ComprehensiveAnalysis) => {
    if (!showCorrections || !analysis.errors.length) return null;

    return (
      <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-200">
              Analysis & Corrections
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              Score: {analysis.overallScore}%
            </div>
          </div>
        </div>

        {analysis.errors.map((error, index) => (
          <div key={index} className="mb-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  error.severity === 'high' ? 'bg-red-500' :
                  error.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
                <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                  {error.type} Error
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {error.severity} priority
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Original:</span>
                <p className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">"{error.original}"</p>
              </div>
              <div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Corrected:</span>
                <p className="text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">"{error.corrected}"</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Explanation:</strong> {error.explanation}
            </div>
            
            {error.examples.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Examples:</strong> {error.examples.join(', ')}
              </div>
            )}

            {showTranslation && selectedLanguage && error.nativeTranslation && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <strong>{selectedLanguage === 'tamil' ? 'தமிழில்' : 'සිංහලෙන්'}:</strong>
                <p className="text-gray-700 dark:text-gray-300">
                  {error.nativeTranslation[selectedLanguage]}
                </p>
              </div>
            )}
          </div>
        ))}

        {analysis.improvements.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded">
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              Suggestions for Improvement:
            </h4>
            <ul className="list-disc list-inside text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              {analysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.strengths.length > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Your Strengths:
            </h4>
            <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 space-y-1">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!sessionStarted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Enhanced Conversation Practice
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Your English Level:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUserLevel(level)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      userLevel === level
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium capitalize">{level}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Native Language for Explanations (Optional):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedLanguage(null)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedLanguage === null
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  English Only
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('tamil');
                    setShowTranslation(true);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedLanguage === 'tamil'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  Tamil (தமிழ்)
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('sinhala');
                    setShowTranslation(true);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedLanguage === 'sinhala'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  Sinhala (සිංහල)
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Choose a Conversation Topic:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conversationTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => startConversation(topic)}
                    className="p-4 text-left bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        {topic.title}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {topic.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                AI Conversation Practice
              </h2>
              {turnCount > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  Turn {turnCount}/10
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-semibold">
                  {conversationScore}%
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCorrections(!showCorrections)}
                  className={`p-2 rounded-lg transition-colors ${
                    showCorrections 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  title={showCorrections ? 'Hide corrections' : 'Show corrections'}
                >
                  {showCorrections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-start gap-2 mb-2">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {message.role === 'user' && message.analysis ? (
                      renderHighlightedText(message.content, message.analysis.errors)
                    ) : (
                      <p className="leading-relaxed">{message.content}</p>
                    )}
                    
                    {message.isSpoken && (
                      <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                        <Mic className="w-3 h-3" />
                        <span>Spoken ({Math.round((message.confidence || 0) * 100)}% confidence)</span>
                      </div>
                    )}
                  </div>
                </div>

                {message.analysis && renderErrorAnalysis(message.analysis)}

                {message.encouragement && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">Encouragement:</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {message.encouragement}
                    </p>
                  </div>
                )}

                {message.nextQuestions && message.nextQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      You might want to discuss:
                    </p>
                    {message.nextQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleUserInput(question, false)}
                        className="block w-full text-left p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        "{question}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  {isAnalyzing && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      Analyzing your English...
                    </span>
                  )}
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
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
          <form onSubmit={handleTextSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                disabled={isProcessing}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSpeechInput}
                disabled={isProcessing}
                className={`px-4 py-3 rounded-xl transition-all ${
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
                className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>🎤 Click microphone to speak</span>
              <span>⌨️ Type to chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Level: {userLevel}</span>
              {selectedLanguage && (
                <span>• {selectedLanguage === 'tamil' ? 'தமிழ்' : 'සිංහල'} explanations</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedConversationPractice;