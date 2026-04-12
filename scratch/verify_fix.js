const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const agent = await prisma.agent.findFirst();
  if (!agent) {
    console.log('No agents found to test with.');
    return;
  }
  
  console.log('Testing tracking for Agent:', agent.name, '(', agent.id, ')');
  
  const record = await prisma.analytics.create({
    data: {
      agentId: agent.id,
      type: 'view',
      pageUrl: 'https://test-verification.com/automation'
    }
  });
  
  console.log('SUCCESS: Analytics record created with ID:', record.id);
  
  const count = await prisma.analytics.count();
  console.log('Total Analytics Records now:', count);
}

verify().catch(console.error).finally(() => prisma.$disconnect());
