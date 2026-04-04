import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/conversations/[id]
export async function GET(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      agent: { select: { name: true, userId: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation || conversation.agent.userId !== user.id) {
    return Response.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  return Response.json({ conversation });
}

// DELETE /api/conversations/[id]
export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { agent: { select: { userId: true } } },
  });

  if (!conversation || conversation.agent.userId !== user.id) {
    return Response.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  await prisma.conversation.delete({ where: { id: params.id } });
  return Response.json({ message: 'Conversation deleted.' });
}
