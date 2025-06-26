import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ConversationError {
  original: string;
  corrected: string;
  explanation: string;
  type: 'contraction' | 'spelling' | 'grammar' | 'punctuation' | 'capitalization';
  severity: 'low' | 'medium' | 'high';
  position: { start: number; end: number };
}

export interface ConversationCorrection {
  hasErrors: boolean;
  correctedText: string;
  errors: ConversationError[];
  conversationReply: string;
  encouragement: string;
  confidence: number;
}

// WhatsApp-style conversation error patterns (like the image you showed)
const conversationPatterns = [
  // Contractions - most critical for natural conversation
  { 
    pattern: /\bIm\b/g, 
    correction: "I'm", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "I\'m" - it\'s short for "I am"',
    severity: 'high' as const
  },
  { 
    pattern: /\bim\b/g, 
    correction: "I'm", 
    type: 'contraction', 
    explanation: 'Added apostrophe and capitalization: "I\'m"',
    severity: 'high' as const
  },
  { 
    pattern: /\bYoure\b/gi, 
    correction: "You're", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "You\'re" - it\'s short for "You are"',
    severity: 'high' as const
  },
  { 
    pattern: /\bTheyre\b/gi, 
    correction: "They're", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "They\'re" - it\'s short for "They are"',
    severity: 'high' as const
  },
  { 
    pattern: /\bWere\b(?=\s+(going|coming|doing|having))/gi, 
    correction: "We're", 
    type: 'contraction', 
    explanation: 'Use "We\'re" (we are) when talking about current actions',
    severity: 'medium' as const
  },
  { 
    pattern: /\bIts\b(?=\s+(good|bad|fine|nice|great|okay|ok|amazing|terrible))/gi, 
    correction: "It's", 
    type: 'contraction', 
    explanation: 'Use "It\'s" (it is) instead of "Its" (possessive)',
    severity: 'medium' as const
  },
  { 
    pattern: /\bCant\b/gi, 
    correction: "Can't", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "Can\'t" - it\'s short for "Cannot"',
    severity: 'high' as const
  },
  { 
    pattern: /\bDont\b/gi, 
    correction: "Don't", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "Don\'t" - it\'s short for "Do not"',
    severity: 'high' as const
  },
  { 
    pattern: /\bWont\b/gi, 
    correction: "Won't", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "Won\'t" - it\'s short for "Will not"',
    severity: 'high' as const
  },
  { 
    pattern: /\bIsnt\b/gi, 
    correction: "Isn't", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "Isn\'t" - it\'s short for "Is not"',
    severity: 'high' as const
  },
  { 
    pattern: /\bArent\b/gi, 
    correction: "Aren't", 
    type: 'contraction', 
    explanation: 'Added apostrophe in "Aren\'t" - it\'s short for "Are not"',
    severity: 'high' as const
  },

  // Common casual conversation errors
  { 
    pattern: /\bhow r u\b/gi, 
    correction: "how are you", 
    type: 'spelling', 
    explanation: 'Use full words instead of text abbreviations',
    severity: 'medium' as const
  },
  { 
    pattern: /\bu r\b/gi, 
    correction: "you are", 
    type: 'spelling', 
    explanation: 'Use "you are" instead of "u r"',
    severity: 'medium' as const
  },
  { 
    pattern: /\bthanks u\b/gi, 
    correction: "thank you", 
    type: 'spelling', 
    explanation: 'Use "thank you" instead of "thanks u"',
    severity: 'low' as const
  },
  { 
    pattern: /\bhow about u\b/gi, 
    correction: "how about you", 
    type: 'spelling', 
    explanation: 'Use "you" instead of "u"',
    severity: 'low' as const
  },

  // Missing auxiliary verbs (common in conversation)
  { 
    pattern: /\bI going\b/gi, 
    correction: 'I am going', 
    type: 'grammar', 
    explanation: 'Add "am" - "I am going"',
    severity: 'high' as const
  },
  { 
    pattern: /\bShe going\b/gi, 
    correction: 'She is going', 
    type: 'grammar', 
    explanation: 'Add "is" - "She is going"',
    severity: 'high' as const
  },
  { 
    pattern: /\bHe going\b/gi, 
    correction: 'He is going', 
    type: 'grammar', 
    explanation: 'Add "is" - "He is going"',
    severity: 'high' as const
  },
  { 
    pattern: /\bWe going\b/gi, 
    correction: 'We are going', 
    type: 'grammar', 
    explanation: 'Add "are" - "We are going"',
    severity: 'high' as const
  },
  { 
    pattern: /\bThey going\b/gi, 
    correction: 'They are going', 
    type: 'grammar', 
    explanation: 'Add "are" - "They are going"',
    severity: 'high' as const
  },

  // Common conversation words
  { 
    pattern: /\bwanna\b/gi, 
    correction: "want to", 
    type: 'grammar', 
    explanation: 'Use "want to" instead of "wanna" in proper English',
    severity: 'low' as const
  },
  { 
    pattern: /\bgonna\b/gi, 
    correction: "going to", 
    type: 'grammar', 
    explanation: 'Use "going to" instead of "gonna" in proper English',
    severity: 'low' as const
  },
  { 
    pattern: /\bkinda\b/gi, 
    correction: "kind of", 
    type: 'grammar', 
    explanation: 'Use "kind of" instead of "kinda"',
    severity: 'low' as const
  },

  // Double words (typing errors)
  { 
    pattern: /\b(\w+)\s+\1\b/gi, 
    correction: '$1', 
    type: 'spelling', 
    explanation: 'Removed duplicate word',
    severity: 'medium' as const
  },

  // Common misspellings in conversation
  { 
    pattern: /\balot\b/gi, 
    correction: 'a lot', 
    type: 'spelling', 
    explanation: 'Two words: "a lot"',
    severity: 'medium' as const
  },
  { 
    pattern: /\brecieve\b/gi, 
    correction: 'receive', 
    type: 'spelling', 
    explanation: 'Remember: "receive" - I before E except after C',
    severity: 'medium' as const
  },

  // Sentence starters that need capitalization
  { 
    pattern: /^([a-z])/gm, 
    correction: (match: string) => match.toUpperCase(), 
    type: 'capitalization' as const, 
    explanation: 'Capitalize the first letter of a sentence',
    severity: 'low' as const
  },
];

export async function analyzeConversationErrors(
  userInput: string,
  conversationHistory: any[] = [],
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<ConversationCorrection> {
  try {
    // Prioritize OpenAI for comprehensive analysis like ChatGPT
    const aiAnalysis = await performConversationAI(userInput, conversationHistory, userLevel, []);
    
    return {
      hasErrors: aiAnalysis.hasErrors,
      correctedText: aiAnalysis.correctedText,
      errors: aiAnalysis.errors || [],
      conversationReply: aiAnalysis.conversationReply,
      encouragement: aiAnalysis.encouragement || "Great job practicing English!",
      confidence: aiAnalysis.confidence || 0.95
    };
  } catch (error) {
    console.warn('OpenAI analysis failed, falling back to pattern detection:', error);
    
    // Fallback to pattern-based detection only if OpenAI fails
    const patternErrors = detectPatternErrors(userInput);
    const correctedText = patternErrors.length > 0 ? applyCorrectionToText(userInput, patternErrors) : userInput;
    
    return {
      hasErrors: patternErrors.length > 0,
      correctedText,
      errors: patternErrors,
      conversationReply: generateFallbackReply(userInput, patternErrors),
      encouragement: generateEncouragement(patternErrors, userLevel),
      confidence: 0.7
    };
  }
}

function detectPatternErrors(text: string): ConversationError[] {
  const errors: ConversationError[] = [];
  
  conversationPatterns.forEach((pattern) => {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index !== undefined) {
        const original = match[0];
        const corrected = typeof pattern.correction === 'function' 
          ? pattern.correction(original) 
          : original.replace(regex, pattern.correction);
        
        if (original !== corrected) {
          errors.push({
            original,
            corrected,
            explanation: pattern.explanation,
            type: pattern.type,
            severity: pattern.severity,
            position: { start: match.index, end: match.index + original.length }
          });
        }
      }
      
      if (!pattern.pattern.global) break;
    }
  });
  
  return errors;
}

async function performConversationAI(
  userInput: string,
  conversationHistory: any[],
  userLevel: string,
  patternErrors: ConversationError[]
): Promise<{
  hasErrors: boolean;
  correctedText: string;
  errors: ConversationError[];
  conversationReply: string;
  confidence: number;
  encouragement?: string;
}> {
  try {
    const historyContext = conversationHistory.length > 0 
      ? `\n\nConversation history (last few messages): ${JSON.stringify(conversationHistory.slice(-4))}`
      : '';

    const prompt = `You are an intelligent English conversation partner like ChatGPT. Analyze this message: "${userInput}"

Your tasks:
1. COMPREHENSIVE GRAMMAR ANALYSIS: Check for ALL errors including:
   - Missing apostrophes (Im → I'm, dont → don't, cant → can't)
   - Spelling mistakes
   - Grammar errors (verb tenses, subject-verb agreement)
   - Punctuation and capitalization
   - Sentence structure issues

2. NATURAL CONVERSATION: Provide a relevant, engaging response that:
   - Responds naturally to what the user said
   - Continues the conversation like a real person
   - Shows understanding of their message
   - Asks follow-up questions when appropriate

3. HELPFUL FEEDBACK: Be encouraging while being thorough about corrections

User level: ${userLevel}${historyContext}

Respond in JSON format:
{
  "hasErrors": true/false,
  "correctedText": "fully corrected version with ALL fixes applied",
  "errors": [
    {
      "original": "exact error found",
      "corrected": "fixed version",
      "explanation": "clear explanation of the error and why it was corrected",
      "type": "contraction|spelling|grammar|punctuation|capitalization",
      "severity": "high|medium|low"
    }
  ],
  "conversationReply": "natural, engaging response that continues the conversation and shows understanding",
  "encouragement": "brief encouraging note about their English progress",
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert English teacher and conversation partner. You provide comprehensive grammar analysis like Grammarly, then engage in natural conversation like ChatGPT. Always be thorough in finding errors but encouraging in your responses."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure we have all required fields
    return {
      hasErrors: result.hasErrors || false,
      correctedText: result.correctedText || userInput,
      errors: result.errors || [],
      conversationReply: result.conversationReply || generateFallbackReply(userInput, []),
      confidence: result.confidence || 0.9,
      encouragement: result.encouragement || "Great job practicing English!"
    };

  } catch (error) {
    console.error('OpenAI conversation analysis failed:', error);
    throw error;
  }
}

function applyCorrectionToText(text: string, errors: ConversationError[]): string {
  let correctedText = text;
  
  // Sort errors by position (descending) to avoid index shifting
  const sortedErrors = errors.sort((a, b) => b.position.start - a.position.start);
  
  sortedErrors.forEach(error => {
    correctedText = correctedText.substring(0, error.position.start) + 
                   error.corrected + 
                   correctedText.substring(error.position.end);
  });
  
  return correctedText;
}

function generateFallbackReply(userInput: string, errors: ConversationError[]): string {
  const replies = [
    "That's interesting! Tell me more about that.",
    "I see what you mean. How do you feel about it?",
    "That sounds great! What happened next?",
    "Really? That must have been exciting!",
    "I understand. Can you share more details?",
    "That's a good point. What do you think about it?",
    "How wonderful! I'd love to hear more.",
    "That's fascinating! What was your experience like?"
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];
  
  if (errors.length > 0) {
    return `${randomReply} By the way, great job practicing English!`;
  }
  
  return randomReply;
}

function generateEncouragement(errors: ConversationError[], userLevel: string): string {
  if (errors.length === 0) {
    return "Perfect! Your English is excellent. Keep up the great work! 👏";
  }
  
  const contractionsErrors = errors.filter(e => e.type === 'contraction').length;
  
  if (contractionsErrors > 0) {
    return "You're close! 😊 Remember apostrophes in contractions like \"I'm\" and \"you're\". Notice the apostrophe in \"I'm\" - it's short for \"I am\".";
  }
  
  if (errors.length <= 2) {
    return "Great job! Just a few small improvements and you'll be perfect! 🌟";
  }
  
  return "Good progress! Keep practicing - every correction helps you improve! 💪";
}

// WhatsApp-style conversation response
export async function generateWhatsAppStyleResponse(
  userInput: string,
  corrections: ConversationCorrection,
  conversationHistory: any[] = []
): Promise<string> {
  if (!corrections.hasErrors) {
    return corrections.conversationReply;
  }

  // Format like the WhatsApp image
  let response = "";
  
  // Add thumbs up emoji for close attempts
  if (corrections.errors.length <= 2) {
    response += "👍 You're close! ";
  }

  // Add main correction with emoji
  const mainError = corrections.errors[0];
  if (mainError) {
    response += `😊 Instead of "${mainError.original}", we typically say "${mainError.corrected}". `;
    response += `${mainError.explanation}\n\n`;
  }

  response += "So, let's try again:\n\n";
  response += `Person A (me): Hello! How are you?\n`;
  response += `Person B (you): ${corrections.correctedText}\n\n`;
  response += "Now it's my turn again:\n";
  response += `${corrections.conversationReply} 🤔\n\n`;
  response += "Your turn!";

  return response;
}