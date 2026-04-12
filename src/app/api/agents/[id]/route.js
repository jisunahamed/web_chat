import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/agents/[id]
export async function GET(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const agent = await prisma.agent.findFirst({
    where: { 
      id: params.id,
      OR: [
        { userId: user.id },
        { shares: { some: { userId: user.id } } }
      ]
    },
    include: { 
      _count: { select: { conversations: true, leads: true, webhookLogs: true } },
      user: { select: { name: true } }
    },
  });

  if (!agent) return Response.json({ error: 'Agent not found.' }, { status: 404 });

  return Response.json({ agent: { ...agent, isShared: agent.userId !== user.id, ownerName: agent.user.name } });
}

// PUT /api/agents/[id]
export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const existing = await prisma.agent.findFirst({
    where: { 
      id: params.id,
      OR: [
        { userId: user.id },
        { shares: { some: { userId: user.id } } }
      ]
    },
  });
  if (!existing) return Response.json({ error: 'Agent not found.' }, { status: 404 });

  const body = await request.json();
  const allowed = [
    'name', 'companyName', 'integrationType', 'systemPrompt', 'websiteUrl', 'tone', 'model',
    'socialLinks', 'collectLeads', 'allowedDomains', 'primaryColor',
    'secondaryColor', 'chatBg', 'popupBg', 'faqs', 'useGradient', 'widgetTheme',
    'welcomeMessage', 'botAvatar', 'isActive', 'languages',
    'agentAiProvider', 'agentAiApiKey', 'agentAiBaseUrl',
  ];

  const data = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const agent = await prisma.agent.update({ where: { id: params.id }, data });

  return Response.json({ agent });
}

// DELETE /api/agents/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const existing = await prisma.agent.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!existing) return Response.json({ error: 'Agent not found or you are not the owner.' }, { status: 404 });

  await prisma.agent.delete({ where: { id: params.id } });

  return Response.json({ message: 'Agent deleted.' });
}
