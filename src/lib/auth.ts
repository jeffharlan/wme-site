import { hashSync, compareSync } from 'bcryptjs';
import { db } from './db';
import { adminUsers, sessions } from './schema';
import { eq, and, gt } from 'drizzle-orm';

const BCRYPT_ROUNDS = 12;
const SESSION_DURATION_DAYS = 7;

export function hashPassword(password: string): string {
  return hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  });

  return token;
}

export async function getSession(token: string) {
  const now = new Date().toISOString();
  const result = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      username: adminUsers.username,
      totpEnabled: adminUsers.totpEnabled,
    })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);

  return result[0] || null;
}

export async function destroySession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}

export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  return result[0] || null;
}

export async function getUserCount(): Promise<number> {
  const result = await db.select().from(adminUsers);
  return result.length;
}

// Rate limiting (in-memory, resets on deploy)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}
