import { z } from 'zod';

export const updateStorageSettingSchema = z.object({
  allowedFileTypes: z.string().min(1, 'Vui lòng chọn ít nhất một định dạng tệp tin'),
  maxImageSizeMb: z.number().int().min(1).max(50, 'Dung lượng ảnh tối đa 50MB'),
  maxVideoSizeMb: z.number().int().min(5).max(200, 'Dung lượng video tối đa 200MB'),
  allowVideoUpload: z.boolean(),
  storageQuotaGb: z.number().int().min(1).max(500, 'Hạn mức lưu trữ không vượt quá 500GB'),
});

export const signOffSchema = z.object({
  targetType: z.enum(['TICKET', 'TASK']),
  targetId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});
