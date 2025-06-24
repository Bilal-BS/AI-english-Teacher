import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCorrectedConversation(userInput: string, conversationHistory: any[] = []) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
You are an English teacher. 
1. First, correct grammar/spelling.
2. Then reply naturally.

Format:
Corrected: <corrected sentence>
Reply: <your reply>

User: ${userInput}
`;

  // Build messages array with conversation history
  const messages = [
    { role: "system", content: "You're a friendly English tutor who helps with grammar and engages in natural conversation." },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: "user", content: prompt }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    temperature: 0.7, // Higher for more creative & varied responses
    max_tokens: 150,
  });

  return response.choices[0].message.content;
}