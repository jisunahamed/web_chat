import OpenAI from 'openai';

const TONE_MAP = {
  friendly: 'You are friendly, warm, and helpful.',
  sales: 'You are a persuasive and professional sales assistant.',
  support: 'You are a patient and thorough customer support agent.',
};

/**
 * Get a chat completion.
 * Accepts optional baseUrl and apiKey to override env defaults.
 */
export async function getChatCompletion({ systemPrompt, model, history, userMessage, tone, baseUrl, apiKey }) {
  const client = new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
    baseURL: baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });

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

  const completion = await client.chat.completions.create({
    model: model || 'openai-gpt-oss-120b',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
