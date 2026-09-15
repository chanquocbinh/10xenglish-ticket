import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/core/server/action';
import { AppError } from '@/core/errors';
import { saveUploadedFile } from '@/modules/storage/storage.service';

export async function POST(req: NextRequest) {
  try {
    await requireUser();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 });
    }

    const result = await saveUploadedFile(file);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi xử lý file' }, { status: 500 });
  }
}
