import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(request) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getAuthUser(request) {
  let decoded = verifyToken(request);
  
  // Fallback to NextAuth Session for Social Logins
  if (!decoded) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      decoded = { email: session.user.email };
    }
  }

  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: decoded.id ? { id: decoded.id } : { email: decoded.email },
    select: { id: true, email: true, name: true, company: true, role: true, apiKey: true, createdAt: true },
  });
  return user;
}

export async function requireAdmin(request) {
  const user = await getAuthUser(request);
  if (!user) return { user: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (user.role !== 'admin') return { user: null, error: Response.json({ error: 'Admin access required' }, { status: 403 }) };
  return { user, error: null };
}

export async function getUserByApiKey(request) {
  const apiKey = request.headers.get('x-api-key') || (request.headers.get('authorization')?.startsWith('Bearer ') ? request.headers.get('authorization').split(' ')[1] : null);
  if (!apiKey) return null;
  return prisma.user.findUnique({ where: { apiKey } });
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function unauthorized(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}
