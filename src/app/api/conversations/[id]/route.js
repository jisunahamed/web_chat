import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/conversations/[id]
export async function GET(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      agent: { 
        select: { 
          name: true, 
          userId: true,
          shares: { where: { userId: user.id } }
        } 
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    return Response.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  const isOwner = conversation.agent.userId === user.id;
  const isCollaborator = conversation.agent.shares.length > 0;

  if (!isOwner && !isCollaborator) {
    return Response.json({ error: 'Access denied.' }, { status: 403 });
  }

  if (!conversation.isRead) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { isRead: true },
    });
    conversation.isRead = true;
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
