import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/settings
export async function GET(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  let settings = await prisma.settings.findUnique({ where: { id: 'global' } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 'global', aiModel: 'openai-gpt-oss-120b' } });
  }

  // Do not expose full API key to frontend for security? Actually since it's the admin, it's fine.
  // Or we just return a masked version if it exists.
  return Response.json({ settings });
}

// PUT /api/admin/settings
export async function PUT(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const body = await request.json();

  const settings = await prisma.settings.upsert({
    where: { id: 'global' },
    update: {
      ...(body.aiModel !== undefined && { aiModel: body.aiModel }),
      ...(body.aiBaseUrl !== undefined && { aiBaseUrl: body.aiBaseUrl }),
      ...(body.aiApiKey !== undefined && { aiApiKey: body.aiApiKey }),
    },
    create: {
      id: 'global',
      aiModel: body.aiModel || 'openai-gpt-oss-120b',
      aiBaseUrl: body.aiBaseUrl || null,
      aiApiKey: body.aiApiKey || null,
    },
  });

  return Response.json({ settings });
}
