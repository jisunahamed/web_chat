import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const email = 'jisunahamed525@gmail.com';
    
    const user = await prisma.user.update({
      where: { email },
      data: { 
        role: 'admin',
        isPremium: true,
        proStartedAt: new Date(),
        proExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 Year Pro
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} has been promoted to Admin! You can now visit /admin`,
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
