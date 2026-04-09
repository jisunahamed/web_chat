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

  try {
    // 1. Get all agents for this user to count their analytics
    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      select: { id: true }
    });

    const agentIds = agents.map(a => a.id);

    if (agentIds.length === 0) {
      return Response.json({ views: 0, clicks: 0, total: 0 });
    }

    const detailed = searchParams.get('detailed') === 'true';

    // 2. Count by type using simple count queries (TEXT compatibility)
    const [views, clicks] = await Promise.all([
      prisma.analytics.count({ where: { agentId: { in: agentIds }, type: 'view' } }),
      prisma.analytics.count({ where: { agentId: { in: agentIds }, type: 'click' } })
    ]);

    let logs = [];
    if (detailed) {
      logs = await prisma.analytics.findMany({
        where: { agentId: { in: agentIds } },
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { agent: { select: { name: true } } }
      });
    }

    return Response.json({ views, clicks, total: views + clicks, logs });
  } catch (err) {
    console.error('ANALYTICS FETCH ERROR:', err);
    return Response.json({ error: 'Failed to load stats', detail: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { agent_id, type, page_url } = await request.json();

    if (!agent_id || !['view', 'click'].includes(type)) {
      return Response.json({ error: 'Missing agent_id or invalid type.' }, { status: 400, headers: cors });
    }

    // 1. Validate API key (optional but recommended for public tracking)
    // For simplicity, we just check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agent_id },
    });
    if (!agent) {
      return Response.json({ error: 'Agent not found.' }, { status: 404, headers: cors });
    }

    // 2. Log event
    await prisma.analytics.create({
      data: { agentId: agent_id, type, pageUrl: page_url || null },
    });

    return Response.json({ success: true }, { headers: cors });
  } catch (err) {
    return Response.json({ error: 'Tracking failed.', detail: err.message }, { status: 500, headers: cors });
  }
}
