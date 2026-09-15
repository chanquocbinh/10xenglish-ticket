import { z } from 'zod';
import { ZodError } from 'zod';
import { getCurrentUser } from '@/core/auth/session';
import { hasPermission, type Permission } from '@/core/auth/permissions';
import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { AppError, ForbiddenError, UnauthorizedError } from '@/core/errors';
import { fail, ok, type ActionResult } from '@/core/result';

/**
 * Bối cảnh thực thi được truyền vào mọi service call:
 * ai đang hành động (dùng cho phân quyền + ghi audit log).
 */
export interface ActionContext {
  actor: AuthJWTPayload;
}

export async function requireUser(): Promise<AuthJWTPayload> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requirePermission(permission: Permission): Promise<AuthJWTPayload> {
  const user = await requireUser();
  if (!hasPermission(user, permission)) throw new ForbiddenError();
  return user;
}

function toFailure(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return fail(error.issues[0]?.message || 'Dữ liệu không hợp lệ', 'VALIDATION_ERROR');
  }
  if (error instanceof AppError) {
    return fail(error.message, error.code);
  }
  console.error('[action] unexpected error', error);
  return fail('Lỗi hệ thống, vui lòng thử lại sau', 'INTERNAL_ERROR');
}

/**
 * Bọc phần thân của một server action: validate bằng zod, gọi service,
 * và chuẩn hoá lỗi nghiệp vụ thành ActionResult thay vì ném ra client.
 */
export async function runAction<T>(handler: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await handler());
  } catch (error) {
    return toFailure(error);
  }
}

export function parseInput<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  return schema.parse(input);
}
