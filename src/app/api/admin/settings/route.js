import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/settings
export async function GET(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  let settings = await prisma.settings.findUnique({ where: { id: 'global' } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 'global', aiModel: 'gpt-4o-mini' } });
  }

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
    },
    create: {
      id: 'global',
      aiModel: body.aiModel || 'gpt-4o-mini',
      aiBaseUrl: body.aiBaseUrl || null,
    },
  });

  return Response.json({ settings });
}
