import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { email: true, role: true, name: true }
    });

    return NextResponse.json({ 
      success: true, 
      total_users: users.length,
      users: users.map(u => ({ email: u.email, role: u.role, name: u.name }))
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
