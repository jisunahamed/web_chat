import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// DELETE /api/leads/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { agent: { select: { userId: true } } },
  });

  if (!lead || lead.agent.userId !== user.id) {
    return Response.json({ error: 'Lead not found.' }, { status: 404 });
  }

  await prisma.lead.delete({ where: { id: params.id } });
  return Response.json({ message: 'Lead deleted.' });
}
