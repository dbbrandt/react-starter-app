import OpenAI from 'openai';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
console.log('API Key being used:', apiKey); // Temporary debug log

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy these requests through your backend
});

export const generateChatResponse = async (message: string): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-4",
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};
