import { compareTwoStrings } from 'string-similarity';
import nlp from 'compromise';

export interface PronunciationAnalysis {
  similarity: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  detectedWords: string[];
  missedWords: string[];
  feedback: string[];
  score: number;
}

export class PronunciationAnalyzer {
  
  // Normalize text for comparison
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Extract words from text
  private extractWords(text: string): string[] {
    return this.normalizeText(text).split(' ').filter(word => word.length > 0);
  }

  // Calculate word-level accuracy
  private calculateWordAccuracy(targetWords: string[], spokenWords: string[]): number {
    if (targetWords.length === 0) return 0;
    
    let correctWords = 0;
    const spokenSet = new Set(spokenWords);
    
    targetWords.forEach(word => {
      if (spokenSet.has(word)) {
        correctWords++;
      }
    });
    
    return correctWords / targetWords.length;
  }

  // Calculate fluency based on word count and natural speech patterns
  private calculateFluency(targetText: string, spokenText: string): number {
    const targetWords = this.extractWords(targetText);
    const spokenWords = this.extractWords(spokenText);
    
    // Penalize if too many extra words (indicates hesitation/repetition)
    const extraWords = Math.max(0, spokenWords.length - targetWords.length);
    const extraWordsPenalty = Math.min(0.3, extraWords * 0.05);
    
    // Reward if word count is close to target
    const lengthRatio = Math.min(spokenWords.length / targetWords.length, 1);
    
    return Math.max(0, lengthRatio - extraWordsPenalty);
  }

  // Calculate completeness (how much of the target was spoken)
  private calculateCompleteness(targetWords: string[], spokenWords: string[]): number {
    if (targetWords.length === 0) return 1;
    
    let foundWords = 0;
    const spokenSet = new Set(spokenWords);
    
    targetWords.forEach(word => {
      if (spokenSet.has(word)) {
        foundWords++;
      }
    });
    
    return foundWords / targetWords.length;
  }

  // Generate detailed feedback
  private generateFeedback(
    similarity: number,
    accuracy: number,
    fluency: number,
    completeness: number,
    missedWords: string[]
  ): string[] {
    const feedback: string[] = [];
    
    // Overall performance feedback
    if (similarity >= 0.9) {
      feedback.push("🎉 Excellent pronunciation! You nailed it!");
    } else if (similarity >= 0.8) {
      feedback.push("👏 Great job! Your pronunciation is very good.");
    } else if (similarity >= 0.6) {
      feedback.push("👍 Good effort! You're on the right track.");
    } else if (similarity >= 0.4) {
      feedback.push("💪 Keep practicing! You're making progress.");
    } else {
      feedback.push("🔄 Let's try again. Take your time and speak clearly.");
    }

    // Specific feedback based on metrics
    if (accuracy < 0.7) {
      feedback.push("🎯 Focus on pronouncing each word clearly and distinctly.");
    }
    
    if (fluency < 0.7) {
      feedback.push("⏱️ Try to speak at a steady pace without too many pauses.");
    }
    
    if (completeness < 0.8) {
      feedback.push("📝 Make sure to say the complete sentence or phrase.");
    }

    // Missed words feedback
    if (missedWords.length > 0) {
      if (missedWords.length <= 3) {
        feedback.push(`🔤 You missed these words: ${missedWords.join(', ')}`);
      } else {
        feedback.push(`🔤 You missed ${missedWords.length} words. Try speaking the full sentence.`);
      }
    }

    // Encouragement and tips
    if (similarity < 0.6) {
      feedback.push("💡 Tip: Listen to the example audio again and repeat slowly.");
      feedback.push("🎧 Break the sentence into smaller parts if needed.");
    }

    return feedback;
  }

  // Main analysis function
  public analyze(targetText: string, spokenText: string): PronunciationAnalysis {
    if (!targetText || !spokenText) {
      return {
        similarity: 0,
        accuracy: 0,
        fluency: 0,
        completeness: 0,
        detectedWords: [],
        missedWords: this.extractWords(targetText),
        feedback: ["No speech detected. Please try speaking again."],
        score: 0
      };
    }

    const targetWords = this.extractWords(targetText);
    const spokenWords = this.extractWords(spokenText);
    
    // Calculate similarity using string comparison
    const normalizedTarget = this.normalizeText(targetText);
    const normalizedSpoken = this.normalizeText(spokenText);
    const similarity = compareTwoStrings(normalizedTarget, normalizedSpoken);
    
    // Calculate individual metrics
    const accuracy = this.calculateWordAccuracy(targetWords, spokenWords);
    const fluency = this.calculateFluency(targetText, spokenText);
    const completeness = this.calculateCompleteness(targetWords, spokenWords);
    
    // Find missed words
    const spokenSet = new Set(spokenWords);
    const missedWords = targetWords.filter(word => !spokenSet.has(word));
    
    // Find detected words
    const targetSet = new Set(targetWords);
    const detectedWords = spokenWords.filter(word => targetSet.has(word));
    
    // Calculate overall score (weighted average)
    const score = Math.round(
      (similarity * 0.4 + accuracy * 0.3 + fluency * 0.15 + completeness * 0.15) * 100
    );
    
    // Generate feedback
    const feedback = this.generateFeedback(
      similarity, accuracy, fluency, completeness, missedWords
    );
    
    return {
      similarity,
      accuracy,
      fluency,
      completeness,
      detectedWords,
      missedWords,
      feedback,
      score
    };
  }

  // Analyze conversation responses
  public analyzeConversation(expectedResponse: string, actualResponse: string): PronunciationAnalysis {
    // For conversation exercises, we're more flexible with exact matching
    // Focus on key words and overall meaning
    
    const expectedWords = this.extractWords(expectedResponse);
    const actualWords = this.extractWords(actualResponse);
    
    // Use NLP to extract key concepts
    const expectedDoc = nlp(expectedResponse);
    const actualDoc = nlp(actualResponse);
    
    // Extract important words (nouns, verbs, adjectives)
    const expectedImportant = [
      ...expectedDoc.nouns().out('array'),
      ...expectedDoc.verbs().out('array'),
      ...expectedDoc.adjectives().out('array')
    ].map(word => word.toLowerCase());
    
    const actualImportant = [
      ...actualDoc.nouns().out('array'),
      ...actualDoc.verbs().out('array'),
      ...actualDoc.adjectives().out('array')
    ].map(word => word.toLowerCase());
    
    // Calculate semantic similarity
    const importantMatches = expectedImportant.filter(word => 
      actualImportant.includes(word)
    ).length;
    
    const semanticSimilarity = expectedImportant.length > 0 
      ? importantMatches / expectedImportant.length 
      : 0;
    
    // For conversations, weight semantic similarity higher
    const overallSimilarity = Math.max(
      compareTwoStrings(this.normalizeText(expectedResponse), this.normalizeText(actualResponse)),
      semanticSimilarity * 0.8
    );
    
    const accuracy = this.calculateWordAccuracy(expectedImportant, actualImportant);
    const fluency = actualResponse.length > 10 ? 0.8 : 0.5; // Basic fluency check
    const completeness = actualResponse.trim().length > 0 ? 0.8 : 0;
    
    const score = Math.round(
      (overallSimilarity * 0.5 + accuracy * 0.3 + fluency * 0.1 + completeness * 0.1) * 100
    );
    
    const feedback: string[] = [];
    if (score >= 80) {
      feedback.push("🎉 Excellent response! Very natural and appropriate.");
    } else if (score >= 60) {
      feedback.push("👍 Good response! You communicated the main idea well.");
    } else if (score >= 40) {
      feedback.push("💪 Decent attempt! Try to include more relevant details.");
    } else {
      feedback.push("🔄 Try to respond more directly to the question or prompt.");
    }
    
    if (actualResponse.length < 10) {
      feedback.push("💬 Try to give a more complete response with more details.");
    }
    
    return {
      similarity: overallSimilarity,
      accuracy,
      fluency,
      completeness,
      detectedWords: actualImportant,
      missedWords: expectedImportant.filter(word => !actualImportant.includes(word)),
      feedback,
      score
    };
  }
}

export const pronunciationAnalyzer = new PronunciationAnalyzer();