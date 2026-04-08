import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';
import { resolveBaseUrl } from '@/lib/openai';
import OpenAI from 'openai';

// PUT /api/user/ai-config — Update user's AI configuration
export async function PUT(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { aiProvider, aiApiKey, aiBaseUrl, aiModel } = body;

    // Validate provider
    const validProviders = ['openai', 'gemini', 'groq', 'custom'];
    if (aiProvider && !validProviders.includes(aiProvider)) {
      return Response.json({ error: 'Invalid AI provider.' }, { status: 400 });
    }

    const updateData = {};
    if (aiProvider !== undefined) updateData.aiProvider = aiProvider;
    if (aiApiKey !== undefined) updateData.aiApiKey = aiApiKey || null;
    if (aiBaseUrl !== undefined) updateData.aiBaseUrl = aiBaseUrl || null;
    if (aiModel !== undefined) updateData.aiModel = aiModel || null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { aiProvider: true, aiBaseUrl: true, aiModel: true },
    });

    return Response.json({ success: true, config: updated });
  } catch (err) {
    console.error('Update AI config error:', err);
    return Response.json({ error: 'Failed to update AI config.', detail: err.message }, { status: 500 });
  }
}

// POST /api/user/ai-config — Test AI connection & fetch models
export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { aiProvider, aiApiKey, aiBaseUrl } = await request.json();

    // Use provided key or fall back to saved key
    let keyToUse = aiApiKey;
    if (!keyToUse) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { aiApiKey: true } });
      keyToUse = dbUser?.aiApiKey;
    }

    if (!keyToUse) {
      return Response.json({ error: 'API key is required. Please enter your API key first.' }, { status: 400 });
    }

    const baseUrl = resolveBaseUrl(aiProvider || 'openai', aiBaseUrl);

    const client = new OpenAI({
      apiKey: keyToUse,
      baseURL: baseUrl,
    });

    // Fetch model list from provider
    const models = await client.models.list();
    const modelList = [];
    for await (const model of models) {
      modelList.push(model.id);
      if (modelList.length >= 100) break;
    }

    // Sort alphabetically for a clean dropdown
    modelList.sort((a, b) => a.localeCompare(b));

    return Response.json({
      success: true,
      message: `Connected! ${modelList.length} models available.`,
      models: modelList,
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: 'Connection failed: ' + (err.message || 'Unknown error'),
    }, { status: 400 });
  }
}
