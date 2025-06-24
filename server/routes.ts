import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { getCorrectedConversation } from './openaiService';

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI conversation route
  app.post('/api/conversation', async (req, res) => {
    try {
      const { userInput } = req.body;
      
      if (!userInput || typeof userInput !== 'string') {
        return res.status(400).json({ error: 'User input is required' });
      }

      const result = await getCorrectedConversation(userInput);
      
      // Parse the response
      const correctedMatch = result?.match(/Corrected:\s*(.+)/i);
      const replyMatch = result?.match(/Reply:\s*(.+)/i);
      
      const corrected = correctedMatch ? correctedMatch[1].trim() : userInput;
      const reply = replyMatch ? replyMatch[1].trim() : "That's interesting! Tell me more.";
      
      res.json({
        corrected,
        reply,
        hasCorrections: corrected !== userInput
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Enhanced fallback correction for common grammar errors
      const input = req.body.userInput || '';
      let fallbackCorrected = input;
      
      // Common grammar patterns
      const corrections = [
        { find: /\bhe go\b/gi, replace: 'he goes' },
        { find: /\bshe go\b/gi, replace: 'she goes' },
        { find: /\bit go\b/gi, replace: 'it goes' },
        { find: /\bhe don't\b/gi, replace: 'he doesn\'t' },
        { find: /\bshe don't\b/gi, replace: 'she doesn\'t' },
        { find: /\bit don't\b/gi, replace: 'it doesn\'t' },
        { find: /\bi are\b/gi, replace: 'I am' },
        { find: /\byou is\b/gi, replace: 'you are' },
        { find: /\bwas went\b/gi, replace: 'went' },
        { find: /\bhave went\b/gi, replace: 'have gone' },
        { find: /\byestarday\b/gi, replace: 'yesterday' },
        { find: /\btommorow\b/gi, replace: 'tomorrow' },
        { find: /\brecieve\b/gi, replace: 'receive' },
        { find: /\bseperate\b/gi, replace: 'separate' },
        { find: /\bmuch people\b/gi, replace: 'many people' },
        { find: /\bmore better\b/gi, replace: 'better' },
        { find: /\bdon't have no\b/gi, replace: 'don\'t have any' }
      ];
      
      corrections.forEach(correction => {
        fallbackCorrected = fallbackCorrected.replace(correction.find, correction.replace);
      });
      
      // Generate conversational responses
      const responses = [
        "That sounds interesting! Can you tell me more?",
        "Great! What happened next?",
        "That's nice! How did you feel about it?",
        "Interesting! What do you think about that?",
        "That's cool! Do you do that often?",
        "Sounds good! What was your favorite part?",
        "That's wonderful! Would you recommend it to others?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
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
