import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Generate JWT token for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT from Authorization header.
 * Returns decoded user or null.
 */
export function verifyToken(request) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(header.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Get authenticated user from JWT.
 * Returns user object or null.
 */
export async function getAuthUser(request) {
  const decoded = verifyToken(request);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, company: true, apiKey: true, createdAt: true },
  });

  return user;
}

/**
 * Get user by API key (from X-Api-Key header or Authorization Bearer).
 */
export async function getUserByApiKey(request) {
  const apiKey =
    request.headers.get('x-api-key') ||
    (request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization').split(' ')[1]
      : null);

  if (!apiKey) return null;

  const user = await prisma.user.findUnique({
    where: { apiKey },
  });

  return user;
}

/**
 * Hash a password.
 */
export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Compare password with hash.
 */
export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Helper: return 401 JSON response.
 */
export function unauthorized(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}
