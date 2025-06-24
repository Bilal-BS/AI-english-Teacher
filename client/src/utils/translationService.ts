import { openaiService } from './openaiService';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  language: 'tamil' | 'sinhala';
}

export interface BilingualCorrection {
  correctedEnglish: string;
  explanationEnglish: string;
  explanationNative: string;
  correctedNative?: string;
  language: 'tamil' | 'sinhala';
}

export class TranslationService {
  private readonly languageNames = {
    tamil: 'Tamil',
    sinhala: 'Sinhala'
  };

  async translateText(text: string, targetLanguage: 'tamil' | 'sinhala'): Promise<TranslationResult> {
    try {
      const prompt = `Translate the following English text to ${this.languageNames[targetLanguage]}. Provide only the translation, no additional text:

"${text}"`;

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage, prompt })
      });

      const result = await response.json();
      
      return {
        originalText: text,
        translatedText: result.translation || text,
        language: targetLanguage
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        originalText: text,
        translatedText: text,
        language: targetLanguage
      };
    }
  }

  async getBilingualCorrection(
    userInput: string, 
    targetLanguage: 'tamil' | 'sinhala'
  ): Promise<BilingualCorrection> {
    try {
      const prompt = `You are an English teacher who speaks ${this.languageNames[targetLanguage]}. 

Correct the English sentence and explain the corrections in both English and ${this.languageNames[targetLanguage]}.

Format your response exactly like this:
Corrected: <corrected English sentence>
English Explanation: <explanation in English>
${this.languageNames[targetLanguage]} Explanation: <explanation in ${this.languageNames[targetLanguage]}>
Reply: <natural conversation response in English>

User sentence: "${userInput}"`;

      const response = await fetch('/api/bilingual-correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput, targetLanguage, prompt })
      });

      const result = await response.json();
      
      return {
        correctedEnglish: result.corrected || userInput,
        explanationEnglish: result.englishExplanation || 'No corrections needed',
        explanationNative: result.nativeExplanation || 'No corrections needed',
        language: targetLanguage
      };
    } catch (error) {
      console.error('Bilingual correction error:', error);
      return {
        correctedEnglish: userInput,
        explanationEnglish: 'Error processing correction',
        explanationNative: 'Error processing correction',
        language: targetLanguage
      };
    }
  }

  // Fallback translations for common phrases
  private getFallbackTranslation(text: string, language: 'tamil' | 'sinhala'): string {
    const fallbacks: Record<'tamil' | 'sinhala', Record<string, string>> = {
      tamil: {
        'Good job!': 'நல்லது!',
        'Try again': 'மீண்டும் முயற்சிக்கவும்',
        'Correct': 'சரி',
        'Wrong': 'தவறு',
        'Grammar error': 'இலக்கண பிழை',
        'Spelling error': 'எழுத்துப்பிழை',
        'Well done!': 'சிறப்பாக செய்தீர்கள்!',
        'Keep practicing': 'தொடர்ந்து பயிற்சி செய்யுங்கள்'
      },
      sinhala: {
        'Good job!': 'හොඳයි!',
        'Try again': 'නැවත උත්සාහ කරන්න',
        'Correct': 'නිවැරදියි',
        'Wrong': 'වැරදියි',
        'Grammar error': 'ව්‍යාකරණ දෝෂයක්',
        'Spelling error': 'අක්ෂර වින්‍යාස දෝෂයක්',
        'Well done!': 'හොඳින් කළා!',
        'Keep practicing': 'දිගටම පුහුණු වන්න'
      }
    };

    return fallbacks[language][text] || text;
  }

  getFallbackPhrase(key: string, language: 'tamil' | 'sinhala'): string {
    return this.getFallbackTranslation(key, language);
  }
}

export const translationService = new TranslationService();