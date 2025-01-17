import OpenAI from 'openai';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
console.log('API Key being used:', apiKey); // Temporary debug log

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy these requests through your backend
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendMessage = async (messages: ChatMessage[]): Promise<string> => {
  try {
    console.log('API Key:', process.env.REACT_APP_OPENAI_API_KEY); // For debugging

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Format your responses in markdown when appropriate to make them more readable. Use headings, lists, bold, italic, and code blocks where appropriate."
        },
        ...messages
      ],
      model: "gpt-4o",
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};
