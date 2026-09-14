'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signJWT, setAuthCookie, clearAuthCookie, getCurrentUser } from '@/lib/auth';
import { loginSchema, changePasswordSchema, createUserSchema } from '@/lib/validations/auth.schema';
import { Role } from '@/types/auth';

export async function loginAction(formData: FormData) {
  const usernameOrEmail = formData.get('usernameOrEmail') as string;
  const password = formData.get('password') as string;

  const parsed = loginSchema.safeParse({ usernameOrEmail, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail.toLowerCase().trim() },
        { email: usernameOrEmail.toLowerCase().trim() },
      ],
    },
    include: { department: true },
  });

  if (!user) {
    return { error: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { error: 'Tên đăng nhập hoặc mật khẩu không chính xác' };
  }

  const token = await signJWT({
    sub: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
    departmentName: user.department?.name,
    isPasswordChanged: user.isPasswordChanged,
  });

  await setAuthCookie(token);

  return {
    success: true,
    isPasswordChanged: user.isPasswordChanged,
  };
}

export async function logoutAction() {
  await clearAuthCookie();
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: 'Chưa đăng nhập' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Mật khẩu không đạt yêu cầu' };
  }

  const user = await prisma.user.findUnique({ where: { id: currentUser.sub } });
  if (!user) return { error: 'Không tìm thấy tài khoản' };

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return { error: 'Mật khẩu hiện tại không đúng' };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      isPasswordChanged: true,
    },
  });

  // Cấp lại token mới với cờ isPasswordChanged = true
  const token = await signJWT({
    ...currentUser,
    isPasswordChanged: true,
  });
  await setAuthCookie(token);

  return { success: true };
}

export async function createUserAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'DEV_ADMIN') {
    return { error: 'Chỉ Super Admin mới có quyền tạo tài khoản mới' };
  }

  const fullName = formData.get('fullName') as string;
  const username = (formData.get('username') as string)?.toLowerCase().trim();
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const departmentId = formData.get('departmentId') as string;
  const role = formData.get('role') as Role;

  const parsed = createUserSchema.safeParse({ fullName, username, email, departmentId, role, forceChangePassword: true });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Thông tin chưa hợp lệ' };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return { error: 'Tên đăng nhập hoặc email đã tồn tại trên hệ thống' };
  }

  const defaultPass = '10xEnglish@2026';
  const passwordHash = await bcrypt.hash(defaultPass, 10);

  const newUser = await prisma.user.create({
    data: {
      fullName,
      username,
      email,
      departmentId,
      role,
      passwordHash,
      isPasswordChanged: false,
    },
  });

  return { success: true, user: newUser, defaultPass };
}

export async function resetPasswordAction(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'DEV_ADMIN') {
    return { error: 'Bạn không có quyền thực hiện thao tác này' };
  }

  const defaultPass = '10xEnglish@2026';
  const passwordHash = await bcrypt.hash(defaultPass, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      isPasswordChanged: false,
    },
  });

  return { success: true, defaultPass };
}
