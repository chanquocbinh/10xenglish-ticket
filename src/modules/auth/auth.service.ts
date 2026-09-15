import bcrypt from 'bcryptjs';
import { signJWT } from '@/core/auth/jwt';
import { clearAuthCookie, setAuthCookie } from '@/core/auth/session';
import { PERMISSION_CLAIM_VERSION, type AuthJWTPayload } from '@/core/auth/auth.types';
import { PASSWORD_SALT_ROUNDS } from '@/core/config/env';
import { AppError, NotFoundError } from '@/core/errors';
import {
  findUserById,
  findUserByUsernameOrEmail,
  updatePassword,
} from './auth.repository';
import type { ChangePasswordInput, LoginInput } from './auth.schema';
import type { LoginResult } from './auth.types';

export async function login({ usernameOrEmail, password }: LoginInput): Promise<LoginResult> {
  const user = await findUserByUsernameOrEmail(usernameOrEmail);
  const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !isMatch) {
    throw new AppError('Tên đăng nhập hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
  }

  const token = await signJWT({
    sub: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions: user.role.permissions,
    pv: PERMISSION_CLAIM_VERSION,
    departmentName: user.department?.name,
    isPasswordChanged: user.isPasswordChanged,
  });

  await setAuthCookie(token);

  return { isPasswordChanged: user.isPasswordChanged };
}

export async function logout(): Promise<void> {
  await clearAuthCookie();
}

export async function changePassword(
  actor: AuthJWTPayload,
  { currentPassword, newPassword }: ChangePasswordInput,
): Promise<void> {
  const user = await findUserById(actor.sub);
  if (!user) throw new NotFoundError('Không tìm thấy tài khoản');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Mật khẩu hiện tại không đúng', 400, 'INVALID_PASSWORD');
  }

  const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  await updatePassword(user.id, passwordHash);

  // Cấp lại token mới với cờ isPasswordChanged = true (chỉ giữ các claim nghiệp vụ).
  const token = await signJWT({
    sub: actor.sub,
    username: actor.username,
    email: actor.email,
    fullName: actor.fullName,
    roleId: actor.roleId,
    roleName: actor.roleName,
    permissions: actor.permissions,
    pv: PERMISSION_CLAIM_VERSION,
    departmentName: actor.departmentName,
    isPasswordChanged: true,
  });
  await setAuthCookie(token);
}
