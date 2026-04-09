import prisma from '@/lib/db';
import { getUserByApiKey } from '@/lib/auth';
import { getChatCompletion, resolveBaseUrl } from '@/lib/openai';
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
    const { agent_id, session_id, message, user_info, page_url } = body;

    if (!agent_id || !session_id || !message) {
      return Response.json({ error: 'agent_id, session_id, and message are required.' }, { status: 400, headers: cors });
    }

    // 1. Validate API key & get the agent owner user
    const user = await getUserByApiKey(request);
    if (!user) {
      return Response.json({ error: 'Invalid API key.' }, { status: 401, headers: cors });
    }

    // 2. Get agent with full details
    const agent = await prisma.agent.findFirst({
      where: { id: agent_id, userId: user.id, isActive: true },
    });
    if (!agent) {
      return Response.json({ error: 'Agent not found or inactive.' }, { status: 404, headers: cors });
    }

    // 3. Resolve AI config: Agent Override → User Default → Admin Global Fallback
    // Fetch user's AI config
    const agentOwner = await prisma.user.findUnique({
      where: { id: user.id },
      select: { aiProvider: true, aiApiKey: true, aiBaseUrl: true, aiModel: true },
    });

    // Fetch admin global settings as fallback
    let globalSettings = { ai_model: 'gpt-4o-mini', ai_base_url: null, ai_api_key: null };
    try {
      const settings = await prisma.$queryRaw`SELECT ai_model, ai_base_url, ai_api_key FROM settings WHERE id = 'global' LIMIT 1`;
      if (settings?.[0]) globalSettings = settings[0];
    } catch (e) {
      console.log('Settings lookup failed, using defaults:', e.message);
    }

    // Resolution chain: Agent → User → Admin Global
    const resolvedProvider = agent.agentAiProvider || agentOwner?.aiProvider || 'openai';
    const resolvedApiKey = agent.agentAiApiKey || agentOwner?.aiApiKey || globalSettings.ai_api_key || process.env.OPENAI_API_KEY;
    const resolvedBaseUrl = resolveBaseUrl(
      resolvedProvider,
      agent.agentAiBaseUrl || agentOwner?.aiBaseUrl || globalSettings.ai_base_url
    );
    const resolvedModel = agentOwner?.aiModel || globalSettings.ai_model || 'gpt-4o-mini';

    // 4. Get or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: { agentId_sessionId: { agentId: agent_id, sessionId: session_id } },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { agentId: agent_id, sessionId: session_id, userInfo: user_info || null, isRead: false },
      });
    } else {
      await prisma.conversation.update({ 
        where: { id: conversation.id }, 
        data: { userInfo: user_info || conversation.userInfo, isRead: false } 
      });
    }

    // 5. Fetch history
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: { role: true, content: true },
    });

    // 6. Call AI with resolved config + page URL + languages
    let reply;
    try {
      const fullSystemPrompt = `Agent Name: ${agent.name}\nCompany Name: ${agent.companyName || 'Not specified'}\n\nSystem Instructions:\n${agent.systemPrompt}`;
      reply = await getChatCompletion({
        systemPrompt: fullSystemPrompt,
        model: resolvedModel,
        history,
        userMessage: message,
        tone: agent.tone,
        baseUrl: resolvedBaseUrl,
        apiKey: resolvedApiKey,
        pageUrl: page_url || null,
        languages: agent.languages || [],
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

    // 8. Auto-extract phone/email from user message and save as lead
    const phoneRegex = /(?:\+?880|0)1[3-9]\d{8}/g;
    const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/g;
    const foundPhones = message.match(phoneRegex) || [];
    const foundEmails = message.match(emailRegex) || [];

    if (foundPhones.length > 0 || foundEmails.length > 0) {
      try {
        const leadData = {
          agentId: agent_id,
          sessionId: session_id,
          phone: foundPhones[0] || null,
          email: foundEmails[0] || null,
          name: user_info?.name || null,
          source: 'auto-extracted',
        };

        const existingLead = await prisma.lead.findFirst({
          where: { agentId: agent_id, sessionId: session_id },
        });

        if (existingLead) {
          const updateData = {};
          if (foundPhones[0] && !existingLead.phone) updateData.phone = foundPhones[0];
          if (foundEmails[0] && !existingLead.email) updateData.email = foundEmails[0];
          if (user_info?.name && !existingLead.name) updateData.name = user_info.name;
          if (Object.keys(updateData).length > 0) {
            await prisma.lead.update({ where: { id: existingLead.id }, data: updateData });
          }
        } else {
          await prisma.lead.create({ data: leadData });
        }
      } catch (leadErr) {
        console.error('Auto lead extraction failed:', leadErr.message);
      }
    }

    // 9. Lead collection flag (for widget form)
    const collectUserData = agent.collectLeads && !(user_info?.name && (user_info?.email || user_info?.phone));

    // 10. Webhook
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
