// Free Grammar APIs Implementation
import { analyzeConversationErrors, ConversationCorrection } from './conversationErrorDetection';

export interface GrammarCheckResult {
  originalText: string;
  correctedText: string;
  hasErrors: boolean;
  errors: Array<{
    original: string;
    corrected: string;
    explanation: string;
    type: 'grammar' | 'spelling' | 'punctuation' | 'style';
    severity: 'low' | 'medium' | 'high';
    position: { start: number; end: number };
  }>;
  confidence: number;
  suggestions: string[];
}

export interface LevelBasedResponse {
  correction: string;
  explanation: string;
  conversationReply: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  grammarScore: number;
}

// LanguageTool API (Free tier: 20 requests/minute)
async function checkWithLanguageTool(text: string, language = 'en-US'): Promise<GrammarCheckResult> {
  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: language,
      }),
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.status}`);
    }

    const data = await response.json();
    
    let correctedText = text;
    const errors: GrammarCheckResult['errors'] = [];

    // Process matches in reverse order to maintain correct positions
    data.matches.sort((a: any, b: any) => b.offset - a.offset);

    data.matches.forEach((match: any) => {
      const original = text.slice(match.offset, match.offset + match.length);
      const corrected = match.replacements[0]?.value || original;
      
      if (corrected !== original) {
        correctedText = correctedText.slice(0, match.offset) + 
                      corrected + 
                      correctedText.slice(match.offset + match.length);

        errors.push({
          original,
          corrected,
          explanation: match.message,
          type: categorizeError(match.rule.category.id),
          severity: match.rule.category.id.includes('TYPOS') ? 'high' : 
                   match.rule.category.id.includes('GRAMMAR') ? 'high' : 'medium',
          position: { start: match.offset, end: match.offset + match.length }
        });
      }
    });

    return {
      originalText: text,
      correctedText,
      hasErrors: errors.length > 0,
      errors,
      confidence: 0.9,
      suggestions: data.matches.slice(0, 3).map((m: any) => m.message)
    };

  } catch (error) {
    console.error('LanguageTool API error:', error);
    throw error;
  }
}

// Sapling AI API (Free tier: 100 requests/day)
async function checkWithSapling(text: string): Promise<GrammarCheckResult> {
  try {
    const response = await fetch('https://api.sapling.ai/api/v1/edits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        session_id: 'english-learning-app',
      }),
    });

    if (!response.ok) {
      throw new Error(`Sapling API error: ${response.status}`);
    }

    const data = await response.json();
    
    let correctedText = text;
    const errors: GrammarCheckResult['errors'] = [];

    // Process edits in reverse order
    data.edits.sort((a: any, b: any) => b.start - a.start);

    data.edits.forEach((edit: any) => {
      const original = text.slice(edit.start, edit.end);
      const corrected = edit.replacement;
      
      if (corrected !== original) {
        correctedText = correctedText.slice(0, edit.start) + 
                      corrected + 
                      correctedText.slice(edit.end);

        errors.push({
          original,
          corrected,
          explanation: edit.general_error_type || 'Grammar improvement',
          type: 'grammar',
          severity: edit.confidence > 0.8 ? 'high' : 'medium',
          position: { start: edit.start, end: edit.end }
        });
      }
    });

    return {
      originalText: text,
      correctedText,
      hasErrors: errors.length > 0,
      errors,
      confidence: 0.85,
      suggestions: data.edits.slice(0, 3).map((e: any) => e.general_error_type)
    };

  } catch (error) {
    console.error('Sapling API error:', error);
    throw error;
  }
}

// TextGears API (Free tier: 100 requests/day)
async function checkWithTextGears(text: string): Promise<GrammarCheckResult> {
  try {
    const response = await fetch('https://api.textgears.com/grammar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'en-US',
      }),
    });

    if (!response.ok) {
      throw new Error(`TextGears API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.response || data.response.errors === undefined) {
      throw new Error('Invalid TextGears API response');
    }

    let correctedText = text;
    const errors: GrammarCheckResult['errors'] = [];

    // Process errors in reverse order
    data.response.errors.sort((a: any, b: any) => b.offset - a.offset);

    data.response.errors.forEach((error: any) => {
      const original = text.slice(error.offset, error.offset + error.length);
      const corrected = error.better[0] || original;
      
      if (corrected !== original) {
        correctedText = correctedText.slice(0, error.offset) + 
                      corrected + 
                      correctedText.slice(error.offset + error.length);

        errors.push({
          original,
          corrected,
          explanation: error.description.en,
          type: error.type === 'spelling' ? 'spelling' : 'grammar',
          severity: 'medium',
          position: { start: error.offset, end: error.offset + error.length }
        });
      }
    });

    return {
      originalText: text,
      correctedText,
      hasErrors: errors.length > 0,
      errors,
      confidence: 0.8,
      suggestions: data.response.errors.slice(0, 3).map((e: any) => e.description.en)
    };

  } catch (error) {
    console.error('TextGears API error:', error);
    throw error;
  }
}

function categorizeError(categoryId: string): 'grammar' | 'spelling' | 'punctuation' | 'style' {
  if (categoryId.includes('TYPOS') || categoryId.includes('SPELL')) return 'spelling';
  if (categoryId.includes('PUNCT')) return 'punctuation';
  if (categoryId.includes('STYLE')) return 'style';
  return 'grammar';
}

// Main function that tries multiple free APIs with fallback
export async function checkGrammarWithFreeAPIs(
  text: string,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<GrammarCheckResult> {
  const apis = [
    { name: 'LanguageTool', fn: checkWithLanguageTool },
    { name: 'Sapling', fn: checkWithSapling },
    { name: 'TextGears', fn: checkWithTextGears }
  ];

  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API...`);
      const result = await api.fn(text);
      console.log(`${api.name} API successful`);
      return result;
    } catch (error) {
      console.log(`${api.name} API failed, trying next...`);
      continue;
    }
  }

  // Final fallback to our pattern-based system
  console.log('All APIs failed, using pattern-based fallback');
  const fallbackResult = await analyzeConversationErrors(text, [], userLevel);
  
  return {
    originalText: text,
    correctedText: fallbackResult.correctedText,
    hasErrors: fallbackResult.hasErrors,
    errors: fallbackResult.errors.map(error => ({
      original: error.original,
      corrected: error.corrected,
      explanation: error.explanation,
      type: error.type === 'contraction' ? 'grammar' : error.type as any,
      severity: error.severity,
      position: error.position
    })),
    confidence: 0.85,
    suggestions: fallbackResult.errors.slice(0, 3).map(e => e.explanation)
  };
}

// Level-based conversation response generator
export async function generateLevelBasedResponse(
  userInput: string,
  grammarResult: GrammarCheckResult,
  userLevel: 'beginner' | 'intermediate' | 'advanced',
  conversationHistory: any[] = []
): Promise<LevelBasedResponse> {
  
  const grammarScore = grammarResult.hasErrors ? 
    Math.max(50, 100 - (grammarResult.errors.length * 15)) : 100;

  // Generate level-appropriate explanation
  let explanation = '';
  let conversationReply = '';

  if (grammarResult.hasErrors) {
    const mainError = grammarResult.errors[0];
    
    switch (userLevel) {
      case 'beginner':
        explanation = `"${mainError.original}" should be "${mainError.corrected}". ${mainError.explanation}`;
        conversationReply = generateBeginnerReply(userInput, grammarResult.correctedText);
        break;
      
      case 'intermediate':
        explanation = `Grammar tip: ${mainError.explanation}. Use "${mainError.corrected}" instead of "${mainError.original}".`;
        conversationReply = generateIntermediateReply(userInput, grammarResult.correctedText);
        break;
      
      case 'advanced':
        explanation = `Advanced correction: ${mainError.explanation}. Consider the context and proper usage of "${mainError.corrected}".`;
        conversationReply = generateAdvancedReply(userInput, grammarResult.correctedText);
        break;
    }
  } else {
    explanation = 'Excellent! Your grammar is perfect.';
    conversationReply = generateContinuationReply(userInput, userLevel);
  }

  return {
    correction: grammarResult.correctedText,
    explanation,
    conversationReply,
    level: userLevel,
    grammarScore
  };
}

function generateBeginnerReply(originalInput: string, correctedInput: string): string {
  const replies = [
    "That's great! What did you do next?",
    "I understand. Can you tell me more?",
    "Very good! How did you feel about that?",
    "Nice! What happened after that?",
    "Good job! Can you share another example?"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function generateIntermediateReply(originalInput: string, correctedInput: string): string {
  const replies = [
    "That sounds interesting! Could you elaborate on that experience?",
    "I see what you mean. What was your overall impression?",
    "That's a good point. How do you think it could be improved?",
    "Interesting perspective! Have you encountered similar situations before?",
    "That makes sense. What would you do differently next time?"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function generateAdvancedReply(originalInput: string, correctedInput: string): string {
  const replies = [
    "That's a sophisticated viewpoint. What factors led you to that conclusion?",
    "Your analysis is quite thoughtful. How might this apply to broader contexts?",
    "That's an insightful observation. What implications do you see for the future?",
    "Your reasoning is well-structured. Could you explore the counterarguments?",
    "That's a nuanced perspective. How might different stakeholders view this issue?"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function generateContinuationReply(userInput: string, userLevel: string): string {
  const replies = [
    "That's wonderful! Please continue.",
    "Excellent communication! What's your next thought?",
    "Perfect English! I'd love to hear more.",
    "Outstanding! Please elaborate on that.",
    "Fantastic! Keep the conversation going."
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}