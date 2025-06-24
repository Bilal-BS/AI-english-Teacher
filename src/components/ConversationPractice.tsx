import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, RotateCcw, CheckCircle, X, MessageCircle, Bot, User } from 'lucide-react';
import { speechRecognition, SpeechRecognitionResult } from '../utils/speechRecognition';
import { openaiService, ChatMessage } from '../utils/openaiService';

interface ConversationPracticeProps {
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
}

const ConversationPractice: React.FC<ConversationPracticeProps> = ({ onClose, onComplete }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [conversationTopic, setConversationTopic] = useState<string>('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversationScore, setConversationScore] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
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
      description: 'Share travel experiences and dream destinations',
      starter: "Hello! Have you traveled anywhere interesting recently? I'd love to hear about your experiences!"
    },
    {
      id: 'food',
      title: 'Food & Cooking',
      description: 'Talk about favorite foods, cooking, and dining experiences',
      starter: "Hi! What's your favorite type of food? Do you enjoy cooking at home?"
    },
    {
      id: 'work-study',
      title: 'Work & Study',
      description: 'Discuss your job, studies, or career aspirations',
      starter: "Hello! Tell me about what you do for work or study. What do you find most interesting about it?"
    },
    {
      id: 'technology',
      title: 'Technology',
      description: 'Chat about gadgets, social media, and digital life',
      starter: "Hi there! How has technology changed your daily life? What's your favorite app or gadget?"
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async (topic: typeof conversationTopics[0]) => {
    setConversationTopic(topic.id);
    setSessionStarted(true);
    
    const initialMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: topic.starter,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setTurnCount(0);
  };

  const startRecording = async () => {
    if (!speechRecognition.isAvailable()) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setIsRecording(true);
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

      await handleUserMessage(result.transcript, true, result.confidence);
    } catch (error) {
      setIsRecording(false);
      setError('Failed to process speech. Please try again.');
      console.error('Speech recognition error:', error);
    }
  };

  const stopRecording = () => {
    speechRecognition.stopListening();
    setIsRecording(false);
  };

  const handleTextSubmit = async () => {
    if (textInput.trim()) {
      await handleUserMessage(textInput.trim(), false);
      setTextInput('');
    }
  };

  const handleUserMessage = async (content: string, isSpoken: boolean = false, confidence?: number) => {
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      isSpoken,
      confidence
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setTurnCount(prev => prev + 1);

    try {
      // Prepare conversation context for AI
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      chatMessages.push({ role: 'user', content });

      const context = `You are a friendly English conversation partner helping someone practice English. 
      Topic: ${conversationTopic}. 
      Keep responses conversational, encouraging, and at an appropriate level. 
      Ask follow-up questions to keep the conversation flowing. 
      Gently correct major errors if needed, but focus on communication over perfection.
      Keep responses to 1-2 sentences to maintain natural conversation flow.`;

      let aiResponse: string;
      
      if (openaiService.isConfigured()) {
        aiResponse = await openaiService.chatWithAI(chatMessages, context);
      } else {
        // Fallback responses for demo
        aiResponse = generateFallbackResponse(content, conversationTopic);
      }

      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation score based on participation
      const newScore = Math.min(100, Math.round((turnCount + 1) * 10 + (isSpoken ? 5 : 0)));
      setConversationScore(newScore);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Could you try saying that again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFallbackResponse = (userInput: string, topic: string): string => {
    const responses = {
      'daily-routine': [
        "That sounds like an interesting routine! What's your favorite part of the day?",
        "I see! How long have you been following this routine?",
        "That's great! Do you ever change your routine on weekends?"
      ],
      'hobbies': [
        "That hobby sounds really fun! How did you get started with it?",
        "Interesting! How often do you get to practice that?",
        "That's a great hobby! Have you met other people who share this interest?"
      ],
      'travel': [
        "That sounds like an amazing place! What was your favorite part about visiting there?",
        "Wow! How was the food there? Did you try anything new?",
        "That must have been exciting! Would you like to go back there someday?"
      ],
      'food': [
        "That sounds delicious! Do you know how to cook it yourself?",
        "Interesting choice! What makes that your favorite?",
        "That's great! Do you have a favorite restaurant for that type of food?"
      ],
      'work-study': [
        "That sounds like interesting work! What do you enjoy most about it?",
        "I see! How long have you been doing that?",
        "That's great! What are your goals for the future?"
      ],
      'technology': [
        "That's interesting! How has that technology helped you?",
        "I see! Do you think technology has made life easier or more complicated?",
        "That's a good point! What do you think will be the next big technological change?"
      ]
    };

    const topicResponses = responses[topic as keyof typeof responses] || responses['daily-routine'];
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  };

  const resetConversation = () => {
    setMessages([]);
    setSessionStarted(false);
    setConversationTopic('');
    setTurnCount(0);
    setConversationScore(0);
    setError('');
  };

  const endConversation = () => {
    onComplete(conversationScore);
  };

  if (!sessionStarted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-3xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">Conversation Practice</h2>
                  <p className="text-sm opacity-90">Practice speaking English with AI conversation partner</p>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Choose a Conversation Topic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {conversationTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => startConversation(topic)}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 text-left group"
                >
                  <h4 className="font-semibold text-gray-800 group-hover:text-green-700 mb-2">
                    {topic.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {topic.description}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    "{topic.starter}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-3xl text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Conversation Practice</h2>
                <p className="text-sm opacity-90">
                  {conversationTopics.find(t => t.id === conversationTopic)?.title || 'General Conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm opacity-90">Score</div>
                <div className="text-lg font-bold">{conversationScore}%</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                  {message.role === 'user' && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    {message.isSpoken && (
                      <div className="flex items-center space-x-1 mt-1 opacity-75">
                        <Mic className="w-3 h-3" />
                        <span className="text-xs">Spoken</span>
                        {message.confidence && (
                          <span className="text-xs">({Math.round(message.confidence * 100)}%)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 pb-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-4">
            {/* Voice Input */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`p-3 rounded-full transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Text Input */}
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type your message or use voice..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isProcessing}
                className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={resetConversation}
              className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {turnCount >= 5 && (
              <button
                onClick={endConversation}
                className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                End Session
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            {isRecording ? 'Listening... Speak now!' : 'Click the microphone to speak or type your message'}
            {turnCount < 5 && ` • ${5 - turnCount} more exchanges to complete session`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPractice;