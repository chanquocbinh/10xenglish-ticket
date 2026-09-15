'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, runAction } from '@/core/server/action';
import type { ActionResult } from '@/core/result';
import { createRoleSchema, updateRoleSchema } from './roles.schema';
import * as rolesService from './roles.service';

export async function createRoleAction(data: {
  name: string;
  description?: string;
  permissions: string[];
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requirePermission('roles.create');
    const input = createRoleSchema.parse(data);
    const role = await rolesService.createRole(actor, input);
    revalidatePath('/roles');
    return { id: role.id };
  });
}

export async function updateRoleAction(data: {
  roleId: string;
  name: string;
  description?: string;
  permissions: string[];
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requirePermission('roles.update');
    const input = updateRoleSchema.parse(data);
    const role = await rolesService.updateRole(actor, input);
    revalidatePath('/roles');
    return { id: role.id };
  });
}

export async function deleteRoleAction(roleId: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const actor = await requirePermission('roles.delete');
    await rolesService.deleteRole(actor, roleId);
    revalidatePath('/roles');
  });
}
