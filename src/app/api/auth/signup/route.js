import prisma from '@/lib/db';
import { generateToken, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, company } = body;

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required.' }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, company: company || null },
    });

    const token = generateToken(user);

    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, apiKey: user.apiKey },
    }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    // Return actual error in dev for debugging
    return Response.json({
      error: 'Signup failed.',
      detail: err.message || String(err),
    }, { status: 500 });
  }
}
