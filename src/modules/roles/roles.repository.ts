import { prisma } from '@/core/db/prisma';
import type { Permission } from '@/core/auth/permissions';

interface RoleWriteData {
  name: string;
  description?: string;
  permissions: Permission[];
}

/** Danh sách vai trò kèm số người dùng đang được gán, theo thứ tự tạo. */
export function findManyWithUserCount() {
  return prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export function findById(id: string) {
  return prisma.role.findUnique({ where: { id } });
}

export function findByName(name: string) {
  return prisma.role.findUnique({ where: { name } });
}

/** Kiểm tra trùng tên khi cập nhật: bỏ qua chính vai trò đang sửa. */
export function findByNameExcept(name: string, id: string) {
  return prisma.role.findFirst({ where: { name, id: { not: id } } });
}

export function findByIdWithUsers(id: string) {
  return prisma.role.findUnique({ where: { id }, include: { users: true } });
}

export function create(data: RoleWriteData) {
  return prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    },
  });
}

export function update(id: string, data: RoleWriteData) {
  return prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    },
  });
}

export function remove(id: string) {
  return prisma.role.delete({ where: { id } });
}

/** Option cho select vai trò (module users dùng qua roles.service). */
export function findOptions() {
  return prisma.role.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
