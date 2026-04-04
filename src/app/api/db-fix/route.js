import prisma from '@/lib/db';

export async function GET() {
  try {
    // 1. Add missing column
    await prisma.$executeRawUnsafe(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_api_key TEXT;`);
    
    // 2. Force reset to defaults so chat works immediately
    await prisma.settings.upsert({
      where: { id: 'global' },
      update: { aiModel: 'gpt-4o-mini', aiBaseUrl: null, aiApiKey: null },
      create: { id: 'global', aiModel: 'gpt-4o-mini', aiBaseUrl: null, aiApiKey: null },
    });

    return Response.json({ success: true, message: 'Database fixed and AI settings reset.' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
