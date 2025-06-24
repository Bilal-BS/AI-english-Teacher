import { speechRecognition } from './speechRecognition';

export interface PronunciationAnalysis {
  overallScore: number;
  accuracy: number;
  fluency: number;
  clarity: number;
  pacing: number;
  stressPattern: number;
  soundAccuracy: SoundAccuracy[];
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

export interface SoundAccuracy {
  phoneme: string;
  targetSound: string;
  actualSound: string;
  accuracy: number;
  position: number;
  feedback: string;
}

export interface DifficultSound {
  phoneme: string;
  symbol: string;
  examples: string[];
  commonMistakes: string[];
  tips: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Hard pronunciation challenges for English learners
export const difficultSounds: DifficultSound[] = [
  {
    phoneme: 'th_voiced',
    symbol: '/ð/',
    examples: ['this', 'that', 'there', 'breathe', 'mother', 'father'],
    commonMistakes: ['dis', 'dat', 'dere', 'briv', 'moder', 'fader'],
    tips: [
      'Put tongue between teeth lightly',
      'Voice should vibrate through tongue',
      'Don\'t make /d/ or /z/ sound',
      'Practice: "The mother breathes there"'
    ],
    difficulty: 'advanced'
  },
  {
    phoneme: 'th_voiceless',
    symbol: '/θ/',
    examples: ['think', 'three', 'thank', 'tooth', 'birthday', 'nothing'],
    commonMistakes: ['tink', 'tree', 'tank', 'toot', 'birtday', 'noting'],
    tips: [
      'Put tongue between teeth lightly',
      'No voice vibration, just air',
      'Don\'t make /t/ or /s/ sound',
      'Practice: "I think three things"'
    ],
    difficulty: 'advanced'
  },
  {
    phoneme: 'r_sound',
    symbol: '/r/',
    examples: ['red', 'car', 'very', 'around', 'sorry', 'terrible'],
    commonMistakes: ['led', 'cal', 'vely', 'alound', 'solly', 'telible'],
    tips: [
      'Curl tongue tip slightly back',
      'Don\'t touch roof of mouth',
      'Make continuous sound',
      'Practice: "Red car around corner"'
    ],
    difficulty: 'intermediate'
  },
  {
    phoneme: 'l_sound',
    symbol: '/l/',
    examples: ['light', 'like', 'people', 'bill', 'bottle', 'little'],
    commonMistakes: ['right', 'rike', 'peopre', 'bir', 'bottru', 'rittru'],
    tips: [
      'Touch tongue tip to roof of mouth',
      'Keep sides of tongue down',
      'Clear /l/ sound at end of words',
      'Practice: "Little people like light"'
    ],
    difficulty: 'intermediate'
  },
  {
    phoneme: 'v_sound',
    symbol: '/v/',
    examples: ['very', 'have', 'seven', 'love', 'voice', 'victory'],
    commonMistakes: ['bery', 'hab', 'seben', 'lob', 'bois', 'bictory'],
    tips: [
      'Upper teeth touch lower lip',
      'Voice vibrates through lip',
      'Don\'t make /b/ sound',
      'Practice: "Very brave voice"'
    ],
    difficulty: 'beginner'
  },
  {
    phoneme: 'w_sound',
    symbol: '/w/',
    examples: ['water', 'what', 'where', 'question', 'twenty', 'winter'],
    commonMistakes: ['vater', 'vat', 'vere', 'kvestion', 'tventy', 'vinter'],
    tips: [
      'Round lips like saying "oo"',
      'Then quickly move to next sound',
      'Don\'t make /v/ sound',
      'Practice: "What water where"'
    ],
    difficulty: 'beginner'
  },
  {
    phoneme: 'short_i',
    symbol: '/ɪ/',
    examples: ['bit', 'ship', 'women', 'busy', 'build', 'minute'],
    commonMistakes: ['beat', 'sheep', 'vomen', 'bisy', 'bild', 'meenit'],
    tips: [
      'Shorter than /i:/ sound',
      'Relaxed tongue position',
      'Don\'t make /e/ or /i:/ sound',
      'Practice: "Bit ship quick"'
    ],
    difficulty: 'intermediate'
  },
  {
    phoneme: 'schwa',
    symbol: '/ə/',
    examples: ['about', 'problem', 'today', 'China', 'camera', 'banana'],
    commonMistakes: ['abowt', 'problam', 'todai', 'Cheena', 'camara', 'banana'],
    tips: [
      'Most common English sound',
      'Very relaxed, neutral position',
      'Unstressed syllables',
      'Practice: "About a problem today"'
    ],
    difficulty: 'advanced'
  }
];

export class AdvancedPronunciationAnalyzer {
  private analyzePhonemes(targetText: string, spokenText: string): SoundAccuracy[] {
    const soundAccuracies: SoundAccuracy[] = [];
    const targetWords = targetText.toLowerCase().split(' ');
    const spokenWords = spokenText.toLowerCase().split(' ');
    
    for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
      const targetWord = targetWords[i];
      const spokenWord = spokenWords[i];
      
      // Check for common difficult sounds
      for (const sound of difficultSounds) {
        for (const example of sound.examples) {
          if (targetWord.includes(example.toLowerCase())) {
            const accuracy = this.calculateSoundAccuracy(targetWord, spokenWord, sound);
            soundAccuracies.push({
              phoneme: sound.phoneme,
              targetSound: example,
              actualSound: spokenWord,
              accuracy,
              position: i,
              feedback: this.generateSoundFeedback(accuracy, sound)
            });
          }
        }
      }
    }
    
    return soundAccuracies;
  }
  
  private calculateSoundAccuracy(targetWord: string, spokenWord: string, sound: DifficultSound): number {
    // Advanced similarity calculation for pronunciation
    const similarity = this.calculateAdvancedSimilarity(targetWord, spokenWord);
    
    // Check for common mistakes
    for (const mistake of sound.commonMistakes) {
      if (spokenWord.includes(mistake.toLowerCase())) {
        return Math.max(0, similarity - 0.3); // Penalty for common mistakes
      }
    }
    
    return similarity;
  }
  
  private calculateAdvancedSimilarity(target: string, spoken: string): number {
    const targetClean = target.replace(/[^a-z]/g, '');
    const spokenClean = spoken.replace(/[^a-z]/g, '');
    
    if (targetClean === spokenClean) return 1.0;
    
    // Levenshtein distance with pronunciation weights
    const matrix: number[][] = [];
    for (let i = 0; i <= targetClean.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= spokenClean.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= targetClean.length; i++) {
      for (let j = 1; j <= spokenClean.length; j++) {
        if (targetClean[i - 1] === spokenClean[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          // Weight common pronunciation substitutions less
          const substitutionWeight = this.getSubstitutionWeight(targetClean[i - 1], spokenClean[j - 1]);
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,      // deletion
            matrix[i][j - 1] + 1,      // insertion
            matrix[i - 1][j - 1] + substitutionWeight  // substitution
          );
        }
      }
    }
    
    const distance = matrix[targetClean.length][spokenClean.length];
    const maxLen = Math.max(targetClean.length, spokenClean.length);
    return Math.max(0, (maxLen - distance) / maxLen);
  }
  
  private getSubstitutionWeight(target: string, spoken: string): number {
    // Common pronunciation substitutions (lower weight = more forgiving)
    const substitutions: { [key: string]: string[] } = {
      'th': ['d', 't', 's', 'z'],
      'd': ['th'],
      't': ['th'],
      'r': ['l', 'w'],
      'l': ['r', 'w'],
      'v': ['b', 'f', 'w'],
      'w': ['v', 'u'],
      'b': ['v', 'p'],
      'p': ['b'],
      'f': ['v', 'p'],
      's': ['z', 'th'],
      'z': ['s', 'th']
    };
    
    if (substitutions[target]?.includes(spoken)) {
      return 0.5; // More forgiving for common mistakes
    }
    
    return 1.0; // Full penalty for other substitutions
  }
  
  private generateSoundFeedback(accuracy: number, sound: DifficultSound): string {
    if (accuracy >= 0.9) {
      return `Excellent pronunciation of ${sound.symbol}!`;
    } else if (accuracy >= 0.7) {
      return `Good attempt with ${sound.symbol}. ${sound.tips[0]}`;
    } else if (accuracy >= 0.5) {
      return `Keep practicing ${sound.symbol}. ${sound.tips[1] || sound.tips[0]}`;
    } else {
      return `Focus on ${sound.symbol}: ${sound.tips[0]} Common mistake avoided!`;
    }
  }
  
  public async analyzePronunciation(targetText: string, spokenText: string): Promise<PronunciationAnalysis> {
    const soundAccuracies = this.analyzePhonemes(targetText, spokenText);
    
    // Calculate overall metrics
    const accuracy = soundAccuracies.length > 0 
      ? soundAccuracies.reduce((sum, sa) => sum + sa.accuracy, 0) / soundAccuracies.length
      : this.calculateAdvancedSimilarity(targetText, spokenText);
    
    const fluency = this.calculateFluency(targetText, spokenText);
    const clarity = this.calculateClarity(spokenText);
    const pacing = this.calculatePacing(targetText, spokenText);
    const stressPattern = this.calculateStressPattern(targetText, spokenText);
    
    const overallScore = (accuracy * 0.3 + fluency * 0.25 + clarity * 0.2 + pacing * 0.15 + stressPattern * 0.1) * 100;
    
    return {
      overallScore: Math.round(overallScore),
      accuracy: Math.round(accuracy * 100),
      fluency: Math.round(fluency * 100),
      clarity: Math.round(clarity * 100),
      pacing: Math.round(pacing * 100),
      stressPattern: Math.round(stressPattern * 100),
      soundAccuracies,
      recommendations: this.generateRecommendations(soundAccuracies, accuracy),
      strengths: this.generateStrengths(soundAccuracies, accuracy),
      improvements: this.generateImprovements(soundAccuracies, accuracy)
    };
  }
  
  private calculateFluency(targetText: string, spokenText: string): number {
    const targetWords = targetText.split(' ').length;
    const spokenWords = spokenText.split(' ').length;
    const wordCountRatio = Math.min(spokenWords / targetWords, 1.0);
    
    // Check for hesitations and fillers
    const hesitations = (spokenText.match(/\b(um|uh|er|ah)\b/gi) || []).length;
    const hesitationPenalty = Math.max(0, 1 - (hesitations * 0.1));
    
    return wordCountRatio * hesitationPenalty;
  }
  
  private calculateClarity(spokenText: string): number {
    // Simple clarity metric based on word recognition
    const words = spokenText.split(' ');
    const clearWords = words.filter(word => word.length > 2 && /^[a-zA-Z]+$/.test(word));
    return words.length > 0 ? clearWords.length / words.length : 0;
  }
  
  private calculatePacing(targetText: string, spokenText: string): number {
    // Ideal pacing: not too fast, not too slow
    const targetLength = targetText.length;
    const spokenLength = spokenText.length;
    const ratio = spokenLength / targetLength;
    
    // Optimal ratio is around 0.8-1.2
    if (ratio >= 0.8 && ratio <= 1.2) {
      return 1.0;
    } else if (ratio >= 0.6 && ratio <= 1.5) {
      return 0.8;
    } else {
      return 0.6;
    }
  }
  
  private calculateStressPattern(targetText: string, spokenText: string): number {
    // Basic stress pattern analysis (simplified)
    const targetWords = targetText.split(' ');
    const spokenWords = spokenText.split(' ');
    
    let stressMatches = 0;
    const totalWords = Math.min(targetWords.length, spokenWords.length);
    
    for (let i = 0; i < totalWords; i++) {
      // Simple heuristic: longer words should have stress
      if (targetWords[i].length > 5 && spokenWords[i].length > 5) {
        stressMatches++;
      } else if (targetWords[i].length <= 5 && spokenWords[i].length <= 5) {
        stressMatches++;
      }
    }
    
    return totalWords > 0 ? stressMatches / totalWords : 0;
  }
  
  private generateRecommendations(soundAccuracies: SoundAccuracy[], accuracy: number): string[] {
    const recommendations: string[] = [];
    
    if (accuracy < 0.7) {
      recommendations.push("Focus on practicing individual sounds before full sentences");
      recommendations.push("Use a mirror to watch your mouth movements");
    }
    
    if (accuracy < 0.5) {
      recommendations.push("Record yourself and compare with native speakers");
      recommendations.push("Start with slower speech and gradually increase pace");
    }
    
    // Specific sound recommendations
    const problematicSounds = soundAccuracies.filter(sa => sa.accuracy < 0.6);
    for (const sound of problematicSounds) {
      const difficultSound = difficultSounds.find(ds => ds.phoneme === sound.phoneme);
      if (difficultSound) {
        recommendations.push(`Practice ${difficultSound.symbol}: ${difficultSound.tips[0]}`);
      }
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }
  
  private generateStrengths(soundAccuracies: SoundAccuracy[], accuracy: number): string[] {
    const strengths: string[] = [];
    
    if (accuracy >= 0.8) {
      strengths.push("Excellent overall pronunciation accuracy");
    }
    
    if (accuracy >= 0.6) {
      strengths.push("Good speech clarity and intelligibility");
    }
    
    // Specific sound strengths
    const goodSounds = soundAccuracies.filter(sa => sa.accuracy >= 0.8);
    for (const sound of goodSounds) {
      const difficultSound = difficultSounds.find(ds => ds.phoneme === sound.phoneme);
      if (difficultSound) {
        strengths.push(`Strong ${difficultSound.symbol} pronunciation`);
      }
    }
    
    return strengths.slice(0, 3); // Limit to top 3 strengths
  }
  
  private generateImprovements(soundAccuracies: SoundAccuracy[], accuracy: number): string[] {
    const improvements: string[] = [];
    
    if (accuracy < 0.5) {
      improvements.push("Work on basic phoneme recognition and production");
      improvements.push("Practice minimal pairs exercises");
    }
    
    if (accuracy < 0.7) {
      improvements.push("Focus on mouth positioning for difficult sounds");
      improvements.push("Increase practice time with repetition exercises");
    }
    
    // Specific sound improvements
    const problematicSounds = soundAccuracies.filter(sa => sa.accuracy < 0.7);
    for (const sound of problematicSounds) {
      const difficultSound = difficultSounds.find(ds => ds.phoneme === sound.phoneme);
      if (difficultSound) {
        improvements.push(`Improve ${difficultSound.symbol}: ${difficultSound.tips[1] || difficultSound.tips[0]}`);
      }
    }
    
    return improvements.slice(0, 4); // Limit to top 4 improvements
  }
}

export const advancedPronunciationAnalyzer = new AdvancedPronunciationAnalyzer();