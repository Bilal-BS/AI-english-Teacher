import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, RotateCcw, CheckCircle, X, MessageCircle, Bot, User, BookOpen, Settings, ArrowRight, Heart } from 'lucide-react';
import { speechRecognition, SpeechRecognitionResult } from '../utils/speechRecognition';
import { openaiService, ChatMessage } from '../utils/openaiService';
import { translationService, BilingualCorrection } from '../utils/translationService';

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
  corrections?: Array<{
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency';
  }>;
  encouragement?: string;
  autoCorrection?: {
    originalText: string;
    correctedText: string;
    hasErrors: boolean;
    corrections: Array<{
      original: string;
      corrected: string;
      explanation: string;
      type: 'grammar' | 'vocabulary' | 'spelling' | 'word-choice';
    }>;
    encouragement: string;
    grammarScore: number;
  };
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
  const [showCorrections, setShowCorrections] = useState(true);
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'tamil' | 'sinhala' | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isGettingCorrection, setIsGettingCorrection] = useState(false);
  
  // Function to highlight errors in original text
  const renderHighlightedText = (originalText: string, corrections: any[]) => {
    if (!corrections || corrections.length === 0) {
      return <span>{originalText}</span>;
    }
    
    let highlightedText = originalText;
    
    // Sort corrections by position to avoid conflicts
    const sortedCorrections = [...corrections].sort((a, b) => {
      const aIndex = originalText.toLowerCase().indexOf(a.original.toLowerCase());
      const bIndex = originalText.toLowerCase().indexOf(b.original.toLowerCase());
      return bIndex - aIndex; // Reverse order to replace from end to start
    });
    
    sortedCorrections.forEach((correction) => {
      const regex = new RegExp(`\\b${correction.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, 
        `<mark style="background-color: #fee2e2; color: #dc2626; font-weight: bold; padding: 2px 4px; border-radius: 3px; border: 1px solid #fca5a5;">$&</mark>`
      );
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };
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
    setIsProcessing(true);
    
    // Update turn count for scoring
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    try {
      const topicTitle = conversationTopics.find(t => t.id === conversationTopic)?.title || 'general topics';
      let aiResponse: string;
      let corrections = null;

      // Prepare conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      if (autoCorrectEnabled) {
        setIsGettingCorrection(true);
        try {
          if (selectedLanguage) {
            // Use bilingual correction
            const bilingualResult = await translationService.getBilingualCorrection(content, selectedLanguage);
            aiResponse = "Great! " + (await translationService.translateText("Keep practicing!", selectedLanguage)).translatedText;
            corrections = {
              hasErrors: bilingualResult.correctedEnglish !== content,
              correctedText: bilingualResult.correctedEnglish,
              corrections: bilingualResult.correctedEnglish !== content ? [{
                original: content,
                corrected: bilingualResult.correctedEnglish,
                explanation: `${bilingualResult.explanationEnglish}\n\n${selectedLanguage === 'tamil' ? 'தமிழில்' : 'සිංහලෙන්'}: ${bilingualResult.explanationNative}`,
                type: 'grammar' as const
              }] : [],
              encouragement: translationService.getFallbackPhrase("Well done!", selectedLanguage),
              grammarScore: bilingualResult.correctedEnglish !== content ? 85 : 95
            };
          } else {
            // Enhanced auto-correction with detailed analysis
            const response = await fetch('/api/conversation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userInput: content,
                conversationHistory 
              })
            });
            
            const result = await response.json();
            aiResponse = result.reply;
            corrections = {
              hasErrors: result.hasCorrections,
              correctedText: result.corrected,
              corrections: result.corrections || (result.hasCorrections ? [{
                original: content,
                corrected: result.corrected,
                explanation: "Grammar and spelling improvements detected",
                type: 'grammar' as const
              }] : []),
              encouragement: "Great job practicing! Keep going.",
              grammarScore: result.hasCorrections ? 85 : 95
            };
          }
        } catch (error) {
          console.error('Error with auto-correction:', error);
          aiResponse = generateFallbackResponse(content, conversationTopic);
        }
        setIsGettingCorrection(false);
      } else {
        // Regular conversation without auto-correction - use backend API
        try {
          const response = await fetch('/api/conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              userInput: content,
              conversationHistory 
            })
          });
          
          const result = await response.json();
          aiResponse = result.reply;
        } catch (error) {
          console.error('Backend API error:', error);
          aiResponse = generateFallbackResponse(content, conversationTopic);
        }
      }

      if (!aiResponse) {
        console.log('OpenAI not configured, using fallback');
        aiResponse = generateFallbackResponse(content, conversationTopic);
      }

      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
        isSpoken,
        confidence,
        autoCorrection: corrections ? {
          originalText: content,
          correctedText: corrections.correctedText || content,
          hasErrors: corrections.hasErrors,
          corrections: corrections.corrections || [],
          encouragement: corrections.encouragement,
          grammarScore: corrections.grammarScore || 85
        } : undefined
      };

      setMessages(prev => [...prev, userMessage]);

      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation score based on participation and corrections
      const correctionBonus = corrections?.hasErrors ? 2 : 0; // Bonus for getting corrections
      const newScore = Math.min(100, Math.round(newTurnCount * 10 + (isSpoken ? 5 : 0) + correctionBonus));
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
    const lowerInput = userInput.toLowerCase();
    const timestamp = Date.now();
    const messageId = Math.random().toString(36).substring(7);
    
    // Create more varied responses using multiple strategies
    const responseStrategies = {
      'daily-routine': {
        questions: [
          "What time do you usually wake up?",
          "Do you have a morning routine?", 
          "What's the best part of your day?",
          "How do you relax in the evening?",
          "Do weekends look different for you?",
          "What do you usually have for breakfast?",
          "How long does it take you to get ready?",
          "Do you prefer mornings or evenings?",
          "What's your favorite way to start the day?",
          "How do you prepare for tomorrow?",
          "What time do you usually go to bed?",
          "Do you have any evening rituals?"
        ],
        reactions: [
          "That sounds well organized!",
          "I can see you have a good routine.",
          "That's a healthy approach to your day.",
          "It sounds like you manage your time well.",
          "That's really interesting!",
          "I like that approach.",
          "That makes a lot of sense.",
          "Wow, that's quite different from mine!",
          "That sounds very peaceful.",
          "I can relate to that!"
        ]
      },
      'hobbies': {
        questions: [
          "How did you first get interested in that?",
          "Do you practice that hobby regularly?",
          "Have you learned any new skills recently?",
          "What draws you to that activity?",
          "Do you have a favorite place to do that?",
          "How much time do you spend on this hobby?",
          "Have you met others who share this interest?",
          "What's the most challenging part?",
          "Do you have any goals with this hobby?",
          "What equipment or tools do you use?",
          "Have you taught anyone else?",
          "What got you started with this?"
        ],
        reactions: [
          "That hobby sounds really engaging!",
          "I can tell you're passionate about that.",
          "That's a creative way to spend time.",
          "It sounds like you really enjoy that.",
          "That's fascinating!",
          "How exciting!",
          "That sounds like so much fun!",
          "What a unique hobby!",
          "I've always been curious about that.",
          "That takes real dedication!"
        ]
      },
      'travel': {
        questions: [
          "Where would you love to visit next?",
          "What was the most memorable part of your trip?",
          "Do you prefer planning trips or being spontaneous?",
          "What kind of places do you enjoy most?",
          "Have you tried the local food there?"
        ],
        reactions: [
          "That destination sounds amazing!",
          "I can imagine that was quite an experience.",
          "Travel can be so enriching.",
          "That sounds like a wonderful adventure."
        ]
      },
      'food': {
        questions: [
          "Do you enjoy cooking at home?",
          "What's your favorite cuisine?",
          "Have you tried making that dish yourself?",
          "Do you like trying new restaurants?",
          "What's your go-to comfort food?"
        ],
        reactions: [
          "That sounds absolutely delicious!",
          "I can tell you appreciate good food.",
          "Food brings people together, doesn't it?",
          "That's an interesting choice of flavors."
        ]
      },
      'work-study': {
        questions: [
          "What do you find most rewarding about your work?",
          "Are you learning anything new lately?",
          "What are your goals for the future?",
          "Do you enjoy working with others?",
          "What skills would you like to develop?"
        ],
        reactions: [
          "That sounds like meaningful work.",
          "It's great that you're focused on learning.",
          "That shows real dedication.",
          "You seem very motivated."
        ]
      },
      'technology': {
        questions: [
          "How has technology changed your daily life?",
          "What's your favorite app or website?",
          "Do you think AI will change things more?",
          "Are you interested in learning new tech skills?",
          "What technology do you find most useful?"
        ],
        reactions: [
          "Technology certainly changes quickly!",
          "That's an interesting perspective on tech.",
          "Digital tools can be so helpful.",
          "You seem tech-savvy."
        ]
      }
    };

    const currentTopic = responseStrategies[topic as keyof typeof responseStrategies] || responseStrategies['daily-routine'];
    
    // Create more varied responses using multiple factors
    const messageLength = userInput.trim().length;
    const hasGreeting = lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey');
    const hasQuestion = userInput.includes('?');
    const isShortResponse = messageLength < 10;
    
    // Use timestamp and message content to create more variation
    const responseIndex = (timestamp + messageLength + turnCount) % 100;
    const reactionIndex = Math.floor(responseIndex / 20) % currentTopic.reactions.length;
    const questionIndex = Math.floor(responseIndex / 10) % currentTopic.questions.length;
    
    // Create highly varied response patterns
    const responseType = (timestamp + turnCount * 3 + messageLength) % 8;
    
    // Track used responses to avoid immediate repetition
    const conversationState = {
      lastReactionIndex: localStorage.getItem(`lastReaction_${topic}`) ? parseInt(localStorage.getItem(`lastReaction_${topic}`)!) : -1,
      lastQuestionIndex: localStorage.getItem(`lastQuestion_${topic}`) ? parseInt(localStorage.getItem(`lastQuestion_${topic}`)!) : -1
    };
    
    // Ensure we don't repeat the same reaction or question immediately
    let finalReactionIndex = reactionIndex;
    let finalQuestionIndex = questionIndex;
    
    if (finalReactionIndex === conversationState.lastReactionIndex) {
      finalReactionIndex = (finalReactionIndex + 1) % currentTopic.reactions.length;
    }
    
    if (finalQuestionIndex === conversationState.lastQuestionIndex) {
      finalQuestionIndex = (finalQuestionIndex + 1) % currentTopic.questions.length;
    }
    
    // Store for next time
    localStorage.setItem(`lastReaction_${topic}`, finalReactionIndex.toString());
    localStorage.setItem(`lastQuestion_${topic}`, finalQuestionIndex.toString());
    
    let response = '';
    
    switch (responseType) {
      case 0: // Greeting response
        if (hasGreeting && turnCount <= 2) {
          response = `Hello! Great to chat with you! ${currentTopic.questions[finalQuestionIndex]}`;
        } else {
          response = currentTopic.questions[finalQuestionIndex];
        }
        break;
      case 1: // Reaction + Question
        response = `${currentTopic.reactions[finalReactionIndex]} ${currentTopic.questions[finalQuestionIndex]}`;
        break;
      case 2: // Just question
        response = currentTopic.questions[finalQuestionIndex];
        break;
      case 3: // Enthusiastic reaction + question
        response = `${currentTopic.reactions[finalReactionIndex]}! ${currentTopic.questions[finalQuestionIndex]}`;
        break;
      case 4: // Acknowledgment + new topic
        const altQuestionIndex = (finalQuestionIndex + 2) % currentTopic.questions.length;
        response = `I see! ${currentTopic.questions[altQuestionIndex]}`;
        break;
      case 5: // Two-part response
        const secondQuestionIndex = (finalQuestionIndex + 3) % currentTopic.questions.length;
        response = `${currentTopic.reactions[finalReactionIndex]} ${currentTopic.questions[secondQuestionIndex]}`;
        break;
      case 6: // Encouraging response
        response = `That's interesting! ${currentTopic.questions[finalQuestionIndex]}`;
        break;
      default: // Contextual response
        if (lowerInput.includes('yes') || lowerInput.includes('no')) {
          response = `${currentTopic.reactions[finalReactionIndex]} ${currentTopic.questions[finalQuestionIndex]}`;
        } else {
          response = `${currentTopic.reactions[finalReactionIndex]} Tell me more about that!`;
        }
    }
    
    return response;
  };

  const resetConversation = () => {
    setMessages([]);
    setSessionStarted(false);
    setConversationTopic('');
    setTurnCount(0);
    setConversationScore(0);
    setError('');
    setIsGettingCorrection(false);
    setIsProcessing(false);
    setAutoCorrectEnabled(true);
    // Clear conversation state for fresh responses
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('lastReaction_') || key.startsWith('lastQuestion_')) {
        localStorage.removeItem(key);
      }
    });
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
                onClick={() => setAutoCorrectEnabled(!autoCorrectEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  autoCorrectEnabled 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-white bg-opacity-10 text-white opacity-60'
                }`}
                title={autoCorrectEnabled ? 'Disable auto-corrections' : 'Enable auto-corrections'}
              >
                <BookOpen className="w-5 h-5" />
              </button>
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
            <div key={message.id}>
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
              
              {/* Auto-Corrections Display */}
              {(showCorrections || autoCorrectEnabled) && message.role === 'user' && message.autoCorrection && (
                <div className="mt-3 mr-0 ml-auto max-w-xs lg:max-w-md">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Auto-Correction</span>
                      <div className="ml-auto bg-blue-100 px-2 py-1 rounded text-xs">
                        Score: {message.autoCorrection.grammarScore}%
                      </div>
                    </div>
                    
                    {message.autoCorrection.hasErrors ? (
                      <div className="space-y-2">
                        {/* Original vs Corrected with highlighting */}
                        <div className="bg-white rounded p-3 border-2 border-red-200">
                          <div className="text-xs font-medium text-red-700 mb-2">❌ Original (with errors):</div>
                          <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded border-l-4 border-red-400">
                            {renderHighlightedText(message.autoCorrection.originalText, message.autoCorrection.corrections || [])}
                          </div>
                        </div>
                        <div className="bg-white rounded p-3 border-2 border-green-200 mt-2">
                          <div className="text-xs font-medium text-green-700 mb-2">✅ Corrected:</div>
                          <div className="text-green-600 text-sm font-medium bg-green-50 p-2 rounded border-l-4 border-green-400">
                            {message.autoCorrection.correctedText}
                          </div>
                        </div>
                        
                        {/* Individual corrections with enhanced highlighting */}
                        {message.autoCorrection.corrections?.map((correction, index) => (
                          <div key={index} className="bg-white rounded p-3 border-l-4 border-orange-400 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold text-sm border border-red-300">
                                  ❌ {correction.original}
                                </span>
                                <ArrowRight className="w-4 h-4 text-orange-500 font-bold" />
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-sm border border-green-300">
                                  ✅ {correction.corrected}
                                </span>
                              </div>
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium ml-auto">
                                {correction.type.toUpperCase()}
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border">
                              <p className="text-gray-700 text-sm font-medium">💡 {correction.explanation}</p>
                            </div>
                            {selectedLanguage && showTranslation && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="text-blue-700 font-medium text-sm">
                                  {selectedLanguage === 'tamil' ? '🇮🇳 தமிழில் விளக்கம்' : '🇱🇰 සිංහල පැහැදිලි කිරීම'}:
                                </div>
                                <div className="text-blue-600 mt-1 text-sm">
                                  {correction.explanation.includes('\n\n') 
                                    ? correction.explanation.split('\n\n')[1] 
                                    : translationService.getFallbackPhrase("Grammar error", selectedLanguage)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Great! No corrections needed.</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Encouragement */}
                    <div className="mt-2 bg-blue-100 rounded p-2">
                      <div className="flex items-center gap-2 text-blue-800 text-sm">
                        <Heart className="w-3 h-3" />
                        <span>{message.autoCorrection.encouragement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isGettingCorrection && (
            <div className="flex justify-end">
              <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Analyzing for suggestions...</span>
                </div>
              </div>
            </div>
          )}
          
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
            {autoCorrectEnabled && openaiService.isConfigured() && (
              <div className="mt-1 flex items-center justify-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span>Auto-corrections enabled</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPractice;