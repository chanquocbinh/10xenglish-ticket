import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { writeAuditLog } from '@/core/audit/audit.service';
import { findSystemSetting, upsertSystemSetting } from './settings.repository';
import type { UpdateStorageSettingInput } from './settings.schema';

/**
 * Cấu hình lưu trữ mặc định khi hệ thống chưa có bản ghi nào.
 * Đây là nơi duy nhất khai báo giá trị mặc định.
 */
export const DEFAULT_SYSTEM_SETTING: UpdateStorageSettingInput = {
  allowedFileTypes: 'image/png,image/jpeg,image/webp,video/mp4,video/quicktime',
  maxImageSizeMb: 10,
  maxVideoSizeMb: 50,
  allowVideoUpload: true,
  storageQuotaGb: 20,
};

/**
 * Lấy cấu hình hệ thống, tự khởi tạo bản ghi mặc định nếu chưa tồn tại.
 */
export async function getSystemSetting() {
  const setting = await findSystemSetting();
  if (setting) return setting;
  return upsertSystemSetting(DEFAULT_SYSTEM_SETTING);
}

export async function updateSystemSetting(
  actor: AuthJWTPayload,
  input: UpdateStorageSettingInput,
) {
  const setting = await upsertSystemSetting(input);

  await writeAuditLog({
    userId: actor.sub,
    action: 'UPDATE_SYSTEM_SETTINGS',
    detail: `${actor.fullName} đã cập nhật cấu hình lưu trữ: Hạn mức ${input.storageQuotaGb}GB, Max ảnh ${input.maxImageSizeMb}MB, Max video ${input.maxVideoSizeMb}MB`,
  });

  return setting;
}
