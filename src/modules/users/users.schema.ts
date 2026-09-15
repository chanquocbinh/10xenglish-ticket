import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  username: z.string().min(3, 'Username tối thiểu 3 ký tự').regex(/^[a-z0-9._]+$/, 'Username chỉ chứa chữ thường, số, dấu chấm'),
  email: z.string().email('Email không đúng định dạng'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  roleId: z.string().uuid('Vui lòng chọn vai trò'),
  forceChangePassword: z.boolean().default(true),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export type CreateUserInput = z.output<typeof createUserSchema>;
export type UpdateUserRoleInput = z.output<typeof updateUserRoleSchema>;
