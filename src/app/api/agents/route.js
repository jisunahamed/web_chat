import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/agents
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { conversations: true, leads: true } } },
    });

    return Response.json({ agents });
  } catch (err) {
    console.error('List agents error:', err);
    return Response.json({ error: 'Failed to fetch agents.', detail: err.message }, { status: 500 });
  }
}

// POST /api/agents
export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const body = await request.json();

    if (!body.name || !body.systemPrompt) {
      return Response.json({ error: 'Name and system prompt are required.' }, { status: 400 });
    }

    // Get global model — safe fallback if settings table doesn't exist yet
    let globalModel = 'gpt-4o-mini';
    try {
      const settings = await prisma.$queryRaw`SELECT ai_model FROM settings WHERE id = 'global' LIMIT 1`;
      if (settings?.[0]?.ai_model) globalModel = settings[0].ai_model;
    } catch (e) {
      console.log('Settings table not found, using default model:', e.message);
    }

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name: body.name,
        systemPrompt: body.systemPrompt,
        websiteUrl: body.websiteUrl || null,
        tone: body.tone || 'friendly',
        model: globalModel,
        webhookUrl: body.webhookUrl || null,
        collectLeads: Boolean(body.collectLeads),
        primaryColor: body.primaryColor || '#6C5CE7',
        welcomeMessage: body.welcomeMessage || 'Hi there! How can I help you today?',
        botAvatar: body.botAvatar || null,
      },
    });

    return Response.json({ agent }, { status: 201 });
  } catch (err) {
    console.error('Create agent error:', err);
    return Response.json({ error: 'Failed to create agent.', detail: err.message }, { status: 500 });
  }
}
