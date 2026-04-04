import prisma from '@/lib/db';
import { getUserByApiKey } from '@/lib/auth';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Authorization',
    },
  });
}

// POST /api/lead — Submit lead (public, API key auth)
export async function POST(request) {
  try {
    const user = await getUserByApiKey(request);
    if (!user) {
      return Response.json({ error: 'Invalid API key.' }, { status: 401 });
    }

    const { agent_id, session_id, user_info } = await request.json();

    if (agent_id) {
      const agent = await prisma.agent.findFirst({
        where: { id: agent_id, userId: user.id },
      });
      if (!agent) {
        return Response.json({ error: 'Agent not found.' }, { status: 404 });
      }
    }

    const lead = await prisma.lead.create({
      data: {
        agentId: agent_id,
        sessionId: session_id || null,
        name: user_info?.name || null,
        email: user_info?.email || null,
        phone: user_info?.phone || null,
        source: request.headers.get('referer') || null,
      },
    });

    return Response.json({ message: 'Lead submitted.', lead }, { status: 201 });
  } catch (err) {
    console.error('Submit lead error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
