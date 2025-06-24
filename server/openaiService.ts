import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCorrectedConversation(userInput: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
You are a friendly English teacher. Do two things:
1. Correct the user's grammar/spelling.
2. Reply like in a natural English conversation.
Always use this format:

Corrected: <corrected sentence>
Reply: <conversation reply>

User: ${userInput}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful English tutor." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}