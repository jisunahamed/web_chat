import prisma from '@/lib/db';
import { getUserByApiKey } from '@/lib/auth';
import { getChatCompletion } from '@/lib/openai';
import { dispatchWebhook } from '@/lib/webhook';

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

// POST /api/chat — Core chat endpoint
export async function POST(request) {
  try {
    const { agent_id, session_id, message, user_info } = await request.json();

    if (!agent_id || !session_id || !message) {
      return Response.json({ error: 'agent_id, session_id, and message are required.' }, { status: 400 });
    }

    // 1. Validate API key → User → Agent
    const user = await getUserByApiKey(request);
    if (!user) {
      return Response.json({ error: 'Invalid API key.' }, { status: 401 });
    }

    const agent = await prisma.agent.findFirst({
      where: { id: agent_id, userId: user.id, isActive: true },
    });

    if (!agent) {
      return Response.json({ error: 'Agent not found or inactive.' }, { status: 404 });
    }

    // 2. Get or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: { agentId_sessionId: { agentId: agent_id, sessionId: session_id } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { agentId: agent_id, sessionId: session_id, userInfo: user_info || null },
      });
    } else if (user_info) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { userInfo: user_info },
      });
    }

    // 3. Fetch conversation history
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: { role: true, content: true },
    });

    // 4. Call OpenAI
    const reply = await getChatCompletion({
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      history,
      userMessage: message,
      tone: agent.tone,
    });

    // 5. Store messages
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: 'user', content: message },
        { conversationId: conversation.id, role: 'assistant', content: reply },
      ],
    });

    // 6. Collect user data?
    const collectUserData = agent.collectLeads && !(user_info?.name && (user_info?.email || user_info?.phone));

    // 7. Webhook on intent
    const intentKeywords = ['support', 'help', 'buy', 'purchase', 'order', 'pricing', 'demo'];
    const hasIntent = intentKeywords.some((kw) => message.toLowerCase().includes(kw));

    if (hasIntent && agent.webhookUrl) {
      dispatchWebhook({
        agentId: agent.id,
        webhookUrl: agent.webhookUrl,
        sessionId: session_id,
        payload: { message, session_id, user_info, reply, intent: true },
      }).catch(() => {});
    }

    // 8. Respond
    return Response.json({ reply, collect_user_data: collectUserData });
  } catch (err) {
    console.error('Chat error:', err);
    return Response.json({ error: 'Failed to process chat message.' }, { status: 500 });
  }
}
