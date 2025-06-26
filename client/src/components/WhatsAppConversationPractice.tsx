import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, MessageCircle, Bot, User, CheckCircle, AlertCircle } from 'lucide-react';
import { enhancedSpeechRecognition, SpeechRecognitionResult } from '../utils/enhancedSpeechRecognition';

interface WhatsAppConversationPracticeProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface ConversationError {
  original: string;
  corrected: string;
  explanation: string;
  type: 'contraction' | 'spelling' | 'grammar' | 'punctuation' | 'capitalization';
  severity: 'low' | 'medium' | 'high';
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'correction';
  content: string;
  timestamp: Date;
  isSpoken?: boolean;
  hasErrors?: boolean;
  errors?: ConversationError[];
  correctedText?: string;
  whatsappResponse?: string;
}

const WhatsAppConversationPractice: React.FC<WhatsAppConversationPracticeProps> = ({ onClose, onComplete }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversationScore, setConversationScore] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
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
    
    const initialMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Let's practice a simple conversation. I'll be Person A, and you can be Person B.\n\nPerson A (me): Hello! How are you?\nPerson B (you): ?\n\nYour turn! Respond like you're talking to someone. 😊",
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

      // Analyze for errors using WhatsApp-style detection
      const response = await fetch('/api/conversation-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: input,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userLevel,
          whatsappStyle: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze conversation');
      }

      const analysisResult = await response.json();

      // If there are errors, show WhatsApp-style correction
      if (analysisResult.hasErrors && analysisResult.whatsappResponse) {
        const correctionMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'correction',
          content: analysisResult.whatsappResponse,
          timestamp: new Date(),
          hasErrors: true,
          errors: analysisResult.errors,
          correctedText: analysisResult.correctedText
        };

        setMessages(prev => [...prev, correctionMessage]);
      } else {
        // No errors, continue conversation normally
        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: analysisResult.conversationReply || "That's great! Tell me more about that.",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

      // Update score and turn count
      const score = analysisResult.hasErrors ? 
        Math.max(50, 100 - (analysisResult.errors.length * 15)) : 100;
      const newScore = Math.round((conversationScore + score) / 2);
      setConversationScore(newScore);
      setTurnCount(prev => prev + 1);

      // Complete session after 8 turns
      if (turnCount >= 7) {
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
    }
  };

  const renderMessage = (message: ConversationMessage) => {
    if (message.role === 'correction') {
      return (
        <div className="w-full max-w-4xl mx-auto mb-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-yellow-800 dark:text-yellow-200 whitespace-pre-line">
                  {message.content}
                </div>
                {message.errors && message.errors.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.errors.map((error, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-yellow-300 dark:border-yellow-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300 capitalize">
                            {error.type} Error
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            error.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            error.severity === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {error.severity}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                          <div>
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">Original:</span>
                            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm">"{error.original}"</div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Corrected:</span>
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm">"{error.corrected}"</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Explanation:</strong> {error.explanation}
                        </div>
                      </div>
                    ))}
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
            ? 'bg-blue-600 text-white message-user' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 message-assistant'
        }`}>
          <div className="flex items-start gap-2">
            {message.role === 'user' ? (
              <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
              
              {message.isSpoken && (
                <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                  <Mic className="w-3 h-3" />
                  <span>Spoken</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!sessionStarted) {
    return (
      <div className="conversation-container">
        <div className="modal-content-responsive">
          <div className="conversation-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                WhatsApp-Style Conversation Practice
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Practice natural conversation with instant error correction, just like in the WhatsApp example!
            </p>
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
                    className={`btn-responsive ${
                      userLevel === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium capitalize">{level}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Type or speak your response naturally</li>
                <li>• Get instant corrections for errors like missing apostrophes</li>
                <li>• Learn proper English through conversation</li>
                <li>• See detailed explanations for each correction</li>
              </ul>
            </div>

            <button
              onClick={startConversation}
              className="w-full btn-responsive bg-green-500 hover:bg-green-600 text-white"
            >
              Start Conversation Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-container">
      <div className="conversation-modal">
        {/* Header */}
        <div className="conversation-header">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Conversation Practice
              </h2>
              {turnCount > 0 && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                  Turn {turnCount}/8
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
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Analyzing your English...
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
                placeholder="Type your message here..."
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
              <span>🎤 Click microphone to speak</span>
              <span>⌨️ Type to chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Level: {userLevel}</span>
              <span>• WhatsApp-style corrections</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConversationPractice;