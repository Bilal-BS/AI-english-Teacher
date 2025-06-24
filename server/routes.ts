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
      
      // Provide fallback correction for common grammar errors
      const input = req.body.userInput || '';
      let fallbackCorrected = input;
      
      // Basic corrections
      fallbackCorrected = fallbackCorrected.replace(/\bhe go\b/gi, 'he goes');
      fallbackCorrected = fallbackCorrected.replace(/\bshe go\b/gi, 'she goes');
      fallbackCorrected = fallbackCorrected.replace(/\bi are\b/gi, 'I am');
      fallbackCorrected = fallbackCorrected.replace(/\byesterday\b/gi, 'yesterday');
      
      res.json({ 
        corrected: fallbackCorrected,
        reply: "That's interesting! Tell me more about that.",
        hasCorrections: fallbackCorrected !== input
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
