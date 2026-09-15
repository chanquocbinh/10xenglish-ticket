'use server';

import { revalidatePath } from 'next/cache';
import { parseInput, requirePermission, runAction } from '@/core/server/action';
import { updateStorageSettingSchema } from './settings.schema';
import { updateSystemSetting } from './settings.service';

export async function updateSystemSettingAction(input: unknown) {
  return runAction(async () => {
    const actor = await requirePermission('settings.update');
    const data = parseInput(updateStorageSettingSchema, input);

    await updateSystemSetting(actor, data);

    revalidatePath('/settings');
  });
}
