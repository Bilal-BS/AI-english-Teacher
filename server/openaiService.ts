import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCorrectedConversation(userInput: string, conversationHistory: any[] = []) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
You are an advanced English grammar expert and tutor.

Your task:
1. Analyze every word in the user's sentence for grammar, spelling, and usage errors
2. Provide detailed corrections with explanations for each error
3. Give a natural conversational reply

Respond in this exact format:
Corrected: <the corrected sentence>
Corrections:
- "<wrong word/phrase>" → "<correct word/phrase>": <detailed explanation>
- "<wrong word/phrase>" → "<correct word/phrase>": <detailed explanation>
Reply: <friendly natural response>

User: ${userInput}
`;

  // Build messages array with conversation history
  const messages = [
    { role: "system", content: "You are an advanced grammar expert and English tutor who provides detailed corrections like Grammarly." },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: "user", content: prompt }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: messages,
    temperature: 0.6, // Balanced for detailed corrections but natural responses
    max_tokens: 300, // More tokens for detailed explanations
  });

  return response.choices[0].message.content;
}