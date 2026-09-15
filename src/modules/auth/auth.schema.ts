import { z } from 'zod';

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, 'Tên đăng nhập hoặc email tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ in hoa')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100, 'Họ và tên tối đa 100 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
