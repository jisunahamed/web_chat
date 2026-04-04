import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/leads — List leads (dashboard)
export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agent_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const agentIds = await prisma.agent.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const ids = agentIds.map((a) => a.id);

  const where = { agentId: { in: ids } };
  if (agentId) where.agentId = agentId;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { agent: { select: { name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return Response.json({ leads, total, page, limit });
}
