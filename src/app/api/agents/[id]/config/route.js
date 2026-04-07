import prisma from '@/lib/db';
import { getUserByApiKey } from '@/lib/auth';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

// GET /api/agents/[id]/config — public endpoint for widget to fetch agent appearance settings
export async function GET(request, { params }) {
  const user = await getUserByApiKey(request);
  if (!user) {
    return Response.json({ error: 'Invalid API key.' }, { status: 401, headers: cors });
  }

  try {
    const agent = await prisma.agent.findFirst({
      where: { id: params.id, userId: user.id, isActive: true },
      select: {
        name: true,
        primaryColor: true,
        secondaryColor: true,
        chatBg: true,
        useGradient: true,
        widgetTheme: true,
        welcomeMessage: true,
        botAvatar: true,
        collectLeads: true,
        socialLinks: true,
      },
    });

    if (!agent) {
      return Response.json({ error: 'Agent not found.' }, { status: 404, headers: cors });
    }

    return Response.json({ config: agent }, { headers: cors });
  } catch (err) {
    return Response.json({ error: 'Failed to load config.', detail: err.message }, { status: 500, headers: cors });
  }
}
