import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/core/auth/session';
import { hasPermission, type Permission } from '@/core/auth/permissions';
import type { AuthJWTPayload } from '@/core/auth/auth.types';

/**
 * Guard dùng cho server component (page/layout): thiếu quyền thì điều hướng,
 * khác với guard của server action (ném AppError).
 */
export async function requirePageUser(): Promise<AuthJWTPayload> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requirePagePermission(
  permission: Permission,
  fallbackPath = '/forbidden',
): Promise<AuthJWTPayload> {
  const user = await requirePageUser();
  if (!hasPermission(user, permission)) redirect(fallbackPath);
  return user;
}
