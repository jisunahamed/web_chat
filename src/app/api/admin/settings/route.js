import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/settings
export async function GET(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 'global', aiModel: 'openai-gpt-oss-120b' } });
    }
    return Response.json({ settings });
  } catch (err) {
    console.error('Admin settings GET error:', err);
    return Response.json({ error: 'Database error. Did you run the SQL command?', detail: err.message }, { status: 500 });
  }
}

// PUT /api/admin/settings
export async function PUT(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();

    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        ...(body.aiModel !== undefined && { aiModel: body.aiModel }),
        ...(body.aiBaseUrl !== undefined && { aiBaseUrl: body.aiBaseUrl }),
        ...(body.aiApiKey !== undefined && { aiApiKey: body.aiApiKey }),
        ...(body.planFreeTitle !== undefined && { planFreeTitle: body.planFreeTitle }),
        ...(body.planFreePrice !== undefined && { planFreePrice: body.planFreePrice }),
        ...(body.planFreeFeatures !== undefined && { planFreeFeatures: body.planFreeFeatures }),
        ...(body.planProTitle !== undefined && { planProTitle: body.planProTitle }),
        ...(body.planProPrice !== undefined && { planProPrice: body.planProPrice }),
        ...(body.planProFeatures !== undefined && { planProFeatures: body.planProFeatures }),
      },
      create: {
        id: 'global',
        aiModel: body.aiModel || 'openai-gpt-oss-120b',
        aiBaseUrl: body.aiBaseUrl || null,
        aiApiKey: body.aiApiKey || null,
      },
    });

    return Response.json({ settings });
  } catch (err) {
    console.error('Admin settings PUT error:', err);
    return Response.json({ error: 'Database error. Did you run the SQL command?', detail: err.message }, { status: 500 });
  }
}

