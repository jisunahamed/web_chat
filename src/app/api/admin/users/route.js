import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users
export async function GET(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, company: true, role: true, createdAt: true,
      _count: { select: { agents: true } },
    },
  });

  const now = new Date();
  const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ago30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const usersWithStats = await Promise.all(users.map(async (u) => {
    const userAgents = await prisma.agent.findMany({ where: { userId: u.id }, select: { id: true } });
    const agentIds = userAgents.map(a => a.id);

    if (agentIds.length === 0) {
      return { ...u, apiStats: { lifetime: 0, last24h: 0, last7d: 0, last30d: 0 } };
    }

    const lifetime = await prisma.message.count({ where: { conversation: { agentId: { in: agentIds } }, role: 'assistant' }});
    const last24h = await prisma.message.count({ where: { conversation: { agentId: { in: agentIds } }, role: 'assistant', createdAt: { gte: ago24h } }});
    const last7d = await prisma.message.count({ where: { conversation: { agentId: { in: agentIds } }, role: 'assistant', createdAt: { gte: ago7d } }});
    const last30d = await prisma.message.count({ where: { conversation: { agentId: { in: agentIds } }, role: 'assistant', createdAt: { gte: ago30d } }});

    return { ...u, apiStats: { lifetime, last24h, last7d, last30d } };
  }));

  const totalAgents = await prisma.agent.count();
  const totalConversations = await prisma.conversation.count();
  const totalLeads = await prisma.lead.count();

  return Response.json({ users: usersWithStats, stats: { totalUsers: users.length, totalAgents, totalConversations, totalLeads } });
}
