import { prisma } from '@/core/db/prisma';
import { SYSTEM_SETTING_ID } from '@/core/config/env';
import type { UpdateStorageSettingInput } from './settings.schema';

export function findSystemSetting() {
  return prisma.systemSetting.findUnique({
    where: { id: SYSTEM_SETTING_ID },
  });
}

export function upsertSystemSetting(data: UpdateStorageSettingInput) {
  return prisma.systemSetting.upsert({
    where: { id: SYSTEM_SETTING_ID },
    update: data,
    create: { id: SYSTEM_SETTING_ID, ...data },
  });
}
