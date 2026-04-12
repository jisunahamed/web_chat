const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAgent() {
  const agents = await prisma.agent.findMany({
    take: 10,
    include: { user: { select: { email: true, name: true, role: true, isPremium: true } } }
  });
  console.log(JSON.stringify(agents, null, 2));
}

checkAgent().finally(() => prisma.$disconnect());
