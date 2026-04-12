const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const total = await prisma.analytics.count();
  const sample = await prisma.analytics.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  const byType = await prisma.analytics.groupBy({
    by: ['type'],
    _count: true
  });
  
  console.log('--- ANALYTICS REPORT ---');
  console.log('Total Records:', total);
  console.log('Types:', JSON.stringify(byType, null, 2));
  console.log('Recent Samples:', JSON.stringify(sample, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
