import { prisma } from '@/core/db/prisma';

/** Truy vấn dữ liệu tài khoản. Không phân quyền, không ghi audit. */

export function findMany() {
  return prisma.user.findMany({
    include: { department: true, role: true },
    orderBy: { createdAt: 'desc' },
  });
}

export function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { department: true, role: true },
  });
}

export function findByUsernameOrEmail(username: string, email: string) {
  return prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
}

export interface CreateUserData {
  fullName: string;
  username: string;
  email: string;
  departmentId: string;
  roleId: string;
  passwordHash: string;
  isPasswordChanged: boolean;
}

export function create(data: CreateUserData) {
  return prisma.user.create({ data });
}

export function updatePasswordHash(id: string, passwordHash: string, isPasswordChanged: boolean) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash, isPasswordChanged },
  });
}

export function updateRole(id: string, roleId: string) {
  return prisma.user.update({
    where: { id },
    data: { roleId },
  });
}

export function findRoleById(id: string) {
  return prisma.role.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
}

export function findDepartmentOptions() {
  return prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
