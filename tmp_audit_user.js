
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixAdmin() {
  const email = 'jisunahamed525@gmail.com';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('USER_NOT_FOUND');
      return;
    }
    
    console.log('CURRENT_STATE:', JSON.stringify({ email: user.email, role: user.role }));
    
    if (user.role !== 'admin') {
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
      });
      console.log('ROLE_UPDATED_TO_ADMIN');
    } else {
      console.log('ALREADY_ADMIN');
    }
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixAdmin();
