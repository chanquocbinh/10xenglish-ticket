'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { updateStorageSettingSchema } from '@/lib/validations/setting.schema';
import { revalidatePath } from 'next/cache';

export async function updateSystemSettingAction(data: {
  allowedFileTypes: string;
  maxImageSizeMb: number;
  maxVideoSizeMb: number;
  allowVideoUpload: boolean;
  storageQuotaGb: number;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'DEV_ADMIN') {
    return { error: 'Chỉ Super Admin mới có quyền cập nhật cấu hình hệ thống' };
  }

  const parsed = updateStorageSettingSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const setting = await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.sub,
      action: 'UPDATE_SYSTEM_SETTINGS',
      detail: `${user.fullName} đã cập nhật cấu hình lưu trữ: Hạn mức ${data.storageQuotaGb}GB, Max ảnh ${data.maxImageSizeMb}MB, Max video ${data.maxVideoSizeMb}MB`,
    },
  });

  revalidatePath('/settings');
  return { success: true, setting };
}
