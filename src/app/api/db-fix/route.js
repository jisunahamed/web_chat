import prisma from '@/lib/db';

export async function GET() {
  try {
    const queries = [
      // 1. Clean up old analytics table if it exists (force drop)
      `DROP TABLE IF EXISTS analytics CASCADE`,
      
      // 2. Clear out existing agent columns to avoid conflicts
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS secondary_color TEXT`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS use_gradient BOOLEAN DEFAULT false`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS widget_theme TEXT DEFAULT 'bubble'`,
      
      // 3. Create analytics table with EXPLICIT TEXT ID for foreign key compatibility
      `CREATE TABLE analytics (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    console.log('Starting DB migration steps...');
    for (const q of queries) {
      console.log(`Executing query: ${q.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(q);
    }

    return Response.json({ 
      success: true, 
      message: 'Database schema synchronized successfully. Total View/Click tracking is active.' 
    });
  } catch (err) {
    console.error('SERVER DB FIX ERROR:', err);
    return Response.json({ 
      error: 'Migration failed. Please check server logs.',
      detail: err.message 
    }, { status: 500 });
  }
}
