import prisma from '@/lib/db';
import { generateToken, comparePassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = generateToken(user);

    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, apiKey: user.apiKey },
    });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
