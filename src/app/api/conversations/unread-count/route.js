import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  try {
    // Count conversations where isRead is false for agents owned by or shared with current user
    const unreadCount = await prisma.conversation.count({
      where: {
        isRead: false,
        agent: {
          OR: [
            { userId: user.id },
            { shares: { some: { userId: user.id } } }
          ]
        }
      }
    });

    return Response.json({ count: unreadCount });
  } catch (err) {
    console.error('UNREAD COUNT ERROR:', err);
    return Response.json({ count: 0 });
  }
}
