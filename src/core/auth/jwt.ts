import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/core/config/env';
import { PERMISSION_CLAIM_VERSION, type AuthJWTPayload } from './auth.types';

/**
 * Tầng JWT thuần: không phụ thuộc next/headers nên dùng được cả ở
 * middleware (edge runtime) và server actions (node runtime).
 */
const secret = new TextEncoder().encode(env.jwtSecret);

export async function signJWT(payload: Omit<AuthJWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const candidate = payload as unknown as AuthJWTPayload;
    if (!Array.isArray(candidate.permissions) || typeof candidate.roleId !== 'string') {
      return null;
    }
    if (candidate.pv !== PERMISSION_CLAIM_VERSION) return null;
    return candidate;
  } catch {
    return null;
  }
}
