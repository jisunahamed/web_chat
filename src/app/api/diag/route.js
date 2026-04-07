import prisma from "@/lib/db";

export async function GET() {
  const diag = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "SET (Check: " + process.env.NEXTAUTH_URL + ")" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID ? "SET" : "MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET ? "SET" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  };

  let dbStatus = "Checking...";
  try {
    await prisma.$connect();
    dbStatus = "Connected Successfully ✅";
  } catch (err) {
    dbStatus = "Connection Failed ❌ (" + err.message + ")";
  }

  return Response.json({
    message: "InmeTech Production Diagnostics",
    env_check: diag,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
}
