import prisma from '@/lib/db';
import { getUserByApiKey, getAuthUser, unauthorized } from '@/lib/auth';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agent_id');

  const where = {
    agent: {
      userId: user.id
    }
  };
  if (agentId) where.agentId = agentId;

  const stats = await prisma.analytics.groupBy({
    by: ['type'],
    where,
    _count: true
  });

  const result = {
    views: stats.find(s => s.type === 'view')?._count || 0,
    clicks: stats.find(s => s.type === 'click')?._count || 0,
  };

  return Response.json(result);
}

export async function POST(request) {
  try {
    const { agent_id, type } = await request.json();

    if (!agent_id || !['view', 'click'].includes(type)) {
      return Response.json({ error: 'Missing agent_id or invalid type.' }, { status: 400, headers: cors });
    }

    // 1. Validate API key (optional but recommended for public tracking)
    // For simplicity, we just check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agent_id, isActive: true },
    });
    if (!agent) {
      return Response.json({ error: 'Agent not found.' }, { status: 404, headers: cors });
    }

    // 2. Log event
    await prisma.analytics.create({
      data: { agentId: agent_id, type },
    });

    return Response.json({ success: true }, { headers: cors });
  } catch (err) {
    return Response.json({ error: 'Tracking failed.', detail: err.message }, { status: 500, headers: cors });
  }
}
