import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/conversations
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

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        agent: { select: { name: true } },
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return Response.json({ conversations, total, page, limit });
}
