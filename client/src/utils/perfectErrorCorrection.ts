import { openaiService } from './openaiService';

export interface PerfectCorrection {
  original: string;
  corrected: string;
  corrections: DetailedCorrection[];
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  styleScore: number;
  suggestions: string[];
  explanation: string;
}

export interface DetailedCorrection {
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style' | 'punctuation' | 'word-order' | 'tense' | 'article' | 'preposition';
  original: string;
  corrected: string;
  explanation: string;
  rule: string;
  severity: 'minor' | 'moderate' | 'major';
  position: {
    start: number;
    end: number;
  };
  examples: string[];
}

export interface GrammarPattern {
  pattern: RegExp;
  type: DetailedCorrection['type'];
  correction: (match: string) => string;
  explanation: string;
  rule: string;
  severity: DetailedCorrection['severity'];
  examples: string[];
}

// Comprehensive grammar patterns for perfect error detection
export const advancedGrammarPatterns: GrammarPattern[] = [
  // Article errors
  {
    pattern: /\b(a)\s+(apple|orange|elephant|umbrella|hour|honest)/gi,
    type: 'article',
    correction: (match) => match.replace(/^a\s+/i, 'an '),
    explanation: 'Use "an" before words starting with vowel sounds',
    rule: 'Article Usage Rule',
    severity: 'moderate',
    examples: ['an apple', 'an umbrella', 'an hour']
  },
  {
    pattern: /\b(an)\s+(cat|dog|book|table|car|house)/gi,
    type: 'article',
    correction: (match) => match.replace(/^an\s+/i, 'a '),
    explanation: 'Use "a" before words starting with consonant sounds',
    rule: 'Article Usage Rule',
    severity: 'moderate',
    examples: ['a cat', 'a book', 'a house']
  },

  // Subject-verb agreement
  {
    pattern: /\b(I|you|we|they)\s+(is|was)\b/gi,
    type: 'grammar',
    correction: (match) => match.replace(/is/gi, 'are').replace(/was/gi, 'were'),
    explanation: 'Plural subjects require plural verbs',
    rule: 'Subject-Verb Agreement',
    severity: 'major',
    examples: ['I am', 'you are', 'they were']
  },
  {
    pattern: /\b(he|she|it)\s+(are|were)\b/gi,
    type: 'grammar',
    correction: (match) => match.replace(/are/gi, 'is').replace(/were/gi, 'was'),
    explanation: 'Singular third person subjects require singular verbs',
    rule: 'Subject-Verb Agreement',
    severity: 'major',
    examples: ['he is', 'she was', 'it is']
  },

  // Past tense errors
  {
    pattern: /\b(go|went)\s+(to)\s+(yesterday|last week|last month|last year)/gi,
    type: 'tense',
    correction: (match) => match.replace(/go\s+to/gi, 'went to'),
    explanation: 'Use past tense for past time expressions',
    rule: 'Past Tense Usage',
    severity: 'major',
    examples: ['went to yesterday', 'went last week']
  },
  {
    pattern: /\b(I\s+)(goed|runned|eated|catched|buyed)/gi,
    type: 'tense',
    correction: (match) => {
      return match
        .replace(/goed/gi, 'went')
        .replace(/runned/gi, 'ran')
        .replace(/eated/gi, 'ate')
        .replace(/catched/gi, 'caught')
        .replace(/buyed/gi, 'bought');
    },
    explanation: 'Use correct irregular past tense forms',
    rule: 'Irregular Past Tense',
    severity: 'major',
    examples: ['I went', 'I ran', 'I ate', 'I caught', 'I bought']
  },

  // Preposition errors
  {
    pattern: /\b(in)\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi,
    type: 'preposition',
    correction: (match) => match.replace(/in/gi, 'on'),
    explanation: 'Use "on" with days of the week',
    rule: 'Preposition Usage',
    severity: 'moderate',
    examples: ['on Monday', 'on Tuesday', 'on Friday']
  },
  {
    pattern: /\b(on)\s+(morning|afternoon|evening|night)/gi,
    type: 'preposition',
    correction: (match) => match.replace(/on/gi, 'in'),
    explanation: 'Use "in" with parts of the day',
    rule: 'Preposition Usage',
    severity: 'moderate',
    examples: ['in the morning', 'in the afternoon', 'in the evening']
  },

  // Word order errors
  {
    pattern: /\b(red\s+beautiful|big\s+beautiful|small\s+beautiful)\s+(car|house|flower)/gi,
    type: 'word-order',
    correction: (match) => {
      const parts = match.split(' ');
      if (parts.length >= 3) {
        return `beautiful ${parts[0]} ${parts.slice(2).join(' ')}`;
      }
      return match;
    },
    explanation: 'Opinion adjectives (beautiful) come before fact adjectives (size, color)',
    rule: 'Adjective Order',
    severity: 'moderate',
    examples: ['beautiful red car', 'beautiful big house']
  },

  // Double negatives
  {
    pattern: /\b(don't|doesn't|didn't|won't|can't)\s+(\w+\s+)*(no|nothing|nobody|never)/gi,
    type: 'grammar',
    correction: (match) => match.replace(/(no|nothing|nobody|never)/gi, (neg) => {
      if (neg.toLowerCase() === 'no') return 'any';
      if (neg.toLowerCase() === 'nothing') return 'anything';
      if (neg.toLowerCase() === 'nobody') return 'anybody';
      if (neg.toLowerCase() === 'never') return 'ever';
      return neg;
    }),
    explanation: 'Avoid double negatives in English',
    rule: 'Double Negative Rule',
    severity: 'major',
    examples: ["don't have any", "doesn't do anything", "can't see anybody"]
  },

  // Spelling corrections
  {
    pattern: /\b(recieve|beleive|freind|seperate|neccessary|accomodate)/gi,
    type: 'spelling',
    correction: (match) => {
      const corrections: { [key: string]: string } = {
        'recieve': 'receive',
        'beleive': 'believe', 
        'freind': 'friend',
        'seperate': 'separate',
        'neccessary': 'necessary',
        'accomodate': 'accommodate'
      };
      return corrections[match.toLowerCase()] || match;
    },
    explanation: 'Common spelling correction',
    rule: 'Spelling Rules',
    severity: 'moderate',
    examples: ['receive', 'believe', 'friend', 'separate', 'necessary']
  },

  // Vocabulary improvements
  {
    pattern: /\b(very\s+good|very\s+bad|very\s+big|very\s+small)/gi,
    type: 'vocabulary',
    correction: (match) => {
      const improvements: { [key: string]: string } = {
        'very good': 'excellent',
        'very bad': 'terrible',
        'very big': 'enormous',
        'very small': 'tiny'
      };
      return improvements[match.toLowerCase()] || match;
    },
    explanation: 'Use more precise vocabulary instead of "very + adjective"',
    rule: 'Vocabulary Enhancement',
    severity: 'minor',
    examples: ['excellent', 'terrible', 'enormous', 'tiny']
  },

  // Punctuation errors
  {
    pattern: /\b(However|Therefore|Nevertheless|Furthermore|Moreover)\s+/g,
    type: 'punctuation',
    correction: (match) => `, ${match.trim()} `,
    explanation: 'Transition words should be preceded by a comma',
    rule: 'Punctuation Rules',
    severity: 'minor',
    examples: [', However,', ', Therefore,', ', Nevertheless,']
  }
];

export class PerfectErrorCorrector {
  
  public async getComprehensiveCorrection(text: string): Promise<PerfectCorrection> {
    try {
      // First get AI correction if available
      const aiCorrection = await this.getAICorrection(text);
      
      // Then apply local pattern-based corrections
      const localCorrection = this.getLocalCorrections(text);
      
      // Combine and prioritize corrections
      return this.combineCorrections(text, aiCorrection, localCorrection);
      
    } catch (error) {
      console.error('Error in comprehensive correction:', error);
      // Fallback to local corrections only
      return this.getLocalCorrections(text);
    }
  }
  
  private async getAICorrection(text: string): Promise<Partial<PerfectCorrection>> {
    if (!openaiService.isConfigured()) {
      return {};
    }
    
    try {
      const response = await openaiService.getCorrectionFeedback(text, 'comprehensive');
      return {
        corrected: response.correctedText,
        explanation: response.encouragement,
        overallScore: response.grammarScore
      };
    } catch (error) {
      console.error('AI correction failed:', error);
      return {};
    }
  }
  
  private getLocalCorrections(text: string): PerfectCorrection {
    const corrections: DetailedCorrection[] = [];
    let correctedText = text;
    
    // Apply each grammar pattern
    for (const pattern of advancedGrammarPatterns) {
      const matches = [...text.matchAll(pattern.pattern)];
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const original = match[0];
          const corrected = pattern.correction(original);
          
          if (original !== corrected) {
            corrections.push({
              type: pattern.type,
              original,
              corrected,
              explanation: pattern.explanation,
              rule: pattern.rule,
              severity: pattern.severity,
              position: {
                start: match.index,
                end: match.index + original.length
              },
              examples: pattern.examples
            });
            
            // Apply correction to text
            correctedText = correctedText.replace(original, corrected);
          }
        }
      }
    }
    
    // Calculate scores
    const scores = this.calculateScores(text, corrections);
    
    return {
      original: text,
      corrected: correctedText,
      corrections,
      overallScore: scores.overall,
      grammarScore: scores.grammar,
      vocabularyScore: scores.vocabulary,
      styleScore: scores.style,
      suggestions: this.generateSuggestions(corrections),
      explanation: this.generateExplanation(corrections)
    };
  }
  
  private combineCorrections(
    originalText: string,
    aiCorrection: Partial<PerfectCorrection>,
    localCorrection: PerfectCorrection
  ): PerfectCorrection {
    return {
      original: originalText,
      corrected: aiCorrection.corrected || localCorrection.corrected,
      corrections: localCorrection.corrections,
      overallScore: aiCorrection.overallScore || localCorrection.overallScore,
      grammarScore: localCorrection.grammarScore,
      vocabularyScore: localCorrection.vocabularyScore,
      styleScore: localCorrection.styleScore,
      suggestions: localCorrection.suggestions,
      explanation: aiCorrection.explanation || localCorrection.explanation
    };
  }
  
  private calculateScores(text: string, corrections: DetailedCorrection[]): {
    overall: number;
    grammar: number;
    vocabulary: number;
    style: number;
  } {
    const wordCount = text.split(' ').length;
    const errorCount = corrections.length;
    
    // Base score calculation
    const baseScore = Math.max(0, 100 - (errorCount / wordCount) * 100);
    
    // Category-specific scores
    const grammarErrors = corrections.filter(c => 
      c.type === 'grammar' || c.type === 'tense' || c.type === 'article'
    ).length;
    const vocabularyErrors = corrections.filter(c => 
      c.type === 'vocabulary' || c.type === 'spelling'
    ).length;
    const styleErrors = corrections.filter(c => 
      c.type === 'style' || c.type === 'punctuation'
    ).length;
    
    const grammarScore = Math.max(0, 100 - (grammarErrors / wordCount) * 150);
    const vocabularyScore = Math.max(0, 100 - (vocabularyErrors / wordCount) * 100);
    const styleScore = Math.max(0, 100 - (styleErrors / wordCount) * 80);
    
    // Weight by severity
    const severityWeight = corrections.reduce((weight, correction) => {
      if (correction.severity === 'major') return weight + 3;
      if (correction.severity === 'moderate') return weight + 2;
      return weight + 1;
    }, 0);
    
    const overall = Math.max(0, 100 - (severityWeight / wordCount) * 50);
    
    return {
      overall: Math.round(overall),
      grammar: Math.round(grammarScore),
      vocabulary: Math.round(vocabularyScore),
      style: Math.round(styleScore)
    };
  }
  
  private generateSuggestions(corrections: DetailedCorrection[]): string[] {
    const suggestions: string[] = [];
    
    // Type-specific suggestions
    const grammarErrors = corrections.filter(c => c.type === 'grammar').length;
    const tenseErrors = corrections.filter(c => c.type === 'tense').length;
    const articleErrors = corrections.filter(c => c.type === 'article').length;
    const prepositionErrors = corrections.filter(c => c.type === 'preposition').length;
    
    if (grammarErrors > 0) {
      suggestions.push('Review basic grammar rules for subject-verb agreement');
    }
    if (tenseErrors > 0) {
      suggestions.push('Practice irregular past tense forms');
    }
    if (articleErrors > 0) {
      suggestions.push('Study when to use "a" vs "an" vs "the"');
    }
    if (prepositionErrors > 0) {
      suggestions.push('Practice prepositions of time and place');
    }
    
    // General suggestions based on error frequency
    if (corrections.length > 5) {
      suggestions.push('Consider writing shorter sentences to reduce errors');
      suggestions.push('Read your writing aloud to catch mistakes');
    }
    
    return suggestions.slice(0, 5);
  }
  
  private generateExplanation(corrections: DetailedCorrection[]): string {
    if (corrections.length === 0) {
      return 'Excellent! Your writing has no detected errors. Keep up the great work!';
    }
    
    const majorErrors = corrections.filter(c => c.severity === 'major').length;
    const moderateErrors = corrections.filter(c => c.severity === 'moderate').length;
    const minorErrors = corrections.filter(c => c.severity === 'minor').length;
    
    let explanation = 'I found ';
    
    if (majorErrors > 0) {
      explanation += `${majorErrors} major error${majorErrors > 1 ? 's' : ''} that affect meaning`;
    }
    if (moderateErrors > 0) {
      if (majorErrors > 0) explanation += ', ';
      explanation += `${moderateErrors} moderate error${moderateErrors > 1 ? 's' : ''} that affect clarity`;
    }
    if (minorErrors > 0) {
      if (majorErrors > 0 || moderateErrors > 0) explanation += ', and ';
      explanation += `${minorErrors} minor error${minorErrors > 1 ? 's' : ''} that could be improved`;
    }
    
    explanation += '. Focus on the major errors first for the biggest improvement.';
    
    return explanation;
  }
  
  public highlightErrors(text: string, corrections: DetailedCorrection[]): string {
    let highlightedText = text;
    
    // Sort corrections by position (reverse order to maintain indices)
    const sortedCorrections = [...corrections].sort((a, b) => b.position.start - a.position.start);
    
    for (const correction of sortedCorrections) {
      const before = highlightedText.substring(0, correction.position.start);
      const highlighted = `<mark class="error-highlight" data-type="${correction.type}" title="${correction.explanation}">${correction.original}</mark>`;
      const after = highlightedText.substring(correction.position.end);
      
      highlightedText = before + highlighted + after;
    }
    
    return highlightedText;
  }
}

export const perfectErrorCorrector = new PerfectErrorCorrector();