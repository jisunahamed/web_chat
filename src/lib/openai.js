import OpenAI from 'openai';

const TONE_MAP = {
  friendly: 'TONE: Friendly & Warm. You are approachable, use helpful language, and aim to build a positive relationship with the user. Use occasional emojis where appropriate.',
  sales: 'TONE: Persuasive & Sales-Oriented. You are a high-performing sales closer. Focus on benefits, create subtle urgency, and steer the conversation towards conversion or lead capture.',
  support: 'TONE: Patient & Supportive. You are a dedicated support specialist. Be thorough, empathetic, and solve problems step-by-step with maximum patience.',
  professional: 'TONE: Professional & Expert. Use formal, concise, and authoritative language. Be direct, skip all fluff, and provide accurate, high-quality information.',
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
  hi: 'Hindi (হিन्दी)',
  ur: 'Urdu (اردো)',
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

  // 1. Build Comprehensive System Content
  const systemParts = [systemPrompt];
  
  // High-priority Tone instruction
  systemParts.push(TONE_MAP[tone] || TONE_MAP.friendly);

  // Language enforcement
  if (languages && Array.isArray(languages) && languages.length > 0) {
    const langNames = languages.map(code => LANGUAGE_MAP[code] || code).join(', ');
    systemParts.push(`MANDATORY LANGUAGE: Respond ONLY in ${langNames}. Failure to do so violates protocol.`);
  } else {
    systemParts.push('LANGUAGE POLICY: Always respond in the exact same language the human user uses.');
  }

  // Page URL context
  if (pageUrl) {
    systemParts.push(`CONTEXT: The user is currently viewing this webpage: ${pageUrl}`);
  }

  const systemMessage = {
    role: 'system',
    content: systemParts.join('\n\n')
  };

  // 2. Build Message History
  const messages = [systemMessage];
  
  for (const m of history) {
    messages.push({
      role: m.role || 'user',
      content: m.content
    });
  }

  // 3. Add Current Message
  messages.push({
    role: 'user',
    content: userMessage
  });

  // 4. Execute AI Call
  const completion = await client.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
