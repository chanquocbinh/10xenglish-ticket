'use server';

import { revalidatePath } from 'next/cache';
import { parseInput, requirePermission, runAction } from '@/core/server/action';
import { createUserSchema, updateUserRoleSchema } from './users.schema';
import { changeUserRole, createUser, resetPassword } from './users.service';

export async function createUserAction(formData: FormData) {
  return runAction(async () => {
    const actor = await requirePermission('users.create');

    const input = parseInput(createUserSchema, {
      fullName: formData.get('fullName'),
      username: (formData.get('username') as string)?.toLowerCase().trim(),
      email: (formData.get('email') as string)?.toLowerCase().trim(),
      departmentId: formData.get('departmentId'),
      roleId: formData.get('roleId'),
      forceChangePassword: true,
    });

    const result = await createUser(actor, input);
    revalidatePath('/users');
    return { userId: result.user.id, defaultPassword: result.defaultPassword };
  });
}

export async function resetPasswordAction(userId: string) {
  return runAction(async () => {
    const actor = await requirePermission('users.resetPassword');
    const result = await resetPassword(actor, userId);
    revalidatePath('/users');
    return { defaultPassword: result.defaultPassword };
  });
}

export async function updateUserRoleAction(userId: string, roleId: string) {
  return runAction(async () => {
    const actor = await requirePermission('users.update');
    const input = parseInput(updateUserRoleSchema, { userId, roleId });
    await changeUserRole(actor, input);
    revalidatePath('/users');
  });
}
