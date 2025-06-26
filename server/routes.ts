import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { getCorrectedConversation } from './openaiService';

import { analyzeErrorsComprehensively, getDynamicConversationResponse } from './advancedErrorDetection';
import { analyzeSpeechComprehensively } from './advancedSpeechAnalysis';
import { analyzeConversationErrors, generateWhatsAppStyleResponse } from './conversationErrorDetection';
import { checkGrammarWithFreeAPIs, generateLevelBasedResponse } from './freeGrammarAPIs';

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

  // Free Grammar API with level-based conversation
  app.post("/api/level-conversation", async (req, res) => {
    try {
      const { userInput, userLevel = 'beginner', conversationHistory = [] } = req.body;
      
      if (!userInput) {
        return res.status(400).json({ error: "User input is required" });
      }

      // Use free grammar APIs with fallback
      const grammarResult = await checkGrammarWithFreeAPIs(userInput, userLevel);
      
      // Generate level-appropriate response
      const levelResponse = await generateLevelBasedResponse(
        userInput,
        grammarResult,
        userLevel,
        conversationHistory
      );

      res.json({
        originalText: grammarResult.originalText,
        correctedText: grammarResult.correctedText,
        hasErrors: grammarResult.hasErrors,
        errors: grammarResult.errors,
        confidence: grammarResult.confidence,
        explanation: levelResponse.explanation,
        conversationReply: levelResponse.conversationReply,
        grammarScore: levelResponse.grammarScore,
        userLevel: levelResponse.level,
        suggestions: grammarResult.suggestions
      });
    } catch (error) {
      console.error("Level conversation error:", error);
      res.status(500).json({ 
        error: "Failed to process level conversation",
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

  // Advanced 30-Day English Lessons API
  app.get('/api/advanced-lessons', async (req, res) => {
    try {
      const advancedLessons = `Day 1: Foundation Building - Perfect Pronunciation Basics
Welcome to your 30-day advanced English journey! Today we focus on building strong pronunciation foundations.

🎯 Learning Objectives:
- Master the International Phonetic Alphabet (IPA) basics
- Practice tongue placement for clear consonants
- Develop breath control for sustained speech

📚 Core Exercises:
1. IPA Recognition: Learn 20 essential phonetic symbols
2. Tongue Twisters: "Red leather, yellow leather" (5 minutes)
3. Breathing Exercise: Count 1-20 in one breath
4. Mirror Practice: Watch mouth movements while speaking

🗣️ Speaking Challenge:
Record yourself saying: "The quick brown fox jumps over the lazy dog"
Focus on clear articulation of each consonant sound.

💡 Cultural Note:
In professional English settings, clear pronunciation is more important than accent. Native speakers appreciate effort over perfection.

Day 2: Advanced Grammar Mastery - Complex Sentence Structures
Today we eliminate common grammar errors and build sophisticated sentence patterns.

🎯 Learning Objectives:
- Master subject-verb agreement in complex sentences
- Use conditional sentences with confidence
- Apply advanced tense combinations correctly

📚 Core Exercises:
1. Complex Conditionals: If I had known... I would have...
2. Reported Speech: Transform 10 direct quotes to indirect speech
3. Passive Voice Mastery: Convert active sentences to passive
4. Subjunctive Mood: Practice formal expressions

🗣️ Speaking Challenge:
Create 5 sentences using: "Had I known that..., I would have..."
Example: "Had I known that the meeting was cancelled, I wouldn't have come early."

💡 Grammar Tip:
Advanced speakers use inversion in conditional sentences. "Were I to travel..." instead of "If I were to travel..."

Day 3: Vocabulary Enhancement - Academic and Professional Terms
Expand your vocabulary with high-level terms used in academic and business contexts.

🎯 Learning Objectives:
- Learn 25 academic vocabulary words
- Practice collocations and word partnerships
- Use synonyms to avoid repetition

📚 Core Exercises:
1. Word Mapping: Create mind maps for 5 root words
2. Collocation Practice: "make" vs "do" in 20 expressions
3. Synonym Substitution: Replace common words with advanced alternatives
4. Context Clues: Guess meanings from academic passages

🗣️ Speaking Challenge:
Deliver a 2-minute presentation using at least 10 new vocabulary words.
Topic: "The implications of technological advancement in modern society"

💡 Vocabulary Strategy:
Learn words in chunks, not isolation. "Reach a consensus" is more useful than just "consensus."

Day 4: Listening Comprehension - Advanced Audio Processing
Develop skills to understand fast, natural speech with various accents.

🎯 Learning Objectives:
- Identify main ideas in rapid speech
- Understand implied meanings and context
- Process different English accents (British, American, Australian)

📚 Core Exercises:
1. Speed Listening: Start at 1.25x speed, progress to 1.5x
2. Accent Recognition: Listen to 3 different accent samples
3. Note-taking Practice: Summarize 10-minute lectures
4. Prediction Skills: Guess what comes next in conversations

🗣️ Speaking Challenge:
Shadow speak with a native speaker audio for 5 minutes.
Match their rhythm, intonation, and speed exactly.

💡 Listening Tip:
Don't try to understand every word. Focus on key information and context clues to grasp the overall meaning.

Day 5: Writing Excellence - Professional Communication
Master formal writing styles for academic and business purposes.

🎯 Learning Objectives:
- Structure formal emails and reports
- Use transitional phrases effectively
- Maintain consistent tone and style

📚 Core Exercises:
1. Email Templates: Write 3 professional emails (inquiry, complaint, follow-up)
2. Report Writing: Create a 300-word analytical report
3. Transition Practice: Connect ideas using 15 different linking words
4. Tone Adjustment: Rewrite casual text in formal style

🗣️ Speaking Challenge:
Present your written report aloud, maintaining professional tone.
Practice clear delivery with appropriate pauses.

💡 Writing Strategy:
Start with an outline. Professional writing follows: Introduction → Body → Conclusion with clear topic sentences.

Day 6: Idiomatic Expressions - Natural Speech Patterns
Learn common idioms and expressions that native speakers use daily.

🎯 Learning Objectives:
- Understand 20 business idioms
- Use expressions appropriately in context
- Recognize figurative language in conversations

📚 Core Exercises:
1. Idiom Matching: Connect expressions with meanings
2. Context Practice: Use idioms in appropriate situations
3. Cultural Background: Learn origins of 10 common idioms
4. Expression Replacement: Substitute direct language with idioms

🗣️ Speaking Challenge:
Role-play a business meeting using at least 8 idiomatic expressions naturally.
Focus on: "think outside the box," "touch base," "hit the ground running"

💡 Idiom Usage:
Use idioms sparingly in formal writing but freely in spoken English. They show cultural understanding.

Day 7: Pronunciation Perfection - Difficult Sound Combinations
Focus on the most challenging sounds for non-native speakers.

🎯 Learning Objectives:
- Master TH sounds (voiced and voiceless)
- Perfect R and L distinction
- Practice consonant clusters

📚 Core Exercises:
1. TH Practice: "Think," "this," "three," "that" (100 repetitions)
2. R/L Minimal Pairs: "rice/lice," "right/light," "read/lead"
3. Consonant Clusters: "strengths," "twelfths," "sixths"
4. Sound Recording: Compare your pronunciation with native speakers

🗣️ Speaking Challenge:
Read this tongue twister clearly 5 times:
"The thirty-three thieves thought they thrilled the throne throughout Thursday"

💡 Pronunciation Secret:
For TH sounds, place tongue between teeth. For R sounds, don't let tongue touch the roof of your mouth.

Day 8: Advanced Conversation Skills - Maintaining Flow
Develop strategies for smooth, natural conversation flow.

🎯 Learning Objectives:
- Use conversation fillers appropriately
- Practice turn-taking in discussions
- Handle disagreements diplomatically

📚 Core Exercises:
1. Filler Practice: "Well," "Actually," "I mean," "You know"
2. Opinion Expression: "I tend to think," "In my view," "I'm inclined to believe"
3. Disagreement Softeners: "I see your point, but," "That's interesting, however"
4. Topic Transitions: "Speaking of which," "That reminds me"

🗣️ Speaking Challenge:
Engage in a 10-minute debate about renewable energy.
Practice diplomatic disagreement and smooth transitions.

💡 Conversation Tip:
Native speakers use many fillers and hesitation markers. They're not mistakes—they're natural speech patterns.

Day 9: Reading Comprehension - Complex Text Analysis
Develop skills to quickly understand sophisticated written material.

🎯 Learning Objectives:
- Identify author's tone and purpose
- Analyze argumentative structures
- Extract key information efficiently

📚 Core Exercises:
1. Skimming Practice: Get main ideas from 5 articles in 10 minutes
2. Scanning Skills: Find specific information quickly
3. Inference Training: Read between the lines
4. Critical Analysis: Identify bias and assumptions

🗣️ Speaking Challenge:
Summarize a complex article in 3 minutes.
Include main points, supporting evidence, and your analysis.

💡 Reading Strategy:
Read the first and last paragraphs first, then topic sentences. This gives you the article's structure before details.

Day 10: Business English - Professional Meeting Skills
Master the language needed for effective business communication.

🎯 Learning Objectives:
- Lead and participate in meetings effectively
- Present ideas persuasively
- Handle questions and objections professionally

📚 Core Exercises:
1. Meeting Phrases: "Let's move on to," "I'd like to add," "Could you clarify"
2. Presentation Structure: Opening → Main Points → Conclusion
3. Question Handling: "That's a good question," "Let me think about that"
4. Action Items: "I'll follow up on," "We need to," "The next step is"

🗣️ Speaking Challenge:
Lead a 15-minute mock business meeting.
Include agenda setting, discussion facilitation, and action planning.

💡 Business Tip:
In international business, clarity is king. Speak slowly, use simple structures, and confirm understanding frequently.

Day 11: Cultural Communication - Context and Nuance
Understand how culture affects English communication styles.

🎯 Learning Objectives:
- Recognize direct vs. indirect communication
- Understand high-context vs. low-context cultures
- Adapt communication style to audience

📚 Core Exercises:
1. Style Comparison: Direct ("No") vs. Indirect ("That might be challenging")
2. Politeness Strategies: Softening requests and refusals
3. Cultural Scripts: Appropriate responses in different situations
4. Nonverbal Awareness: Understanding gestures and space

🗣️ Speaking Challenge:
Practice the same request in 3 different styles:
- Direct: "I need this report by Friday"
- Polite: "Would it be possible to have the report by Friday?"
- Indirect: "I was wondering if the report might be ready by Friday"

💡 Cultural Insight:
Americans tend to be direct, British more indirect, and many Asian cultures very indirect. Adapt accordingly.

Day 12: Error Correction - Self-Monitoring Skills
Develop the ability to catch and correct your own mistakes.

🎯 Learning Objectives:
- Identify common error patterns
- Develop self-correction strategies
- Build confidence in self-editing

📚 Core Exercises:
1. Error Log: Track your 10 most common mistakes
2. Self-Recording: Record yourself and identify errors
3. Correction Strategies: Learn to pause and rephrase
4. Peer Review: Exchange recordings with practice partners

🗣️ Speaking Challenge:
Give a 5-minute impromptu speech on "My biggest challenge."
Stop and correct yourself when you notice errors.

💡 Self-Correction:
It's better to pause and correct yourself than to continue with errors. This shows language awareness.

Day 13: Academic English - Research and Analysis Language
Master the formal language needed for academic success.

🎯 Learning Objectives:
- Use academic discourse markers
- Express certainty and uncertainty appropriately
- Cite sources and present evidence

📚 Core Exercises:
1. Hedging Language: "It appears that," "This suggests," "Arguably"
2. Citation Phrases: "According to," "As stated by," "Research indicates"
3. Analysis Terms: "Furthermore," "Nevertheless," "Consequently"
4. Argument Structure: Thesis → Evidence → Counter-argument → Conclusion

🗣️ Speaking Challenge:
Present a 10-minute academic argument on "The impact of social media on communication."
Use formal academic language and structure.

💡 Academic Style:
Academic English values precision over personality. Use passive voice, formal vocabulary, and cautious claims.

Day 14: Storytelling and Narrative - Engaging Communication
Learn to tell compelling stories and maintain audience interest.

🎯 Learning Objectives:
- Structure narratives effectively
- Use descriptive language vividly
- Maintain chronological flow

📚 Core Exercises:
1. Story Elements: Setting → Characters → Conflict → Resolution
2. Descriptive Practice: Use all five senses in descriptions
3. Dialogue Integration: Make characters come alive
4. Pacing Control: Build tension and release

🗣️ Speaking Challenge:
Tell a 7-minute personal story about overcoming a challenge.
Include dialogue, description, and emotional content.

💡 Storytelling Secret:
Start in the middle of action, then fill in background. "I was hanging upside down..." grabs attention better than "I decided to go rock climbing."

Day 15: Technical Communication - Explaining Complex Ideas
Develop skills to explain technical concepts clearly to different audiences.

🎯 Learning Objectives:
- Simplify complex information
- Use analogies and examples effectively
- Adapt explanations to audience level

📚 Core Exercises:
1. Analogy Creation: Explain internet like a highway system
2. Step-by-Step: Break complex processes into stages
3. Audience Adaptation: Same concept for experts vs. beginners
4. Visual Language: Use spatial and temporal descriptions

🗣️ Speaking Challenge:
Explain how artificial intelligence works to three different audiences:
- A 10-year-old child
- A business executive  
- A technical colleague

💡 Technical Tip:
Always start with the big picture, then zoom in. "Think of AI like a very smart pattern-matching system..."

Day 16: Debate and Argumentation - Persuasive Speaking
Master the art of constructing and presenting compelling arguments.

🎯 Learning Objectives:
- Structure logical arguments
- Use evidence effectively
- Handle counterarguments gracefully

📚 Core Exercises:
1. Argument Structure: Claim → Evidence → Warrant → Impact
2. Evidence Types: Statistics, expert opinions, examples, analogies
3. Rebuttal Techniques: Acknowledge → Refute → Redirect
4. Logical Fallacies: Identify and avoid common errors

🗣️ Speaking Challenge:
Participate in a formal debate: "Remote work is better than office work."
Present opening argument, respond to opponent, deliver closing statement.

💡 Debate Strategy:
Concede small points to gain credibility, then attack the main argument. "While my opponent makes a valid point about X, the larger issue is Y."

Day 17: Networking Language - Building Professional Relationships
Learn the specific language skills needed for effective networking.

🎯 Learning Objectives:
- Master small talk and conversation starters
- Exchange information professionally
- Follow up on connections appropriately

📚 Core Exercises:
1. Conversation Openers: Weather, current events, shared experiences
2. Professional Introductions: Name, role, company, interesting fact
3. Information Exchange: "What brings you here?" "How did you get started in...?"
4. Follow-up Language: "It was great meeting you," "I'd love to continue our conversation"

🗣️ Speaking Challenge:
Practice a 20-minute networking conversation covering:
- Introduction and small talk
- Professional background exchange
- Finding common interests
- Planning follow-up contact

💡 Networking Wisdom:
Ask questions about others rather than talking about yourself. People remember those who show genuine interest in them.

Day 18: Presentation Skills - Commanding Attention
Develop advanced presentation techniques for maximum impact.

🎯 Learning Objectives:
- Hook audiences from the opening
- Use vocal variety for emphasis
- Handle Q&A sessions confidently

📚 Core Exercises:
1. Opening Techniques: Question, statistic, story, or quote
2. Vocal Variety: Pace, pitch, volume, pause for emphasis
3. Body Language: Gestures, eye contact, movement
4. Q&A Preparation: Anticipate questions, practice responses

🗣️ Speaking Challenge:
Deliver a 12-minute presentation on "The Future of Work."
Include: Strong opening, clear structure, vocal variety, confident Q&A handling.

💡 Presentation Power:
Your opening 30 seconds determine audience engagement. Start with impact, not agenda or credentials.

Day 19: Conflict Resolution - Diplomatic Communication
Learn to navigate disagreements and find solutions through language.

🎯 Learning Objectives:
- Use diplomatic language to soften conflicts
- Find common ground in disagreements
- Propose solutions collaboratively

📚 Core Exercises:
1. Diplomatic Phrasing: "I understand your concern, and..." "That's one way to look at it..."
2. Active Listening: Paraphrase and validate before responding
3. Solution Language: "What if we..." "How about..." "Could we consider..."
4. Common Ground: "We both want..." "I think we agree that..."

🗣️ Speaking Challenge:
Role-play a workplace conflict resolution:
- Listen to complaints from both sides
- Find shared interests
- Propose mutually acceptable solutions

💡 Conflict Resolution:
Address the problem, not the person. Say "The deadline is challenging" not "You're being unreasonable."

Day 20: Advanced Listening - Subtext and Implication
Develop sophisticated listening skills to understand what's not directly stated.

🎯 Learning Objectives:
- Recognize implied meanings
- Understand emotional undertones
- Interpret cultural context clues

📚 Core Exercises:
1. Subtext Practice: "That's interesting" can mean agreement or skepticism
2. Tone Recognition: Identify sarcasm, frustration, enthusiasm
3. Cultural Codes: Understand indirect refusals and suggestions
4. Contextual Clues: Use situation to interpret ambiguous statements

🗣️ Speaking Challenge:
Listen to recorded conversations and identify:
- What speakers really mean beyond their words
- Emotional states and attitudes
- Implied requests or suggestions

💡 Advanced Listening:
Pay attention to what people don't say, changes in voice tone, and pauses. These often reveal true feelings.

Day 21: Spontaneous Speaking - Thinking on Your Feet
Develop fluency in unplanned speaking situations.

🎯 Learning Objectives:
- Organize thoughts quickly under pressure
- Use transitional phrases to buy thinking time
- Maintain confidence during impromptu speaking

📚 Core Exercises:
1. Quick Organization: Point-Reason-Example-Point structure
2. Thinking Time: "That's a great question," "Let me think about that"
3. Recovery Strategies: "What I mean to say is," "Let me rephrase that"
4. Confidence Building: Practice speaking without preparation

🗣️ Speaking Challenge:
Respond to 10 random questions with 2-minute impromptu answers:
- "What's your opinion on artificial intelligence?"
- "Describe your ideal vacation"
- "How would you solve traffic congestion?"

💡 Spontaneous Speaking:
Don't aim for perfection. Native speakers also hesitate, correct themselves, and use fillers. Focus on communication, not perfection.

Day 22: Cross-Cultural Communication - Global English Skills
Master English communication across different cultural contexts.

🎯 Learning Objectives:
- Adapt communication style to cultural expectations
- Avoid cultural misunderstandings
- Use inclusive language appropriately

📚 Core Exercises:
1. Cultural Adaptation: Direct vs. indirect communication styles
2. Inclusive Language: Gender-neutral and culturally sensitive terms
3. Assumption Checking: "In my culture..." vs. "In some cultures..."
4. Clarification Techniques: "Could you help me understand..." "In my experience..."

🗣️ Speaking Challenge:
Facilitate a discussion between people from different cultural backgrounds.
Practice inclusive facilitation and cultural bridge-building.

💡 Cultural Wisdom:
When in doubt, ask. "Could you help me understand the cultural context here?" shows respect and willingness to learn.

Day 23: Media and Technology Language - Digital Age Communication
Master the vocabulary and concepts of our digital world.

🎯 Learning Objectives:
- Use technology terminology correctly
- Understand digital communication norms
- Discuss tech trends and implications

📚 Core Exercises:
1. Tech Vocabulary: AI, blockchain, IoT, cybersecurity, cloud computing
2. Digital Communication: Email etiquette, video call protocols, social media norms
3. Trend Discussion: Impact of technology on society, work, relationships
4. Future Predictions: "Virtual reality will likely..." "We might see..."

🗣️ Speaking Challenge:
Lead a 15-minute discussion on "How technology is changing education."
Use technical vocabulary appropriately and discuss implications.

💡 Tech Communication:
Technology language evolves rapidly. Stay current by following tech news and learning new terms as they emerge.

Day 24: Emotional Intelligence - Reading and Responding to Emotions
Develop skills to recognize and respond appropriately to emotional cues in communication.

🎯 Learning Objectives:
- Identify emotional states in speech
- Respond empathetically to others' feelings
- Express your own emotions appropriately

📚 Core Exercises:
1. Emotion Recognition: Voice tone, word choice, speaking patterns
2. Empathetic Responses: "That must have been difficult," "I can understand why you'd feel that way"
3. Emotional Expression: "I'm frustrated because..." "I'm excited about..."
4. Emotional Regulation: Managing your own emotions in communication

🗣️ Speaking Challenge:
Practice responding to different emotional scenarios:
- A colleague expressing frustration
- A friend sharing exciting news
- Someone asking for help with a problem

💡 Emotional Intelligence:
Mirror emotions appropriately. Match someone's energy level - don't be overly cheerful with someone who's upset.

Day 25: Leadership Communication - Inspiring and Motivating Others
Learn the language patterns that effective leaders use to inspire action.

🎯 Learning Objectives:
- Use inclusive language that builds teams
- Communicate vision and goals clearly
- Provide constructive feedback effectively

📚 Core Exercises:
1. Vision Language: "Imagine if we could..." "Our goal is to..." "Together we can..."
2. Team Building: "We" vs. "I" language, shared responsibility
3. Feedback Techniques: SBI model (Situation-Behavior-Impact)
4. Motivation Strategies: Connect tasks to larger purpose

🗣️ Speaking Challenge:
Deliver a 10-minute motivational speech to a team facing challenges.
Include vision, acknowledgment of difficulties, and path forward.

💡 Leadership Language:
Great leaders use "we" when things go well and "I" when things go wrong. This builds trust and team unity.

Day 26: Negotiation Skills - Finding Win-Win Solutions
Master the communication techniques needed for successful negotiations.

🎯 Learning Objectives:
- Separate people from problems
- Focus on interests, not positions
- Generate creative options for mutual gain

📚 Core Exercises:
1. Interest Exploration: "Help me understand what's important to you"
2. Option Generation: "What if we..." "How about..." "Could we consider..."
3. Objective Criteria: "What would be fair?" "How do others handle this?"
4. BATNA Development: Best Alternative to Negotiated Agreement

🗣️ Speaking Challenge:
Negotiate a complex workplace scenario:
- Salary discussion with your manager
- Project deadline with a difficult client
- Resource allocation between departments

💡 Negotiation Wisdom:
Ask open-ended questions to understand the other party's real needs. Often, there are creative solutions that satisfy everyone.

Day 27: Crisis Communication - Managing Difficult Conversations
Learn to communicate effectively during challenging situations.

🎯 Learning Objectives:
- Stay calm under pressure
- Deliver difficult messages with empathy
- Manage stakeholder expectations during crises

📚 Core Exercises:
1. Crisis Language: Clear, factual, empathetic communication
2. Stakeholder Management: Different messages for different audiences
3. Transparency Balance: What to share, what to withhold, when to update
4. Recovery Communication: Rebuilding trust after problems

🗣️ Speaking Challenge:
Handle three crisis scenarios:
- Product recall announcement to customers
- Layoff communication to employees
- Apology for service failure to stakeholders

💡 Crisis Communication:
Be first, be right, be credible. If you can't be right immediately, be first and credible, then update when you have correct information.

Day 28: Innovation Communication - Describing New Ideas
Develop skills to present innovative concepts and gain buy-in for new ideas.

🎯 Learning Objectives:
- Explain novel concepts clearly
- Address resistance to change
- Build excitement for innovation

📚 Core Exercises:
1. Innovation Language: "Revolutionary," "game-changing," "paradigm shift"
2. Change Management: Address fears and resistance proactively
3. Benefit Communication: Features vs. benefits, impact on stakeholders
4. Vision Casting: Paint pictures of the future state

🗣️ Speaking Challenge:
Pitch an innovative solution to a traditional problem:
- Present the current state and problems
- Introduce your innovative solution
- Address potential objections
- Paint a vision of success

💡 Innovation Communication:
Start with the problem, not the solution. People need to feel the pain before they'll embrace change.

Day 29: Advanced Fluency - Thinking in English
Develop the ability to think directly in English without translation.

🎯 Learning Objectives:
- Reduce mental translation time
- Develop English-thinking patterns
- Achieve natural response speed

📚 Core Exercises:
1. Internal Monologue: Think through daily activities in English
2. Dream Journaling: Record dreams in English if they occur in English
3. Speed Responses: Quick answers without thinking time
4. Cultural Thinking: Adopt English-speaking cultural perspectives

🗣️ Speaking Challenge:
Stream-of-consciousness speaking for 10 minutes on rotating topics:
Change topics every 2 minutes without preparation time.

💡 Fluency Secret:
Stop translating in your head. Accept that some ideas can only be expressed in English, and some English concepts don't translate perfectly.

Day 30: Integration and Mastery - Putting It All Together
Combine all skills learned over 30 days into fluent, confident English communication.

🎯 Learning Objectives:
- Integrate all skills seamlessly
- Demonstrate mastery through complex tasks
- Set goals for continued improvement

📚 Core Exercises:
1. Skill Integration: Use pronunciation, grammar, vocabulary, and cultural knowledge together
2. Complex Scenarios: Handle multi-layered communication challenges
3. Self-Assessment: Evaluate progress and identify remaining goals
4. Future Planning: Set specific, measurable language learning objectives

🗣️ Speaking Challenge:
Complete the Ultimate English Challenge:
- 5-minute impromptu presentation on a complex topic
- Handle difficult questions and objections
- Facilitate a group discussion with conflicting viewpoints
- Demonstrate cultural sensitivity and emotional intelligence

💡 Mastery Mindset:
Fluency isn't perfection—it's the ability to communicate effectively despite occasional errors. Focus on impact, not perfection.

🎉 Congratulations! You've completed the 30-Day Advanced English Mastery Journey!

Continue practicing these skills daily. Language learning is a lifelong journey, and you now have the tools for continued growth and improvement.

Remember: Confidence comes from practice, not perfection. Keep speaking, keep learning, and keep growing!`;

      res.setHeader('Content-Type', 'text/plain');
      res.send(advancedLessons);
    } catch (error) {
      console.error('Advanced lessons error:', error);
      res.status(500).json({ error: 'Failed to generate advanced lessons' });
    }
  });

  return httpServer;
}
