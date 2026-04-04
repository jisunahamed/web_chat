import prisma from '@/lib/db';
import { getUserByApiKey } from '@/lib/auth';
import { getChatCompletion } from '@/lib/openai';
import { dispatchWebhook } from '@/lib/webhook';

// CORS headers
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

// POST /api/chat
export async function POST(request) {
  try {
    const body = await request.json();
    const { agent_id, session_id, message, user_info } = body;

    if (!agent_id || !session_id || !message) {
      return Response.json({ error: 'agent_id, session_id, and message are required.' }, { status: 400, headers: cors });
    }

    // 1. Validate API key
    const user = await getUserByApiKey(request);
    if (!user) {
      return Response.json({ error: 'Invalid API key.' }, { status: 401, headers: cors });
    }

    // 2. Get agent
    const agent = await prisma.agent.findFirst({
      where: { id: agent_id, userId: user.id, isActive: true },
    });
    if (!agent) {
      return Response.json({ error: 'Agent not found or inactive.' }, { status: 404, headers: cors });
    }

    // 3. Get global AI settings (base URL, API key, and model from admin panel)
    let aiBaseUrl = null;
    let aiModel = agent.model; // fallback to agent's creation model
    let aiApiKey = null;
    
    try {
      const settings = await prisma.$queryRaw`SELECT ai_model, ai_base_url, ai_api_key FROM settings WHERE id = 'global' LIMIT 1`;
      if (settings?.[0]) {
        if (settings[0].ai_base_url) aiBaseUrl = settings[0].ai_base_url;
        if (settings[0].ai_model) aiModel = settings[0].ai_model;
        if (settings[0].ai_api_key) aiApiKey = settings[0].ai_api_key;
      }
    } catch (e) {
      console.log('Settings lookup failed:', e.message);
    }

    // 4. Get or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: { agentId_sessionId: { agentId: agent_id, sessionId: session_id } },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { agentId: agent_id, sessionId: session_id, userInfo: user_info || null },
      });
    } else if (user_info) {
      await prisma.conversation.update({ where: { id: conversation.id }, data: { userInfo: user_info } });
    }

    // 5. Fetch history
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: { role: true, content: true },
    });

    // 6. Call AI with settings from Admin panel
    let reply;
    try {
      reply = await getChatCompletion({
        systemPrompt: agent.systemPrompt,
        model: aiModel,
        history,
        userMessage: message,
        tone: agent.tone,
        baseUrl: aiBaseUrl,
        apiKey: aiApiKey,
      });
    } catch (aiErr) {
      console.error('AI call failed:', aiErr.message);
      return Response.json({
        error: 'AI service error.',
        detail: aiErr.message,
      }, { status: 502, headers: cors });
    }

    // 7. Store messages
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: 'user', content: message },
        { conversationId: conversation.id, role: 'assistant', content: reply },
      ],
    });

    // 8. Lead collection
    const collectUserData = agent.collectLeads && !(user_info?.name && (user_info?.email || user_info?.phone));

    // 9. Webhook
    const intentKeywords = ['support', 'help', 'buy', 'purchase', 'order', 'pricing', 'demo'];
    const hasIntent = intentKeywords.some((kw) => message.toLowerCase().includes(kw));
    if (hasIntent && agent.webhookUrl) {
      dispatchWebhook({
        agentId: agent.id, webhookUrl: agent.webhookUrl, sessionId: session_id,
        payload: { message, session_id, user_info, reply, intent: true },
      }).catch(() => {});
    }

    return Response.json({ reply, collect_user_data: collectUserData }, { headers: cors });
  } catch (err) {
    console.error('Chat error:', err);
    return Response.json({ error: 'Failed to process chat.', detail: err.message }, { status: 500, headers: cors });
  }
}
