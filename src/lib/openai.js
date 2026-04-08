import OpenAI from 'openai';

const TONE_MAP = {
  friendly: 'You are friendly, warm, and helpful.',
  sales: 'You are a persuasive and professional sales assistant.',
  support: 'You are a patient and thorough customer support agent.',
  professional: 'You are professional, concise, and authoritative.',
};

/**
 * Map provider name to its default base URL
 */
const PROVIDER_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  groq: 'https://api.groq.com/openai/v1',
};

/**
 * Full language name map for system prompt injection
 */
const LANGUAGE_MAP = {
  bn: 'Bangla (বাংলা)',
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  ur: 'Urdu (اردو)',
  ar: 'Arabic (العربية)',
  es: 'Spanish (Español)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  zh: 'Chinese (中文)',
  ja: 'Japanese (日本語)',
  ko: 'Korean (한국어)',
  tr: 'Turkish (Türkçe)',
  id: 'Indonesian',
  th: 'Thai (ไทย)',
  pt: 'Portuguese (Português)',
  ru: 'Russian (Русский)',
  it: 'Italian (Italiano)',
};

/**
 * Resolve the base URL for a given provider
 */
export function resolveBaseUrl(provider, customBaseUrl) {
  if (provider === 'custom' && customBaseUrl) return customBaseUrl;
  return PROVIDER_BASE_URLS[provider] || PROVIDER_BASE_URLS.openai;
}

/**
 * Get a chat completion.
 * Supports multiple AI providers, page URL context, and language enforcement.
 */
export async function getChatCompletion({ systemPrompt, model, history, userMessage, tone, baseUrl, apiKey, pageUrl, languages }) {
  const client = new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
    baseURL: baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });

  // Build system content with context
  const parts = [systemPrompt];
  
  // Tone
  parts.push(TONE_MAP[tone] || TONE_MAP.friendly);

  // Language enforcement
  if (languages && Array.isArray(languages) && languages.length > 0) {
    const langNames = languages.map(code => LANGUAGE_MAP[code] || code).join(', ');
    parts.push(`You MUST respond ONLY in the following language(s): ${langNames}. Do not switch to any other language.`);
  } else {
    parts.push('Always respond in the same language the user writes in.');
  }

  // Page URL context
  if (pageUrl) {
    parts.push(`The user is currently browsing this page: ${pageUrl}`);
  }

  const systemContent = parts.join('\n');

  let unifiedPrompt = `System: ${systemContent}\n\n`;

  for (const m of history) {
    if (m.role === 'user') {
      unifiedPrompt += `Human: ${m.content}\n`;
    } else if (m.role === 'assistant') {
      unifiedPrompt += `AI: ${m.content}\n`;
    }
  }

  unifiedPrompt += `Human: ${userMessage}\nAI:`;

  const messages = [
    { role: 'user', content: unifiedPrompt.trim() }
  ];

  const completion = await client.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
