import { NextRequest, NextResponse } from 'next/server';
import { getSystemSetting, processAndSaveImage, processAndSaveVideo } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 });
    }

    const setting = await getSystemSetting();
    const allowedTypes = setting.allowedFileTypes.split(',').map((t) => t.trim().toLowerCase());
    const mimeType = file.type.toLowerCase();

    // Check MIME type
    const isAllowed = allowedTypes.some((t) => mimeType.includes(t) || t.includes(mimeType));
    if (!isAllowed) {
      return NextResponse.json(
        { error: `Định dạng tệp "${mimeType}" không được phép. Chỉ hỗ trợ: ${setting.allowedFileTypes}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sizeMb = buffer.length / (1024 * 1024);

    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (isImage) {
      if (sizeMb > setting.maxImageSizeMb) {
        return NextResponse.json(
          { error: `Dung lượng ảnh vượt quá giới hạn cho phép (${setting.maxImageSizeMb} MB)` },
          { status: 400 }
        );
      }
      const result = await processAndSaveImage(buffer, file.name);
      return NextResponse.json({
        success: true,
        ...result,
        type: 'image',
      });
    }

    if (isVideo) {
      if (!setting.allowVideoUpload) {
        return NextResponse.json(
          { error: 'Quản trị viên đã tạm thời khóa tính năng tải lên video' },
          { status: 400 }
        );
      }
      if (sizeMb > setting.maxVideoSizeMb) {
        return NextResponse.json(
          { error: `Dung lượng video vượt quá giới hạn cho phép (${setting.maxVideoSizeMb} MB)` },
          { status: 400 }
        );
      }
      const result = await processAndSaveVideo(buffer, file.name);
      return NextResponse.json({
        success: true,
        ...result,
        type: 'video',
      });
    }

    return NextResponse.json({ error: 'Loại tệp tin không hợp lệ' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xử lý file' }, { status: 500 });
  }
}
