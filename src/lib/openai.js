import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL }),
});

const TONE_MAP = {
  friendly: 'You are friendly, warm, and helpful.',
  sales: 'You are a persuasive and professional sales assistant.',
  support: 'You are a patient and thorough customer support agent.',
};

/**
 * Get a chat completion from OpenAI.
 */
export async function getChatCompletion({ systemPrompt, model, history, userMessage, tone }) {
  const systemContent = [
    systemPrompt,
    TONE_MAP[tone] || TONE_MAP.friendly,
    'Always respond in the same language the user writes in.',
  ].join('\n\n');

  const messages = [
    { role: 'system', content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
