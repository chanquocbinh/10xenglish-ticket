import bcrypt from 'bcryptjs';
import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { DEFAULT_USER_PASSWORD, PASSWORD_SALT_ROUNDS } from '@/core/config/env';
import { ConflictError, NotFoundError } from '@/core/errors';
import { writeAuditLog } from '@/core/audit/audit.service';
import * as usersRepository from './users.repository';
import type { CreateUserInput, UpdateUserRoleInput } from './users.schema';

export function listUsers() {
  return usersRepository.findMany();
}

export async function getUserDetail(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) throw new NotFoundError('Không tìm thấy tài khoản');
  return user;
}

export function listDepartmentOptions() {
  return usersRepository.findDepartmentOptions();
}

/**
 * Tạo tài khoản mới với mật khẩu mặc định, buộc đổi ở lần đăng nhập đầu tiên.
 * Trả kèm mật khẩu mặc định để UI hiển thị/gửi cho người dùng.
 */
export async function createUser(actor: AuthJWTPayload, input: CreateUserInput) {
  const existing = await usersRepository.findByUsernameOrEmail(input.username, input.email);
  if (existing) {
    throw new ConflictError('Tên đăng nhập hoặc email đã tồn tại trên hệ thống');
  }

  const role = await usersRepository.findRoleById(input.roleId);
  if (!role) throw new NotFoundError('Vai trò không tồn tại');

  const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, PASSWORD_SALT_ROUNDS);

  const user = await usersRepository.create({
    fullName: input.fullName,
    username: input.username,
    email: input.email,
    departmentId: input.departmentId,
    roleId: input.roleId,
    passwordHash,
    isPasswordChanged: false,
  });

  return { user, defaultPassword: DEFAULT_USER_PASSWORD };
}

/** Đưa mật khẩu về mặc định và bắt người dùng đổi lại khi đăng nhập. */
export async function resetPassword(actor: AuthJWTPayload, userId: string) {
  const user = await usersRepository.findById(userId);
  if (!user) throw new NotFoundError('Không tìm thấy tài khoản');

  const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, PASSWORD_SALT_ROUNDS);
  await usersRepository.updatePasswordHash(userId, passwordHash, false);

  return { defaultPassword: DEFAULT_USER_PASSWORD };
}

export async function changeUserRole(actor: AuthJWTPayload, input: UpdateUserRoleInput) {
  const [targetUser, targetRole] = await Promise.all([
    usersRepository.findById(input.userId),
    usersRepository.findRoleById(input.roleId),
  ]);
  if (!targetUser) throw new NotFoundError('Không tìm thấy tài khoản');
  if (!targetRole) throw new NotFoundError('Không tìm thấy vai trò');

  const updated = await usersRepository.updateRole(input.userId, input.roleId);

  await writeAuditLog({
    userId: actor.sub,
    action: 'UPDATE_USER_ROLE',
    detail: `${actor.fullName} đã đổi vai trò của ${targetUser.fullName} từ "${targetUser.role.name}" sang "${targetRole.name}"`,
  });

  return updated;
}
