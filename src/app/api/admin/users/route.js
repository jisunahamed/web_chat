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

  const totalAgents = await prisma.agent.count();
  const totalConversations = await prisma.conversation.count();
  const totalLeads = await prisma.lead.count();

  return Response.json({ users, stats: { totalUsers: users.length, totalAgents, totalConversations, totalLeads } });
}
