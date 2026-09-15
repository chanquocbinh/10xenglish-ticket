import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { AppError } from '@/core/errors';
import { getSystemSetting } from '@/modules/settings/settings.service';
import type { SavedFile, UploadedFile } from './storage.types';

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Nén ảnh bằng Sharp (resize max 1920x1080, convert WebP) rồi ghi vào
 * public/uploads/images/<năm-tháng>/.
 */
export async function saveImage(buffer: Buffer): Promise<SavedFile> {
  const originalSize = buffer.length;

  // Lấy năm-tháng hiện tại
  const yearMonth = currentYearMonth();
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'images', yearMonth);
  await fs.mkdir(targetDir, { recursive: true });

  const randomId = crypto.randomUUID();
  const finalFileName = `${randomId}.webp`;
  const targetPath = path.join(targetDir, finalFileName);

  // Nén ảnh bằng Sharp: Resize max width 1920, convert WebP quality 80
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  await fs.writeFile(targetPath, compressedBuffer);

  return {
    url: `/uploads/images/${yearMonth}/${finalFileName}`,
    originalSize,
    compressedSize: compressedBuffer.length,
  };
}

/**
 * Ghi video nguyên bản vào public/uploads/videos/<năm-tháng>/, giữ phần mở rộng gốc.
 */
export async function saveVideo(buffer: Buffer, originalFilename: string): Promise<SavedFile> {
  const originalSize = buffer.length;

  const yearMonth = currentYearMonth();
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'videos', yearMonth);
  await fs.mkdir(targetDir, { recursive: true });

  const randomId = crypto.randomUUID();
  const ext = path.extname(originalFilename).toLowerCase() || '.mp4';
  const finalFileName = `${randomId}${ext}`;
  const targetPath = path.join(targetDir, finalFileName);

  await fs.writeFile(targetPath, buffer);

  return {
    url: `/uploads/videos/${yearMonth}/${finalFileName}`,
    originalSize,
    compressedSize: buffer.length,
  };
}

/**
 * Toàn bộ rule tải tệp lên: kiểm tra định dạng cho phép, giới hạn dung lượng
 * ảnh/video và cờ bật/tắt upload video theo cấu hình hệ thống.
 */
export async function saveUploadedFile(file: File): Promise<UploadedFile> {
  const setting = await getSystemSetting();
  const allowedTypes = setting.allowedFileTypes.split(',').map((t) => t.trim().toLowerCase());
  const mimeType = file.type.toLowerCase();

  // Check MIME type
  const isAllowed = allowedTypes.some((t) => mimeType.includes(t) || t.includes(mimeType));
  if (!isAllowed) {
    throw new AppError(
      `Định dạng tệp "${mimeType}" không được phép. Chỉ hỗ trợ: ${setting.allowedFileTypes}`,
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sizeMb = buffer.length / (1024 * 1024);

  if (mimeType.startsWith('image/')) {
    if (sizeMb > setting.maxImageSizeMb) {
      throw new AppError(
        `Dung lượng ảnh vượt quá giới hạn cho phép (${setting.maxImageSizeMb} MB)`,
      );
    }
    const saved = await saveImage(buffer);
    return { ...saved, type: 'image' };
  }

  if (mimeType.startsWith('video/')) {
    if (!setting.allowVideoUpload) {
      throw new AppError('Quản trị viên đã tạm thời khóa tính năng tải lên video');
    }
    if (sizeMb > setting.maxVideoSizeMb) {
      throw new AppError(
        `Dung lượng video vượt quá giới hạn cho phép (${setting.maxVideoSizeMb} MB)`,
      );
    }
    const saved = await saveVideo(buffer, file.name);
    return { ...saved, type: 'video' };
  }

  throw new AppError('Loại tệp tin không hợp lệ');
}
