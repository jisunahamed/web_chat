import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const email = 'jisunahamed525@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, role: true, isPremium: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found in database' });
    }

    return NextResponse.json({ 
      success: true, 
      database_status: user,
      message: user.role === 'admin' ? "Role is ADMIN in database. If it's still not working, try logging out and in once more or wait for Vercel build to finish." : "Role is NOT admin in database. Run /api/admin/setup again."
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
