import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCorrectedConversation(userInput: string, conversationHistory: any[] = []) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Correct this English sentence and reply like a teacher. Show correction and explain changes.

Format:
Corrected: <corrected sentence>
Corrections:
- "<wrong>" → "<correct>": <explanation>
Reply: <teacher response>

Sentence: ${userInput}`;

  // Build messages array with conversation history
  const messages = [
    { role: "system", content: "You are a helpful English tutor who corrects grammar and explains changes clearly." },
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: "user", content: prompt }
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: messages,
    temperature: 0.6,
    max_tokens: 300,
  });

  return response.choices[0].message.content;
}