import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { getCorrectedConversation } from './openaiService';

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI conversation route
  app.post('/api/conversation', async (req, res) => {
    try {
      const { userInput, conversationHistory } = req.body;
      
      if (!userInput || typeof userInput !== 'string') {
        return res.status(400).json({ error: 'User input is required' });
      }

      const result = await getCorrectedConversation(userInput, conversationHistory || []);
      
      // Enhanced parsing with better regex
      const corrected = result?.match(/Corrected:\s*(.+)/i)?.[1]?.trim() || "";
      const reply = result?.match(/Reply:\s*(.+)/i)?.[1]?.trim() || "";
      
      // Use corrected text if found, otherwise original
      const finalCorrected = corrected || userInput;
      const finalReply = reply || "That's interesting! Tell me more.";
      
      res.json({
        corrected: finalCorrected,
        reply: finalReply,
        hasCorrections: finalCorrected !== userInput
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Enhanced fallback correction for common grammar errors
      const input = req.body.userInput || '';
      let fallbackCorrected = input;
      
      // Enhanced grammar patterns with past tense fixes
      const corrections = [
        // Present tense third person fixes
        { find: /\bhe go\b/gi, replace: 'he goes' },
        { find: /\bshe go\b/gi, replace: 'she goes' },
        { find: /\bit go\b/gi, replace: 'it goes' },
        
        // Past tense fixes for "go" with "yesterday"
        { find: /\bi go (.+) yesterday\b/gi, replace: 'I went $1 yesterday' },
        { find: /\bhe go (.+) yesterday\b/gi, replace: 'he went $1 yesterday' },
        { find: /\bshe go (.+) yesterday\b/gi, replace: 'she went $1 yesterday' },
        { find: /\bwe go (.+) yesterday\b/gi, replace: 'we went $1 yesterday' },
        { find: /\bthey go (.+) yesterday\b/gi, replace: 'they went $1 yesterday' },
        
        // General past tense fixes
        { find: /\bgo (.+) yesterday\b/gi, replace: 'went $1 yesterday' },
        { find: /\bi go to\b/gi, replace: 'I went to' },
        
        // Negative contractions
        { find: /\bhe don't\b/gi, replace: 'he doesn\'t' },
        { find: /\bshe don't\b/gi, replace: 'she doesn\'t' },
        { find: /\bit don't\b/gi, replace: 'it doesn\'t' },
        
        // To be verb fixes
        { find: /\bi are\b/gi, replace: 'I am' },
        { find: /\byou is\b/gi, replace: 'you are' },
        
        // Other common errors
        { find: /\bwas went\b/gi, replace: 'went' },
        { find: /\bhave went\b/gi, replace: 'have gone' },
        { find: /\byestarday\b/gi, replace: 'yesterday' },
        { find: /\btommorow\b/gi, replace: 'tomorrow' },
        { find: /\brecieve\b/gi, replace: 'receive' },
        { find: /\bseperate\b/gi, replace: 'separate' },
        { find: /\bmuch people\b/gi, replace: 'many people' },
        { find: /\bmore better\b/gi, replace: 'better' },
        { find: /\bdon't have no\b/gi, replace: 'don\'t have any' },
        
        // Article fixes
        { find: /\bgo to park\b/gi, replace: 'go to the park' },
        { find: /\bwent to park\b/gi, replace: 'went to the park' },
        { find: /\bgo to school\b/gi, replace: 'go to school' },
        { find: /\bwent to school\b/gi, replace: 'went to school' }
      ];
      
      corrections.forEach(correction => {
        fallbackCorrected = fallbackCorrected.replace(correction.find, correction.replace);
      });
      
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
        hasCorrections: fallbackCorrected !== input
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
