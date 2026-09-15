'use client';

import { useState } from 'react';
import { updateSystemSettingAction } from '@/modules/settings/settings.actions';
import { useServerAction } from '@/shared/hooks/useServerAction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { AppButton } from '@/shared/ui/AppButton';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { HardDrive, Save } from 'lucide';
import { formatDateTime } from '@/shared/utils/date';

interface SettingData {
  allowedFileTypes: string;
  maxImageSizeMb: number;
  maxVideoSizeMb: number;
  allowVideoUpload: boolean;
  storageQuotaGb: number;
  updatedAt?: Date;
}

export function SettingsForm({ initialSetting }: { initialSetting: SettingData }) {
  const [allowedFileTypes, setAllowedFileTypes] = useState(initialSetting.allowedFileTypes);
  const [maxImageSizeMb, setMaxImageSizeMb] = useState(initialSetting.maxImageSizeMb);
  const [maxVideoSizeMb, setMaxVideoSizeMb] = useState(initialSetting.maxVideoSizeMb);
  const [allowVideoUpload, setAllowVideoUpload] = useState(initialSetting.allowVideoUpload);
  const [storageQuotaGb, setStorageQuotaGb] = useState(initialSetting.storageQuotaGb);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { execute, isLoading } = useServerAction(updateSystemSettingAction, {
    onSuccess: () =>
      setMessage({ type: 'success', text: 'Đã lưu cấu hình lưu trữ & pipeline nén thành công!' }),
    onError: (text) => setMessage({ type: 'error', text }),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    await execute({
      allowedFileTypes,
      maxImageSizeMb: Number(maxImageSizeMb),
      maxVideoSizeMb: Number(maxVideoSizeMb),
      allowVideoUpload,
      storageQuotaGb: Number(storageQuotaGb),
    });
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header Card */}
      <Card>
        <CardContent
          sx={{
            p: 2,
            '&:last-child': { pb: 2 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: '#dbeafe',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MorphIcon icon={HardDrive} size={20} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Cấu Hình Lưu Trữ & Giới Hạn Tệp Hệ Thống
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Thư mục lưu trữ: <code>/public/uploads/</code>
                {initialSetting.updatedAt && ` • Cập nhật lần cuối: ${formatDateTime(initialSetting.updatedAt)}`}
              </Typography>
            </Box>
          </Box>
          <Chip label="Đang Hoạt Động" size="small" color="success" variant="outlined" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }} />
        </CardContent>
      </Card>

      {/* Main Settings Form Card */}
      <Card sx={{ width: '100%' }}>
        <Box component="form" onSubmit={handleSave}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {message && (
              <Alert severity={message.type} sx={{ fontSize: '0.8125rem' }}>
                {message.text}
              </Alert>
            )}

            {/* Storage Quota Progress */}
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                Dung lượng ổ đĩa máy chủ (Giới hạn lưu trữ dự án)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  Đã sử dụng: <strong>1.45 GB</strong> / {storageQuotaGb} GB
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {Math.round((1.45 / storageQuotaGb) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (1.45 / storageQuotaGb) * 100)}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            {/* Inputs Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
              <TextField
                label="Định dạng tệp cho phép upload"
                helperText="Phân tách bằng dấu phẩy (vd: .jpg, .jpeg, .png, .mp4, .pdf)"
                required
                fullWidth
                size="small"
                value={allowedFileTypes}
                onChange={(e) => setAllowedFileTypes(e.target.value)}
              />

              <TextField
                label="Hạn mức tổng bộ nhớ máy chủ (GB)"
                type="number"
                helperText="Cảnh báo quản trị viên khi đạt 90% dung lượng"
                required
                fullWidth
                size="small"
                value={storageQuotaGb}
                onChange={(e) => setStorageQuotaGb(Number(e.target.value))}
              />

              <TextField
                label="Dung lượng tối đa ảnh đơn (MB)"
                type="number"
                helperText="Mặc định: 5MB (Tự động nén WebP trước khi ghi disk)"
                required
                fullWidth
                size="small"
                value={maxImageSizeMb}
                onChange={(e) => setMaxImageSizeMb(Number(e.target.value))}
              />

              <TextField
                label="Dung lượng tối đa video (MB)"
                type="number"
                helperText="Mặc định: 50MB (Tự động scale chuẩn 720p)"
                required
                fullWidth
                size="small"
                value={maxVideoSizeMb}
                onChange={(e) => setMaxVideoSizeMb(Number(e.target.value))}
              />
            </Box>

            {/* Switch Toggle Box */}
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowVideoUpload}
                    onChange={(e) => setAllowVideoUpload(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      Cho phép tải lên tệp video bằng chứng
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Nếu tắt, người dùng chỉ có thể gửi ảnh chụp màn hình (giúp tiết kiệm băng thông máy chủ).
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </CardContent>

          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              bgcolor: '#f8fafc',
            }}
          >
            <AppButton
              type="submit"
              size="small"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <MorphIcon icon={Save} size={18} />}
            >
              Lưu Cấu Hình
            </AppButton>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
