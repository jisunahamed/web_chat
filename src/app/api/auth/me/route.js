import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, email: true, name: true, company: true, role: true, apiKey: true, createdAt: true,
      aiProvider: true, aiApiKey: true, aiBaseUrl: true, aiModel: true,
      _count: { select: { agents: true } },
    },
  });

  // Mask AI API key for security (show only last 4 chars)
  if (fullUser?.aiApiKey) {
    const key = fullUser.aiApiKey;
    fullUser.aiApiKey = key.length > 8 ? '••••••••' + key.slice(-4) : '••••';
    fullUser.hasAiKey = true;
  } else {
    fullUser.hasAiKey = false;
  }

  return Response.json({ user: fullUser });
}
