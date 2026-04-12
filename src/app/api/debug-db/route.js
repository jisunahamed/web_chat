import prisma from "@/lib/db";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    
    return Response.json({ 
      success: true, 
      userCount, 
      hasGlobalSettings: !!settings,
      googleClientIdConfigured: !!settings?.googleClientId,
      envGoogleId: !!process.env.GOOGLE_CLIENT_ID
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
