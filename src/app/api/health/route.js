import prisma from '@/lib/db';

export async function GET() {
  try {
    // Test basic DB connection
    const userCount = await prisma.user.count();
    
    // Test if agents table works
    const agentCount = await prisma.agent.count();

    // Test settings table
    let settingsOk = false;
    try {
      const result = await prisma.$queryRaw`SELECT COUNT(*) as c FROM settings`;
      settingsOk = true;
    } catch { }

    return Response.json({
      status: 'ok',
      database: 'connected',
      tables: {
        users: userCount,
        agents: agentCount,
        settings: settingsOk ? 'exists' : 'missing — run schema-v2.sql',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json({
      status: 'error',
      database: 'failed',
      detail: err.message,
    }, { status: 500 });
  }
}
