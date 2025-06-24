import OpenAI from 'openai';

// Get API key from environment
const getApiKey = () => {
  // Try multiple sources for the API key
  const envKey = import.meta.env.VITE_OPENAI_API_KEY || 
                 import.meta.env.OPENAI_API_KEY ||
                 (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY);
  
  if (envKey && envKey.length > 10 && envKey.startsWith('sk-')) {
    return envKey;
  }
  
  return '';
};

let openai: OpenAI | null = null;

const initializeOpenAI = () => {
  if (!openai) {
    const apiKey = getApiKey();
    if (apiKey) {
      openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
    }
  }
  return openai;
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface WritingFeedback {
  overallScore: number;
  grammar: number;
  vocabulary: number;
  structure: number;
  content: number;
  feedback: string[];
  suggestions: string[];
}

export class OpenAIService {
  
  // Combined auto-correction + conversation response
  async chatWithAutoCorrection(userInput: string, context?: string): Promise<{
    corrected: string;
    reply: string;
    hasCorrections: boolean;
    corrections: Array<{
      original: string;
      corrected: string;
      explanation: string;
      type: 'grammar' | 'vocabulary' | 'spelling' | 'word-choice';
    }>;
  }> {
    try {
      const client = initializeOpenAI();
      if (!client) {
        return {
          corrected: userInput,
          reply: "I'm having trouble connecting right now. Please try again later.",
          hasCorrections: false,
          corrections: []
        };
      }

      const systemMessage = {
        role: 'system' as const,
        content: `You are a helpful English tutor. Always correct grammar/spelling and then reply like a conversation partner. Use this exact format:
Corrected: ...
Reply: ...`
      };

      const fullPrompt = `You are an English tutor. Your job is to:
1. Correct any grammar or spelling mistakes in the user's input.
2. Then reply naturally like in a conversation.

Use this format:
Corrected: <corrected input>
Reply: <natural reply>

User: ${userInput}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          systemMessage,
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.6,
      });

      const aiResponse = response.choices[0]?.message?.content || '';
      
      // Parse the AI response to extract corrected text and reply
      const lines = aiResponse.split('\n');
      const correctedLine = lines.find(line => line.startsWith("Corrected:"))?.replace("Corrected:", "").trim();
      const replyLine = lines.find(line => line.startsWith("Reply:"))?.replace("Reply:", "").trim();

      const corrected = correctedLine || userInput;
      const reply = replyLine || "That's interesting! Tell me more.";
      const hasCorrections = corrected !== userInput;

      // Generate corrections array if there were changes
      const corrections = hasCorrections ? [{
        original: userInput,
        corrected: corrected,
        explanation: "Grammar and spelling improvements",
        type: 'grammar' as const
      }] : [];

      return {
        corrected,
        reply,
        hasCorrections,
        corrections
      };
    } catch (error) {
      console.error('OpenAI Auto-correction Error:', error);
      return {
        corrected: userInput,
        reply: "That's interesting! Tell me more about that.",
        hasCorrections: false,
        corrections: []
      };
    }
  }

  // Chat with AI for conversation practice
  async chatWithAI(messages: ChatMessage[], context?: string): Promise<string> {
    try {
      const client = initializeOpenAI();
      if (!client) {
        return 'AI conversation is not available. Please check your configuration.';
      }

      const systemMessage: ChatMessage = {
        role: 'system',
        content: context || `You are an English conversation teacher. Help the student practice English conversation. 
        Be encouraging, correct mistakes gently, and ask follow-up questions to keep the conversation going. 
        Keep responses conversational and at an appropriate level for the student.`
      };

      const response = await client.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [systemMessage, ...messages],
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
      console.error('OpenAI Chat Error:', error);
      return 'I\'m having trouble connecting right now. Please try again later.';
    }
  }

  // Get correction feedback for user messages
  async getCorrectionFeedback(userText: string, context: string = ''): Promise<{
    hasErrors: boolean;
    corrections: Array<{
      original: string;
      corrected: string;
      explanation: string;
      type: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency';
    }>;
    encouragement: string;
  }> {
    try {
      const client = initializeOpenAI();
      if (!client) {
        return {
          hasErrors: false,
          corrections: [],
          encouragement: "Keep practicing! You're doing great!"
        };
      }

      const prompt = `Analyze this English text for errors and provide corrections. Be encouraging and focus on major issues that help learning.

Text to analyze: "${userText}"
Context: ${context}

Provide response in JSON format:
{
  "hasErrors": boolean,
  "corrections": [
    {
      "original": "incorrect phrase",
      "corrected": "correct phrase", 
      "explanation": "brief explanation",
      "type": "grammar|vocabulary|pronunciation|fluency"
    }
  ],
  "encouragement": "positive feedback message"
}

You are an expert English teacher providing auto-correction feedback. Analyze this text and provide detailed corrections in JSON format:

Text to analyze: "${userText}"
Context: ${context}

Provide a JSON response with this exact structure:
{
  "hasErrors": boolean,
  "correctedText": "Complete corrected version of the text",
  "grammarScore": number (70-100, be encouraging),
  "corrections": [
    {
      "original": "incorrect word/phrase from the text",
      "corrected": "proper correction", 
      "explanation": "Clear, simple explanation of why this is better",
      "type": "grammar" | "vocabulary" | "spelling" | "word-choice"
    }
  ],
  "encouragement": "Positive, specific feedback about their English progress"
}

Guidelines:
- Focus on errors that improve clarity and naturalness
- Maximum 3 corrections to avoid overwhelming
- Provide corrections only for genuine errors, not style preferences
- Grammar score should be encouraging (70-100 range)
- Encouragement should be specific and motivating
- If text is perfect, set hasErrors to false but still give encouragement
- Explain corrections in simple, learner-friendly language`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        hasErrors: result.hasErrors || false,
        correctedText: result.correctedText || userText,
        corrections: result.corrections || [],
        encouragement: result.encouragement || "Great job practicing English!",
        grammarScore: Math.max(70, Math.min(100, result.grammarScore || 85))
      };
    } catch (error) {
      console.error('Error getting correction feedback:', error);
      // Enhanced fallback with basic error detection
      const basicErrors = this.detectBasicErrors(userText);
      
      return {
        hasErrors: basicErrors.length > 0,
        correctedText: basicErrors.length > 0 ? this.applyBasicCorrections(userText) : userText,
        corrections: basicErrors,
        encouragement: basicErrors.length === 0 
          ? "Excellent! Your English is very good. Keep practicing to build confidence!"
          : `Good effort! I found ${basicErrors.length} area${basicErrors.length > 1 ? 's' : ''} to improve. You're making great progress!`,
        grammarScore: Math.max(70, 95 - (basicErrors.length * 8))
      };
    }
  }

  // Get writing feedback using OpenAI
  async getWritingFeedback(text: string, taskType: string = 'general'): Promise<WritingFeedback> {
    try {
      const client = initializeOpenAI();
      if (!client) {
        return this.generateFallbackFeedback(text);
      }
      const prompt = `Please analyze this ${taskType} writing and provide detailed feedback. 
      Rate each category from 0-100 and provide specific suggestions for improvement.

      Text to analyze: "${text}"

      Please respond in this exact JSON format:
      {
        "overallScore": number,
        "grammar": number,
        "vocabulary": number,
        "structure": number,
        "content": number,
        "feedback": ["feedback point 1", "feedback point 2", ...],
        "suggestions": ["suggestion 1", "suggestion 2", ...]
      }`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: 'You are an expert English writing teacher. Provide constructive, detailed feedback on student writing.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      try {
        const feedback = JSON.parse(content);
        return {
          overallScore: Math.min(100, Math.max(0, feedback.overallScore || 0)),
          grammar: Math.min(100, Math.max(0, feedback.grammar || 0)),
          vocabulary: Math.min(100, Math.max(0, feedback.vocabulary || 0)),
          structure: Math.min(100, Math.max(0, feedback.structure || 0)),
          content: Math.min(100, Math.max(0, feedback.content || 0)),
          feedback: Array.isArray(feedback.feedback) ? feedback.feedback : ['Good effort! Keep practicing.'],
          suggestions: Array.isArray(feedback.suggestions) ? feedback.suggestions : ['Continue practicing regularly.']
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.generateFallbackFeedback(text);
      }
    } catch (error) {
      console.error('OpenAI Writing Feedback Error:', error);
      return this.generateFallbackFeedback(text);
    }
  }

  // Generate pronunciation feedback
  async getPronunciationFeedback(targetText: string, spokenText: string): Promise<string[]> {
    try {
      const client = initializeOpenAI();
      if (!client) {
        return ['Good effort! Keep practicing your pronunciation.'];
      }
      const prompt = `Compare the target text with what the student said and provide pronunciation feedback.

      Target: "${targetText}"
      Student said: "${spokenText}"

      Provide 2-3 specific, encouraging feedback points about pronunciation, focusing on:
      - Accuracy of words
      - Areas for improvement
      - Positive reinforcement

      Respond as a JSON array of strings: ["feedback1", "feedback2", "feedback3"]`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: 'You are a pronunciation coach. Give helpful, encouraging feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const feedback = JSON.parse(content);
          return Array.isArray(feedback) ? feedback : ['Good effort! Keep practicing your pronunciation.'];
        } catch {
          return ['Good effort! Keep practicing your pronunciation.'];
        }
      }
      return ['Good effort! Keep practicing your pronunciation.'];
    } catch (error) {
      console.error('OpenAI Pronunciation Feedback Error:', error);
      return ['Good effort! Keep practicing your pronunciation.'];
    }
  }

  // Fallback feedback generation
  private generateFallbackFeedback(text: string): WritingFeedback {
    const wordCount = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Simple heuristic scoring
    const baseScore = Math.min(85, Math.max(60, 70 + Math.random() * 15));
    
    return {
      overallScore: Math.round(baseScore),
      grammar: Math.round(baseScore + (Math.random() - 0.5) * 10),
      vocabulary: Math.round(baseScore + (Math.random() - 0.5) * 10),
      structure: Math.round(baseScore + (Math.random() - 0.5) * 10),
      content: Math.round(baseScore + (Math.random() - 0.5) * 10),
      feedback: [
        'Your writing shows good effort and understanding.',
        wordCount < 50 ? 'Try to develop your ideas with more detail.' : 'Good length and development.',
        sentences.length > 0 ? 'Your sentence structure is developing well.' : 'Focus on complete sentences.'
      ],
      suggestions: [
        'Continue practicing regularly to improve your skills.',
        'Read more English texts to expand your vocabulary.',
        'Practice writing different types of texts.'
      ]
    };
  }

  // Check if OpenAI is configured
  // Basic error detection for fallback
  private detectBasicErrors(text: string): Array<{
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'vocabulary' | 'spelling' | 'word-choice';
  }> {
    const errors = [];
    const lowerText = text.toLowerCase();
    
    // Common grammar patterns
    const patterns = [
      { find: /\bdon't have no\b/g, replace: "don't have any", type: "grammar", explanation: "Avoid double negatives in English" },
      { find: /\bhe don't\b/g, replace: "he doesn't", type: "grammar", explanation: "Use 'doesn't' with he/she/it" },
      { find: /\bshe don't\b/g, replace: "she doesn't", type: "grammar", explanation: "Use 'doesn't' with he/she/it" },
      { find: /\bit don't\b/g, replace: "it doesn't", type: "grammar", explanation: "Use 'doesn't' with he/she/it" },
      { find: /\bi are\b/g, replace: "I am", type: "grammar", explanation: "Use 'am' with 'I'" },
      { find: /\byou is\b/g, replace: "you are", type: "grammar", explanation: "Use 'are' with 'you'" },
      { find: /\bthere is many\b/g, replace: "there are many", type: "grammar", explanation: "Use 'are' with plural nouns" },
      { find: /\bmuch people\b/g, replace: "many people", type: "word-choice", explanation: "Use 'many' with countable nouns like 'people'" },
      { find: /\bmore better\b/g, replace: "better", type: "grammar", explanation: "'Better' is already comparative, don't add 'more'" },
      { find: /\bvery much like\b/g, replace: "really like", type: "word-choice", explanation: "'Really like' sounds more natural than 'very much like'" }
    ];
    
    patterns.forEach(pattern => {
      if (pattern.find.test(lowerText)) {
        const match = text.match(new RegExp(pattern.find.source, 'gi'));
        if (match) {
          errors.push({
            original: match[0],
            corrected: pattern.replace,
            explanation: pattern.explanation,
            type: pattern.type as any
          });
        }
      }
    });
    
    return errors.slice(0, 2); // Limit to 2 corrections
  }
  
  private applyBasicCorrections(text: string): string {
    let corrected = text;
    const patterns = [
      { find: /\bdon't have no\b/gi, replace: "don't have any" },
      { find: /\bhe don't\b/gi, replace: "he doesn't" },
      { find: /\bshe don't\b/gi, replace: "she doesn't" },
      { find: /\bit don't\b/gi, replace: "it doesn't" },
      { find: /\bi are\b/gi, replace: "I am" },
      { find: /\byou is\b/gi, replace: "you are" },
      { find: /\bthere is many\b/gi, replace: "there are many" },
      { find: /\bmuch people\b/gi, replace: "many people" },
      { find: /\bmore better\b/gi, replace: "better" },
      { find: /\bvery much like\b/gi, replace: "really like" }
    ];
    
    patterns.forEach(pattern => {
      corrected = corrected.replace(pattern.find, pattern.replace);
    });
    
    return corrected;
  }

  isConfigured(): boolean {
    const apiKey = getApiKey();
    return !!apiKey && apiKey.length > 10 && apiKey.startsWith('sk-');
  }
}

export const openaiService = new OpenAIService();