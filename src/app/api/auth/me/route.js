import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, email: true, name: true, company: true, apiKey: true, createdAt: true,
      _count: { select: { agents: true } },
    },
  });

  return Response.json({ user: fullUser });
}
