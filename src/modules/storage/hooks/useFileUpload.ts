'use client';

import { useCallback, useState } from 'react';

interface UploadResponse {
  success?: boolean;
  url?: string;
  error?: string;
}

/**
 * Tải tệp lên endpoint /api/upload và chuẩn hoá trạng thái pending/error
 * cho các form của module khác dùng lại.
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<{ url: string } | null> => {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as UploadResponse;

      if (!res.ok || !data.url) {
        setError(data.error || 'Lỗi máy chủ khi xử lý file');
        return null;
      }

      return { url: data.url };
    } catch {
      setError('Không thể tải tệp lên, vui lòng thử lại');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, error };
}
