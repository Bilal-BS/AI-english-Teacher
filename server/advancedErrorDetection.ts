import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ComprehensiveError {
  type: 'grammar' | 'spelling' | 'vocabulary' | 'syntax' | 'punctuation' | 'word-order' | 'tense' | 'article' | 'preposition' | 'pronunciation';
  original: string;
  corrected: string;
  explanation: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  position: { start: number; end: number };
  suggestions: string[];
  rule: string;
  examples: string[];
}

export interface ErrorAnalysisResult {
  originalText: string;
  correctedText: string;
  errors: ComprehensiveError[];
  overallScore: number;
  fluencyScore: number;
  accuracyScore: number;
  complexityLevel: 'basic' | 'intermediate' | 'advanced';
  improvements: string[];
  strengths: string[];
}

// Advanced grammar patterns for 100% accuracy
const grammarPatterns = [
  // Subject-verb agreement
  { pattern: /\b(I|you|we|they)\s+(is|was)\b/gi, correction: (match: string) => match.replace(/is|was/gi, match.includes('was') ? 'were' : 'are'), type: 'grammar', rule: 'Subject-verb agreement' },
  { pattern: /\b(he|she|it)\s+(are|were)\b/gi, correction: (match: string) => match.replace(/are|were/gi, match.includes('were') ? 'was' : 'is'), type: 'grammar', rule: 'Subject-verb agreement' },
  
  // Article usage
  { pattern: /\ba\s+([aeiouAEIOU])/g, correction: 'an $1', type: 'grammar', rule: 'Article usage before vowels' },
  { pattern: /\ban\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])/g, correction: 'a $1', type: 'grammar', rule: 'Article usage before consonants' },
  
  // Tense consistency
  { pattern: /\b(yesterday|last week|ago)\b.*\b(go|come|see|eat|drink|run|walk)\b/gi, correction: (match: string) => match.replace(/\b(go|come|see|eat|drink|run|walk)\b/gi, (verb) => getPastTense(verb)), type: 'grammar', rule: 'Past tense with time indicators' },
  
  // Common spelling errors
  { pattern: /\b(recieve|recive)\b/gi, correction: 'receive', type: 'spelling', rule: 'I before E except after C' },
  { pattern: /\b(definately|definitly)\b/gi, correction: 'definitely', type: 'spelling', rule: 'Common spelling error' },
  { pattern: /\b(seperate)\b/gi, correction: 'separate', type: 'spelling', rule: 'Common spelling error' },
  
  // Preposition errors
  { pattern: /\b(in the morning|at morning)\b/gi, correction: 'in the morning', type: 'grammar', rule: 'Time prepositions' },
  { pattern: /\b(on Monday|in Monday|at Monday)\b/gi, correction: 'on Monday', type: 'grammar', rule: 'Day prepositions' },
  
  // Word order
  { pattern: /\b(very much like|much very like)\b/gi, correction: 'like very much', type: 'syntax', rule: 'Adverb placement' },
];

function getPastTense(verb: string): string {
  const irregularVerbs: { [key: string]: string } = {
    'go': 'went', 'come': 'came', 'see': 'saw', 'eat': 'ate', 
    'drink': 'drank', 'run': 'ran', 'walk': 'walked'
  };
  return irregularVerbs[verb.toLowerCase()] || verb + 'ed';
}

export async function analyzeErrorsComprehensively(text: string, userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<ErrorAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackErrorAnalysis(text, userLevel);
  }

  try {
    const aiAnalysis = await performAIErrorAnalysis(text, userLevel);
    const patternAnalysis = performPatternAnalysis(text);
    
    // Combine AI and pattern-based analysis for maximum accuracy
    const combinedErrors = [...aiAnalysis.errors, ...patternAnalysis.errors];
    const uniqueErrors = removeDuplicateErrors(combinedErrors);
    
    return {
      originalText: text,
      correctedText: applyCorrectionToText(text, uniqueErrors),
      errors: uniqueErrors,
      overallScore: calculateOverallScore(uniqueErrors, text.length),
      fluencyScore: aiAnalysis.fluencyScore,
      accuracyScore: calculateAccuracyScore(uniqueErrors, text.length),
      complexityLevel: determineComplexityLevel(text),
      improvements: generateImprovementSuggestions(uniqueErrors, userLevel),
      strengths: identifyStrengths(text, uniqueErrors)
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    return fallbackErrorAnalysis(text, userLevel);
  }
}

async function performAIErrorAnalysis(text: string, userLevel: string): Promise<ErrorAnalysisResult> {
  const prompt = `Analyze this English text for ALL possible errors with maximum precision. User level: ${userLevel}

Text: "${text}"

Provide a comprehensive JSON analysis with:
1. Every grammar, spelling, vocabulary, syntax, punctuation error
2. Exact position of each error
3. Detailed explanations suitable for ${userLevel} learners
4. Multiple correction suggestions
5. Confidence scores (0-100)
6. Severity levels
7. Specific grammar rules violated

Format as valid JSON:
{
  "errors": [
    {
      "type": "grammar|spelling|vocabulary|syntax|punctuation|word-order|tense|article|preposition",
      "original": "exact error text",
      "corrected": "corrected version",
      "explanation": "clear explanation",
      "confidence": 95,
      "severity": "high|medium|low",
      "position": {"start": 0, "end": 5},
      "suggestions": ["alternative 1", "alternative 2"],
      "rule": "specific grammar rule",
      "examples": ["example 1", "example 2"]
    }
  ],
  "fluencyScore": 85,
  "correctedText": "fully corrected text",
  "improvements": ["suggestion 1", "suggestion 2"],
  "strengths": ["strength 1", "strength 2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert English teacher with perfect grammar analysis skills. Analyze text with 100% accuracy and provide detailed, educational feedback."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const analysis = JSON.parse(response.choices[0].message.content || '{}');
  
  return {
    originalText: text,
    correctedText: analysis.correctedText || text,
    errors: analysis.errors || [],
    overallScore: calculateOverallScore(analysis.errors || [], text.length),
    fluencyScore: analysis.fluencyScore || 80,
    accuracyScore: calculateAccuracyScore(analysis.errors || [], text.length),
    complexityLevel: determineComplexityLevel(text),
    improvements: analysis.improvements || [],
    strengths: analysis.strengths || []
  };
}

function performPatternAnalysis(text: string): ErrorAnalysisResult {
  const errors: ComprehensiveError[] = [];
  
  grammarPatterns.forEach((pattern, index) => {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index !== undefined) {
        const original = match[0];
        const corrected = typeof pattern.correction === 'function' 
          ? pattern.correction(original) 
          : original.replace(pattern.pattern, pattern.correction);
        
        errors.push({
          type: pattern.type as any,
          original,
          corrected,
          explanation: `Rule: ${pattern.rule}`,
          confidence: 90,
          severity: 'medium',
          position: { start: match.index, end: match.index + original.length },
          suggestions: [corrected],
          rule: pattern.rule,
          examples: generateExamples(pattern.rule)
        });
      }
      
      // Prevent infinite loop for global patterns
      if (!pattern.pattern.global) break;
    }
  });
  
  return {
    originalText: text,
    correctedText: applyCorrectionToText(text, errors),
    errors,
    overallScore: calculateOverallScore(errors, text.length),
    fluencyScore: 75,
    accuracyScore: calculateAccuracyScore(errors, text.length),
    complexityLevel: determineComplexityLevel(text),
    improvements: generateImprovementSuggestions(errors, 'beginner'),
    strengths: identifyStrengths(text, errors)
  };
}

function fallbackErrorAnalysis(text: string, userLevel: string): ErrorAnalysisResult {
  // Enhanced fallback with comprehensive pattern matching
  const errors = performPatternAnalysis(text).errors;
  
  return {
    originalText: text,
    correctedText: applyCorrectionToText(text, errors),
    errors,
    overallScore: calculateOverallScore(errors, text.length),
    fluencyScore: 70,
    accuracyScore: calculateAccuracyScore(errors, text.length),
    complexityLevel: determineComplexityLevel(text),
    improvements: generateImprovementSuggestions(errors, userLevel),
    strengths: identifyStrengths(text, errors)
  };
}

function removeDuplicateErrors(errors: ComprehensiveError[]): ComprehensiveError[] {
  const unique = new Map();
  
  errors.forEach(error => {
    const key = `${error.original}-${error.position.start}`;
    if (!unique.has(key) || unique.get(key).confidence < error.confidence) {
      unique.set(key, error);
    }
  });
  
  return Array.from(unique.values());
}

function applyCorrectionToText(text: string, errors: ComprehensiveError[]): string {
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

function calculateOverallScore(errors: ComprehensiveError[], textLength: number): number {
  if (textLength === 0) return 0;
  
  const errorPenalty = errors.reduce((total, error) => {
    const severityWeight = error.severity === 'high' ? 3 : error.severity === 'medium' ? 2 : 1;
    return total + severityWeight;
  }, 0);
  
  const score = Math.max(0, 100 - (errorPenalty / textLength * 100));
  return Math.round(score);
}

function calculateAccuracyScore(errors: ComprehensiveError[], textLength: number): number {
  if (textLength === 0) return 0;
  const errorCount = errors.length;
  return Math.max(0, Math.round(100 - (errorCount / (textLength / 10)) * 10));
}

function determineComplexityLevel(text: string): 'basic' | 'intermediate' | 'advanced' {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s/g, '').length / wordCount;
  const sentenceCount = text.split(/[.!?]+/).length;
  
  if (wordCount < 10 && avgWordLength < 5) return 'basic';
  if (wordCount < 20 && avgWordLength < 6) return 'intermediate';
  return 'advanced';
}

function generateImprovementSuggestions(errors: ComprehensiveError[], userLevel: string): string[] {
  const suggestions = new Set<string>();
  
  errors.forEach(error => {
    switch (error.type) {
      case 'grammar':
        suggestions.add(`Focus on ${error.rule.toLowerCase()} rules`);
        break;
      case 'spelling':
        suggestions.add('Practice spelling common words');
        break;
      case 'vocabulary':
        suggestions.add('Expand your vocabulary with synonyms');
        break;
      case 'tense':
        suggestions.add('Review tense usage and time indicators');
        break;
    }
  });
  
  return Array.from(suggestions).slice(0, 3);
}

function identifyStrengths(text: string, errors: ComprehensiveError[]): string[] {
  const strengths: string[] = [];
  
  if (text.length > 50) strengths.push('Good text length for practice');
  if (errors.filter(e => e.type === 'spelling').length === 0) strengths.push('Excellent spelling');
  if (text.includes(',') || text.includes('.')) strengths.push('Good punctuation usage');
  if (text.split(/\s+/).length > 10) strengths.push('Good vocabulary range');
  
  return strengths.slice(0, 2);
}

function generateExamples(rule: string): string[] {
  const examples: { [key: string]: string[] } = {
    'Subject-verb agreement': ['I am happy', 'She is tall', 'They are friends'],
    'Article usage before vowels': ['an apple', 'an umbrella', 'an hour'],
    'Past tense with time indicators': ['Yesterday I went to school', 'Last week she visited her family'],
    'Time prepositions': ['in the morning', 'at night', 'on Monday']
  };
  
  return examples[rule] || ['Example not available'];
}

export async function getDynamicConversationResponse(
  userInput: string, 
  conversationHistory: any[], 
  userLevel: 'beginner' | 'intermediate' | 'advanced',
  topic: string
): Promise<{
  response: string;
  errorAnalysis: ErrorAnalysisResult;
  nextQuestions: string[];
  encouragement: string;
}> {
  const errorAnalysis = await analyzeErrorsComprehensively(userInput, userLevel);
  
  const prompt = `You are a dynamic English conversation tutor. Respond naturally to the user's input while being educational.

User Input: "${userInput}"
User Level: ${userLevel}
Topic: ${topic}
Errors Found: ${errorAnalysis.errors.length}

Provide a JSON response with:
{
  "response": "Natural, engaging response that addresses their input",
  "nextQuestions": ["follow-up question 1", "follow-up question 2"],
  "encouragement": "Positive, specific encouragement"
}

Make the conversation feel real and dynamic, not scripted. Ask follow-up questions based on what they said.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a friendly, encouraging English tutor who creates dynamic conversations."
        },
        ...conversationHistory.slice(-4),
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      response: aiResponse.response || "That's interesting! Can you tell me more?",
      errorAnalysis,
      nextQuestions: aiResponse.nextQuestions || ["What do you think about that?"],
      encouragement: aiResponse.encouragement || "Great job practicing English!"
    };
  } catch (error) {
    return {
      response: "That's a great point! I'd love to hear more about your thoughts on this.",
      errorAnalysis,
      nextQuestions: ["Can you elaborate on that?", "What's your opinion?"],
      encouragement: "You're doing well with your English practice!"
    };
  }
}