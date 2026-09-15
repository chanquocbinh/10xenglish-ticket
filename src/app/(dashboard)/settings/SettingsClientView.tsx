'use client';

import { useState } from 'react';
import { updateSystemSettingAction } from '@/app/actions/setting.actions';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { AppButton } from '@/components/ui/AppButton';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import { MorphIcon } from '@/components/ui/MorphIcon';
import { HardDrive, Save, Clock } from 'lucide';
import { formatDateTime } from '@/lib/date';

interface SettingData {
  allowedFileTypes: string;
  maxImageSizeMb: number;
  maxVideoSizeMb: number;
  allowVideoUpload: boolean;
  storageQuotaGb: number;
  updatedAt?: Date;
}

export function SettingsClientView({ initialSetting }: { initialSetting: SettingData }) {
  const [allowedFileTypes, setAllowedFileTypes] = useState(initialSetting.allowedFileTypes);
  const [maxImageSizeMb, setMaxImageSizeMb] = useState(initialSetting.maxImageSizeMb);
  const [maxVideoSizeMb, setMaxVideoSizeMb] = useState(initialSetting.maxVideoSizeMb);
  const [allowVideoUpload, setAllowVideoUpload] = useState(initialSetting.allowVideoUpload);
  const [storageQuotaGb, setStorageQuotaGb] = useState(initialSetting.storageQuotaGb);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await updateSystemSettingAction({
      allowedFileTypes,
      maxImageSizeMb: Number(maxImageSizeMb),
      maxVideoSizeMb: Number(maxVideoSizeMb),
      allowVideoUpload,
      storageQuotaGb: Number(storageQuotaGb),
    });

    setIsSubmitting(false);
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Đã lưu cấu hình lưu trữ & pipeline nén thành công!' });
      router.refresh();
    }
  };

  return (
    <Box sx={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top quota overview */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Bộ Nhớ Máy Chủ Nội Bộ (Local Storage)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Lưu trữ tại thư mục <code>/public/uploads/</code>
                  {initialSetting.updatedAt && ` • Cập nhật lần cuối: ${formatDateTime(initialSetting.updatedAt)}`}
                </Typography>
              </Box>
            </Box>
            <Chip label="Đang Hoạt Động" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.6875rem' }} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSave}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {message && (
              <Alert severity={message.type} sx={{ fontSize: '0.8125rem' }}>
                {message.text}
              </Alert>
            )}

            <Box>
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
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Định dạng tệp cho phép upload"
                helperText="Phân tách bằng dấu phẩy"
                required
                fullWidth
                size="small"
                value={allowedFileTypes}
                onChange={(e) => setAllowedFileTypes(e.target.value)}
              />

              <TextField
                label="Dung lượng tối đa ảnh đơn (MB)"
                type="number"
                helperText="Mặc định: 5MB (Tự động nén WebP)"
                required
                fullWidth
                size="small"
                value={maxImageSizeMb}
                onChange={(e) => setMaxImageSizeMb(Number(e.target.value))}
              />

              <TextField
                label="Dung lượng tối đa video (MB)"
                type="number"
                helperText="Mặc định: 50MB (Tự động scale 720p)"
                required
                fullWidth
                size="small"
                value={maxVideoSizeMb}
                onChange={(e) => setMaxVideoSizeMb(Number(e.target.value))}
              />

              <TextField
                label="Hạn mức tổng bộ nhớ máy chủ (GB)"
                type="number"
                helperText="Cảnh báo khi đạt 90% dung lượng"
                required
                fullWidth
                size="small"
                value={storageQuotaGb}
                onChange={(e) => setStorageQuotaGb(Number(e.target.value))}
              />
            </Box>

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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <AppButton
                type="submit"
                size="small"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <MorphIcon icon={Save} size={18} />}
              >
                Lưu Cấu Hình
              </AppButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
