import prisma from '@/lib/db';

export async function GET() {
  try {
    // Add new widget columns to agents table
    const queries = [
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS secondary_color TEXT`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS use_gradient BOOLEAN DEFAULT false`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS widget_theme TEXT DEFAULT 'bubble'`,
    ];

    for (const q of queries) {
      await prisma.$executeRawUnsafe(q);
    }

    return Response.json({ 
      success: true, 
      message: 'Widget columns added: secondary_color, use_gradient, widget_theme' 
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
