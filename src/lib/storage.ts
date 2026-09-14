import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from './prisma';

export async function processAndSaveImage(
  buffer: Buffer,
  originalFilename: string
): Promise<{ url: string; originalSize: number; compressedSize: number }> {
  const originalSize = buffer.length;

  // Lấy năm-tháng hiện tại
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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

export async function processAndSaveVideo(
  buffer: Buffer,
  originalFilename: string
): Promise<{ url: string; originalSize: number; compressedSize: number }> {
  const originalSize = buffer.length;
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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

export async function getSystemSetting() {
  let setting = await prisma.systemSetting.findUnique({
    where: { id: 'default' },
  });
  if (!setting) {
    setting = await prisma.systemSetting.create({
      data: {
        id: 'default',
        allowedFileTypes: 'image/png,image/jpeg,image/webp,video/mp4,video/quicktime',
        maxImageSizeMb: 10,
        maxVideoSizeMb: 50,
        allowVideoUpload: true,
        storageQuotaGb: 20,
      },
    });
  }
  return setting;
}
