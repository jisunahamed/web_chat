import prisma from '@/lib/db';
import { generateToken, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name, company } = await request.json();

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, password, and name are required.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, company },
    });

    const token = generateToken(user);

    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, apiKey: user.apiKey },
    }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
