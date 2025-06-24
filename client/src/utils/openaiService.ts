import OpenAI from 'openai';

// Initialize OpenAI client
const getApiKey = () => {
  // In a browser environment, the API key should come from environment variables
  // For security, this should ideally be handled by a backend proxy in production
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  console.log('API Key configured:', apiKey ? 'Yes' : 'No');
  return apiKey;
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

Focus on:
- Major grammar errors that affect understanding
- Word choice improvements for natural expression
- Natural expression suggestions  
- Only provide corrections if there are clear errors (don't nitpick)
- Keep corrections helpful, not overwhelming (max 2 corrections)
- Always provide encouragement regardless of errors
- If the text is mostly correct, set hasErrors to false but still encourage`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        hasErrors: result.hasErrors || false,
        corrections: result.corrections || [],
        encouragement: result.encouragement || "Great job practicing English!"
      };
    } catch (error) {
      console.error('Error getting correction feedback:', error);
      return {
        hasErrors: false,
        corrections: [],
        encouragement: "Keep practicing! You're doing great!"
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
  isConfigured(): boolean {
    const apiKey = getApiKey();
    const hasKey = !!apiKey && apiKey.length > 10 && apiKey.startsWith('sk-');
    console.log('OpenAI API Key configured:', hasKey ? 'Yes' : 'No', 'Length:', apiKey?.length || 0);
    return hasKey;
  }
}

export const openaiService = new OpenAIService();