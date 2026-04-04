import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const agent = await prisma.agent.findUnique({
    where: { id: '015b4339-bdb2-45e5-abe7-88a09f0bc91a' }
  });
  console.log(JSON.stringify(agent, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
