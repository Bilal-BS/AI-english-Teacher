import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { getCorrectedConversation } from './openaiService';

import { analyzeErrorsComprehensively, getDynamicConversationResponse } from './advancedErrorDetection';
import { analyzeSpeechComprehensively } from './advancedSpeechAnalysis';
import { analyzeConversationErrors, generateWhatsAppStyleResponse } from './conversationErrorDetection';

export async function registerRoutes(app: Express): Promise<Server> {
  // Advanced error analysis route
  app.post("/api/analyze-errors", async (req, res) => {
    try {
      const { text, userLevel = 'beginner' } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required for analysis" });
      }

      const analysis = await analyzeErrorsComprehensively(text, userLevel);
      res.json(analysis);
    } catch (error) {
      console.error("Error analysis failed:", error);
      res.status(500).json({ 
        error: "Failed to analyze errors",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // WhatsApp-style conversation with error detection
  app.post("/api/conversation-practice", async (req, res) => {
    try {
      const { userInput, conversationHistory, userLevel = 'beginner', whatsappStyle = true } = req.body;
      
      if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
      }

      const corrections = await analyzeConversationErrors(
        userInput, 
        conversationHistory || [], 
        userLevel
      );

      if (whatsappStyle) {
        const response = await generateWhatsAppStyleResponse(
          userInput,
          corrections,
          conversationHistory || []
        );
        
        res.json({
          ...corrections,
          whatsappResponse: response
        });
      } else {
        res.json(corrections);
      }
    } catch (error) {
      console.error("Conversation practice error:", error);
      res.status(500).json({ 
        error: "Failed to process conversation",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Dynamic conversation route
  app.post("/api/dynamic-conversation", async (req, res) => {
    try {
      const { userInput, conversationHistory, userLevel = 'beginner', topic = 'general' } = req.body;
      
      if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
      }

      const result = await getDynamicConversationResponse(
        userInput, 
        conversationHistory || [], 
        userLevel, 
        topic
      );
      res.json(result);
    } catch (error) {
      console.error("Dynamic conversation error:", error);
      res.status(500).json({ 
        error: "Failed to process conversation",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // OpenAI conversation route
  app.post('/api/conversation', async (req, res) => {
    try {
      const { userInput, conversationHistory } = req.body;
      
      if (!userInput || typeof userInput !== 'string') {
        return res.status(400).json({ error: 'User input is required' });
      }

      const result = await getCorrectedConversation(userInput, conversationHistory || []);
      
      // Enhanced parsing with detailed corrections
      const corrected = result?.match(/Corrected:\s*(.+)/i)?.[1]?.trim() || "";
      const reply = result?.match(/Reply:\s*(.+)/i)?.[1]?.trim() || "";
      
      // Extract detailed corrections
      const correctionsBlock = result?.split("Corrections:")[1]?.split("Reply:")[0]?.trim() || "";
      const corrections = correctionsBlock
        .split("\n")
        .filter(line => line.trim().startsWith("-"))
        .map(line => {
          const match = line.match(/- "([^"]+)" → "([^"]+)": (.+)/);
          if (match) {
            return {
              original: match[1],
              corrected: match[2],
              explanation: match[3],
              type: 'grammar'
            };
          }
          return null;
        })
        .filter(Boolean);
      
      // Use corrected text if found, otherwise original
      const finalCorrected = corrected || userInput;
      const finalReply = reply || "That's interesting! Tell me more.";
      
      res.json({
        corrected: finalCorrected,
        reply: finalReply,
        hasCorrections: finalCorrected !== userInput,
        corrections: corrections
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Comprehensive fallback correction system like Grammarly
      const input = req.body.userInput || '';
      let fallbackCorrected = input;
      let detailedCorrections = [];
      
      // Comprehensive grammar patterns with detailed explanations
      const grammarPatterns = [
        {
          pattern: /\bhe say me that\b/gi,
          replacement: 'he told me that',
          explanation: 'Changed "say me" to "told me" - correct reporting verb structure',
          type: 'grammar'
        },
        {
          pattern: /\bdont has no\b/gi,
          replacement: "doesn't have any",
          explanation: 'Fixed double negative "dont has no" to "doesn\'t have any"',
          type: 'grammar'
        },
        {
          pattern: /\byestarday\b/gi,
          replacement: 'yesterday',
          explanation: 'Corrected spelling: "yestarday" → "yesterday"',
          type: 'spelling'
        },
        {
          pattern: /\byasterday\b/gi,
          replacement: 'yesterday',
          explanation: 'Corrected spelling: "yasterday" → "yesterday"',
          type: 'spelling'
        },
        {
          pattern: /\btommorow\b/gi,
          replacement: 'tomorrow',
          explanation: 'Corrected spelling: "tommorow" → "tomorrow"',
          type: 'spelling'
        },
        {
          pattern: /\brecieve\b/gi,
          replacement: 'receive',
          explanation: 'Corrected spelling: "recieve" → "receive"',
          type: 'spelling'
        },
        {
          pattern: /\bseperate\b/gi,
          replacement: 'separate',
          explanation: 'Corrected spelling: "seperate" → "separate"',
          type: 'spelling'
        },
        {
          pattern: /\bteacher\b/gi,
          replacement: 'teacher',
          explanation: 'Spelling is correct',
          type: 'spelling'
        },
        {
          pattern: /\bi not go\b/gi,
          replacement: "I didn't go",
          explanation: 'Corrected negative past tense: "not go" → "didn\'t go"',
          type: 'grammar'
        },
        {
          pattern: /\bi sick\b/gi,
          replacement: 'I was sick',
          explanation: 'Added missing verb "was" to complete the sentence',
          type: 'grammar'
        },
        {
          pattern: /\bi drink yesterday water\b/gi,
          replacement: 'I drank water yesterday',
          explanation: 'Corrected word order and past tense: "drink yesterday water" → "drank water yesterday"',
          type: 'grammar'
        },
        {
          pattern: /\bhe go\b/gi,
          replacement: 'he goes',
          explanation: 'Added "s" for third person singular present tense',
          type: 'grammar'
        },
        {
          pattern: /\bshe go\b/gi,
          replacement: 'she goes',
          explanation: 'Added "s" for third person singular present tense',
          type: 'grammar'
        },
        {
          pattern: /\bi go (.+) yesterday\b/gi,
          replacement: 'I went $1 yesterday',
          explanation: 'Changed "go" to "went" for past tense with "yesterday"',
          type: 'grammar'
        },
        {
          pattern: /\bdon't have no\b/gi,
          replacement: "don't have any",
          explanation: 'Corrected double negative construction',
          type: 'grammar'
        },
        {
          pattern: /\bmuch people\b/gi,
          replacement: 'many people',
          explanation: 'Use "many" with countable nouns like "people"',
          type: 'grammar'
        },
        {
          pattern: /\bmore better\b/gi,
          replacement: 'better',
          explanation: 'Removed redundant "more" - "better" is already comparative',
          type: 'grammar'
        },
        {
          pattern: /\bi are\b/gi,
          replacement: 'I am',
          explanation: 'Corrected subject-verb agreement: "I" takes "am"',
          type: 'grammar'
        },
        {
          pattern: /\byou is\b/gi,
          replacement: 'you are',
          explanation: 'Corrected subject-verb agreement: "you" takes "are"',
          type: 'grammar'
        },
        {
          pattern: /\b(i|he|she|it|we|they)\s+([a-z]+)\s+yesterday\s+([a-z]+)\b/gi,
          replacement: (match, subject, verb, object) => {
            const pastTense = {
              'drink': 'drank',
              'eat': 'ate',
              'go': 'went',
              'come': 'came',
              'see': 'saw',
              'buy': 'bought',
              'make': 'made',
              'take': 'took',
              'give': 'gave',
              'want': 'wanted',
              'be': 'was'
            };
            const pastVerb = pastTense[verb.toLowerCase()] || verb + 'ed';
            return `${subject} ${pastVerb} ${object} yesterday`;
          },
          explanation: 'Corrected word order and past tense form',
          type: 'grammar'
        },
        {
          pattern: /\bwant to be yesterday\b/gi,
          replacement: 'wanted to be',
          explanation: 'Corrected past tense: "want to be yesterday" → "wanted to be"',
          type: 'grammar'
        }
      ];
      
      // Apply each pattern and track changes
      let hasChanges = false;
      for (const pattern of grammarPatterns) {
        if (pattern.pattern.test(fallbackCorrected)) {
          const originalMatch = fallbackCorrected.match(pattern.pattern)?.[0] || '';
          fallbackCorrected = fallbackCorrected.replace(pattern.pattern, pattern.replacement);
          detailedCorrections.push({
            original: originalMatch,
            corrected: pattern.replacement,
            explanation: pattern.explanation,
            type: pattern.type
          });
          hasChanges = true;
        }
      }
      
      // Generate more varied conversational responses based on input
      const lowerInput = input.toLowerCase();
      let responseCategories;
      
      if (lowerInput.includes('yesterday') || lowerInput.includes('past') || lowerInput.includes('was') || lowerInput.includes('went')) {
        responseCategories = [
          "That sounds like it was interesting! What was the best part?",
          "How did that make you feel?",
          "Did you enjoy that experience?",
          "Would you do something like that again?"
        ];
      } else if (lowerInput.includes('will') || lowerInput.includes('tomorrow') || lowerInput.includes('future') || lowerInput.includes('plan')) {
        responseCategories = [
          "That sounds exciting! Are you looking forward to it?",
          "What are you most excited about?",
          "How are you preparing for that?",
          "That sounds like a great plan!"
        ];
      } else if (lowerInput.includes('like') || lowerInput.includes('love') || lowerInput.includes('enjoy')) {
        responseCategories = [
          "That's wonderful! What do you like most about it?",
          "How long have you enjoyed that?",
          "What got you interested in that?",
          "That's great to hear!"
        ];
      } else {
        responseCategories = [
          "That's interesting! Can you tell me more?",
          "What do you think about that?",
          "How does that make you feel?",
          "That sounds nice! What happened next?"
        ];
      }
      
      const randomResponse = responseCategories[Math.floor(Math.random() * responseCategories.length)];
      
      res.json({ 
        corrected: fallbackCorrected,
        reply: randomResponse,
        hasCorrections: hasChanges,
        corrections: detailedCorrections
      });
    }
  });

  const httpServer = createServer(app);

  // Translation API endpoints
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLanguage, prompt } = req.body;
      
      if (!text || !targetLanguage || !prompt) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Try OpenAI translation first
      if (process.env.OPENAI_API_KEY) {
        try {
          const result = await getCorrectedConversation(prompt, []);
          res.json({ translation: result.trim() });
          return;
        } catch (error) {
          console.error('OpenAI translation error:', error);
        }
      }

      // Fallback translations
      const fallbackTranslations: Record<string, Record<string, string>> = {
        tamil: {
          'Good job!': 'நல்லது!',
          'Try again': 'மீண்டும் முயற்சிக்கவும்',
          'Correct': 'சரி',
          'Grammar error': 'இலக்கண பிழை',
          'Well done!': 'சிறப்பாக செய்தீர்கள்!',
          'Keep practicing': 'தொடர்ந்து பயிற்சி செய்யுங்கள்',
          'That sounds interesting!': 'அது சுவாரஸ்யமாக தெரிகிறது!',
          'What happened next?': 'அதற்கு பிறகு என்ன நடந்தது?',
          'How did you feel?': 'உங்களுக்கு எப்படி உணர்வு ஏற்பட்டது?'
        },
        sinhala: {
          'Good job!': 'හොඳයි!',
          'Try again': 'නැවත උත්සාහ කරන්න',
          'Correct': 'නිවැරදියි',
          'Grammar error': 'ව්‍යාකරණ දෝෂයක්',
          'Well done!': 'හොඳින් කළා!',
          'Keep practicing': 'දිගටම පුහුණු වන්න',
          'That sounds interesting!': 'ඒක සිත්ගන්නවා!',
          'What happened next?': 'ඊළඟට මොනවද වුණේ?',
          'How did you feel?': 'ඔයාට මොන හැඟීමක් ආවද?'
        }
      };

      const translation = fallbackTranslations[targetLanguage]?.[text] || text;
      res.json({ translation });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed' });
    }
  });

  app.post('/api/bilingual-correction', async (req, res) => {
    try {
      const { userInput, targetLanguage, prompt } = req.body;
      
      if (!userInput || !targetLanguage || !prompt) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Try OpenAI bilingual correction
      if (process.env.OPENAI_API_KEY) {
        try {
          const result = await getCorrectedConversation(prompt, []);
          
          const corrected = result?.match(/Corrected:\s*(.+)/i)?.[1]?.trim() || userInput;
          const englishExplanation = result?.match(/English Explanation:\s*(.+)/i)?.[1]?.trim() || 'No corrections needed';
          const nativeExplanation = result?.match(new RegExp(`${targetLanguage === 'tamil' ? 'Tamil' : 'Sinhala'} Explanation:\\s*(.+)`, 'i'))?.[1]?.trim() || 'No corrections needed';
          const reply = result?.match(/Reply:\s*(.+)/i)?.[1]?.trim() || 'Great!';

          res.json({
            corrected,
            englishExplanation,
            nativeExplanation,
            reply
          });
          return;
        } catch (error) {
          console.error('OpenAI bilingual correction error:', error);
        }
      }

      // Enhanced fallback bilingual corrections with detailed analysis
      const input = userInput.toLowerCase();
      let corrected = userInput;
      let englishExplanation = 'No corrections needed';
      let nativeExplanation = 'No corrections needed';
      let corrections = [];

      // Comprehensive grammar pattern matching
      const grammarFixes = [
        {
          pattern: /\bi go (.+) yesterday\b/gi,
          replacement: 'I went $1 yesterday',
          explanation: 'Changed "go" to "went" for past tense with "yesterday"',
          tamilExplanation: '"நேற்று" உடன் "go" ஐ "went" ஆக மாற்றினேன்',
          sinhalaExplanation: '"ඊයේ" සමග "go" "went" බවට වෙනස් කළා'
        },
        {
          pattern: /\bhe go\b/gi,
          replacement: 'he goes',
          explanation: 'Added "s" to verb for third person singular',
          tamilExplanation: 'மூன்றாம் நபர் ஒருமைக்கு வினைச்சொல்லில் "s" சேர்த்தேன்',
          sinhalaExplanation: 'තුන්වන පුද්ගලයා සඳහා ක්‍රියාපදයට "s" එකතු කළා'
        },
        {
          pattern: /\bshe go\b/gi,
          replacement: 'she goes',
          explanation: 'Added "s" to verb for third person singular',
          tamilExplanation: 'மூன්றாம் நபர் ஒருমைக்கு வினைச்சொல்லில் "s" சேர்த்தேன்',
          sinhalaExplanation: 'තුන්වන පුද්ගලයා සඳහා ක්‍රියාපදයට "s" එකතු කළා'
        },
        {
          pattern: /\bdont has\b/gi,
          replacement: "doesn't have",
          explanation: 'Corrected double negative and contraction',
          tamilExplanation: 'இரட்டை மறுப்பு மற்றும் சுருக்கத்தை சரி செய்தேன்',
          sinhalaExplanation: 'ද්විත්ව නිෂේධන සහ සංකෝචනය නිවැරදි කළා'
        },
        {
          pattern: /\byestarday\b/gi,
          replacement: 'yesterday',
          explanation: 'Corrected spelling error',
          tamilExplanation: 'எழுத்துப்பிழையை சரி செய்தேன்',
          sinhalaExplanation: 'අක්ෂර වින්‍යාස දෝෂය නිවැරදි කළා'
        }
      ];

      for (const fix of grammarFixes) {
        if (fix.pattern.test(corrected)) {
          const originalText = corrected.match(fix.pattern)?.[0] || '';
          corrected = corrected.replace(fix.pattern, fix.replacement);
          corrections.push({
            original: originalText,
            corrected: fix.replacement,
            explanation: fix.explanation,
            type: 'grammar'
          });
          englishExplanation = fix.explanation;
          nativeExplanation = targetLanguage === 'tamil' ? fix.tamilExplanation : fix.sinhalaExplanation;
          break;
        }
      }

      const responses = [
        'That sounds great!',
        'Tell me more about that.',
        'How interesting!',
        'What do you think about it?'
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];

      res.json({
        corrected,
        englishExplanation,
        nativeExplanation,
        reply,
        corrections
      });
    } catch (error) {
      console.error('Bilingual correction error:', error);
      res.status(500).json({ error: 'Bilingual correction failed' });
    }
  });

  return httpServer;
}
