import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/agents — List agents
export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { conversations: true, leads: true } } },
  });

  return Response.json({ agents });
}

// POST /api/agents — Create agent
export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const { name, systemPrompt } = body;

  if (!name || !systemPrompt) {
    return Response.json({ error: 'Name and system prompt are required.' }, { status: 400 });
  }

  const agent = await prisma.agent.create({
    data: {
      userId: user.id,
      name,
      systemPrompt,
      websiteUrl: body.websiteUrl || null,
      tone: body.tone || 'friendly',
      model: body.model || 'gpt-4o-mini',
      webhookUrl: body.webhookUrl || null,
      collectLeads: body.collectLeads || false,
      allowedDomains: body.allowedDomains || null,
      primaryColor: body.primaryColor || '#6C5CE7',
      welcomeMessage: body.welcomeMessage || 'Hi there! 👋 How can I help you today?',
      botAvatar: body.botAvatar || null,
    },
  });

  return Response.json({ agent }, { status: 201 });
}
