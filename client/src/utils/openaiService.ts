import OpenAI from 'openai';

// Initialize OpenAI client
const getApiKey = () => {
  return import.meta.env.VITE_OPENAI_API_KEY || '';
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
        model: 'gpt-3.5-turbo',
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
        model: 'gpt-3.5-turbo',
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
        model: 'gpt-3.5-turbo',
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
  isConfigured(): boolean {
    return !!getApiKey();
  }
}

export const openaiService = new OpenAIService();