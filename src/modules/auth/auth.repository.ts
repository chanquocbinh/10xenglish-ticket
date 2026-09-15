import { prisma } from '@/core/db/prisma';

/**
 * Truy cập dữ liệu tài khoản phục vụ đăng nhập / đổi mật khẩu.
 * Repository nội bộ của module auth, không authz, không audit.
 */
export function findUserByUsernameOrEmail(identifier: string) {
  const normalized = identifier.toLowerCase().trim();
  return prisma.user.findFirst({
    where: {
      OR: [{ username: normalized }, { email: normalized }],
    },
    include: { department: true, role: true },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function updatePassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      isPasswordChanged: true,
    },
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });
}

export function updateProfile(userId: string, data: { fullName: string; email: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: { fullName: data.fullName, email: data.email },
  });
}
