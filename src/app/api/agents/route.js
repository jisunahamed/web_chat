import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/agents
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    // 1. Get agents owned by the user
    const ownedAgents = await prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { select: { conversations: true, leads: true } },
        user: { select: { name: true } }
      },
    });

    // 2. Get agents shared with the user
    const sharedShares = await prisma.agentShare.findMany({
      where: { userId: user.id },
      include: {
        agent: {
          include: {
            _count: { select: { conversations: true, leads: true } },
            user: { select: { name: true } }
          }
        }
      }
    });

    const sharedAgents = sharedShares.map(share => ({
      ...share.agent,
      isShared: true,
      ownerName: share.agent.user.name
    }));

    const allAgents = [
      ...ownedAgents.map(a => ({ ...a, isShared: false })),
      ...sharedAgents
    ];

    return Response.json({ agents: allAgents });
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

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser.isPremium) {
      const agentCount = await prisma.agent.count({ where: { userId: user.id } });
      if (agentCount >= 1) {
        return Response.json({ error: 'Free plan is limited to 1 agent. Please upgrade to create unlimited agents.' }, { status: 403 });
      }
    }

    if (!body.name || !body.companyName || !body.systemPrompt) {
      return Response.json({ error: 'Name, Company Name, and system prompt are required.' }, { status: 400 });
    }

    // Get global model — safe fallback if settings table doesn't exist yet
    let globalModel = 'gpt-4o-mini';
    try {
      const settings = await prisma.$queryRaw`SELECT ai_model FROM settings WHERE id = 'global' LIMIT 1`;
      if (settings?.[0]?.ai_model) globalModel = settings[0].ai_model;
    } catch (e) {
      console.log('Settings table not found, using default model:', e.message);
    }

    // Validate languages (max 2)
    let languages = body.languages || [];
    if (!Array.isArray(languages)) languages = [];
    if (languages.length > 2) languages = languages.slice(0, 2);

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name: body.name,
        companyName: body.companyName,
        integrationType: body.integrationType || 'both',
        systemPrompt: body.systemPrompt,
        websiteUrl: body.websiteUrl || null,
        socialLinks: body.socialLinks || {},
        tone: body.tone || 'friendly',
        model: globalModel,
        collectLeads: Boolean(body.collectLeads),
        primaryColor: body.primaryColor || '#6C5CE7',
        secondaryColor: body.secondaryColor || '#EC4899',
        chatBg: body.chatBg || '#f8fafc',
        popupBg: body.popupBg || '#ffffff',
        faqs: body.faqs || [],
        languages: languages,
        useGradient: Boolean(body.useGradient),
        widgetTheme: body.widgetTheme || 'bubble',
        welcomeMessage: body.welcomeMessage || 'Hi there! How can I help you today?',
        botAvatar: body.botAvatar || null,
        agentAiProvider: body.agentAiProvider || null,
        agentAiApiKey: body.agentAiApiKey || null,
        agentAiBaseUrl: body.agentAiBaseUrl || null,
      },
    });

    return Response.json({ agent }, { status: 201 });
  } catch (err) {
    console.error('Create agent error:', err);
    return Response.json({ error: 'Failed to create agent.', detail: err.message }, { status: 500 });
  }
}
