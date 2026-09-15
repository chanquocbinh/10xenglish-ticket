'use server';

import { parseInput, requireUser, runAction } from '@/core/server/action';
import { changePasswordSchema, loginSchema } from './auth.schema';
import * as authService from './auth.service';

export async function loginAction(formData: FormData) {
  return runAction(async () => {
    const input = parseInput(loginSchema, {
      usernameOrEmail: String(formData.get('usernameOrEmail') ?? ''),
      password: String(formData.get('password') ?? ''),
    });
    return authService.login(input);
  });
}

export async function logoutAction() {
  return runAction(async () => {
    await authService.logout();
  });
}

export async function changePasswordAction(formData: FormData) {
  return runAction(async () => {
    const actor = await requireUser();
    const input = parseInput(changePasswordSchema, {
      currentPassword: String(formData.get('currentPassword') ?? ''),
      newPassword: String(formData.get('newPassword') ?? ''),
      confirmPassword: String(formData.get('confirmPassword') ?? ''),
    });
    await authService.changePassword(actor, input);
  });
}
