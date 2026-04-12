const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const s = await prisma.settings.findUnique({ where: { id: 'global' } });
  console.log(JSON.stringify(s, null, 2));
}

check().finally(() => prisma.$disconnect());
