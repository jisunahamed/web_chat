import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check DB status directly for comparison
    const dbUser = session?.user?.email ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { email: true, role: true, isPremium: true }
    }) : null;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        isPresent: !!session,
        user: session?.user || null,
        roleInSession: session?.user?.role || "NOT_FOUND"
      },
      database: {
        userFound: !!dbUser,
        roleInDb: dbUser?.role || "NOT_FOUND",
        isPremium: dbUser?.isPremium || false
      },
      verdict: (session?.user?.role === 'admin' || dbUser?.role === 'admin') 
        ? "You SHOULD have access. If redirecting, the issue is client-side layout." 
        : "You are NOT an admin in either session or database. Re-run setup route."
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
