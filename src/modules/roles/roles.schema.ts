import { z } from 'zod';
import { isPermission, type Permission } from '@/core/auth/permissions';

const permissionSchema = z
  .string()
  .refine(isPermission, { message: 'Quyền không hợp lệ' })
  .transform((v) => v as Permission);

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Tên vai trò tối thiểu 2 ký tự'),
  description: z.string().optional(),
  permissions: z.array(permissionSchema).default([]),
});

export const updateRoleSchema = z.object({
  roleId: z.string().uuid(),
  name: z.string().min(2, 'Tên vai trò tối thiểu 2 ký tự'),
  description: z.string().optional(),
  permissions: z.array(permissionSchema).default([]),
});

export type CreateRoleInput = z.output<typeof createRoleSchema>;
export type UpdateRoleInput = z.output<typeof updateRoleSchema>;
