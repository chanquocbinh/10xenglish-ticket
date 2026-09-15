import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { writeAuditLog } from '@/core/audit/audit.service';
import { ConflictError, ForbiddenError, NotFoundError } from '@/core/errors';
import * as rolesRepository from './roles.repository';
import type { CreateRoleInput, UpdateRoleInput } from './roles.schema';

export function listRoles() {
  return rolesRepository.findManyWithUserCount();
}

export async function getRole(id: string) {
  const role = await rolesRepository.findById(id);
  if (!role) throw new NotFoundError('Không tìm thấy vai trò');
  return role;
}

export function listRoleOptions() {
  return rolesRepository.findOptions();
}

export async function createRole(actor: AuthJWTPayload, input: CreateRoleInput) {
  const existing = await rolesRepository.findByName(input.name);
  if (existing) throw new ConflictError('Tên vai trò đã tồn tại');

  const role = await rolesRepository.create({
    name: input.name,
    description: input.description,
    permissions: input.permissions,
  });

  await writeAuditLog({
    userId: actor.sub,
    action: 'CREATE_ROLE',
    detail: `${actor.fullName} đã tạo vai trò mới "${role.name}" với quyền: [${input.permissions.join(', ') || 'không có'}]`,
  });

  return role;
}

export async function updateRole(actor: AuthJWTPayload, input: UpdateRoleInput) {
  const existing = await rolesRepository.findById(input.roleId);
  if (!existing) throw new NotFoundError('Không tìm thấy vai trò');
  if (existing.isSystem) throw new ForbiddenError('Không thể chỉnh sửa vai trò hệ thống');

  const nameTaken = await rolesRepository.findByNameExcept(input.name, input.roleId);
  if (nameTaken) throw new ConflictError('Tên vai trò đã tồn tại');

  const role = await rolesRepository.update(input.roleId, {
    name: input.name,
    description: input.description,
    permissions: input.permissions,
  });

  await writeAuditLog({
    userId: actor.sub,
    action: 'UPDATE_ROLE',
    detail: `${actor.fullName} đã cập nhật vai trò "${role.name}" với quyền: [${input.permissions.join(', ') || 'không có'}]`,
  });

  return role;
}

export async function deleteRole(actor: AuthJWTPayload, roleId: string) {
  const role = await rolesRepository.findByIdWithUsers(roleId);
  if (!role) throw new NotFoundError('Không tìm thấy vai trò');
  if (role.isSystem) throw new ForbiddenError('Không thể xóa vai trò hệ thống');
  if (role.users.length > 0) {
    throw new ConflictError(
      `Không thể xóa: còn ${role.users.length} người dùng đang gán vai trò này. Vui lòng đổi vai trò cho họ trước.`,
    );
  }

  await rolesRepository.remove(roleId);

  await writeAuditLog({
    userId: actor.sub,
    action: 'DELETE_ROLE',
    detail: `${actor.fullName} đã xóa vai trò "${role.name}"`,
  });
}
