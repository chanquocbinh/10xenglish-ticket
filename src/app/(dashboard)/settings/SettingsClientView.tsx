'use client';

import { useState } from 'react';
import { updateSystemSettingAction } from '@/app/actions/setting.actions';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

interface SettingData {
  allowedFileTypes: string;
  maxImageSizeMb: number;
  maxVideoSizeMb: number;
  allowVideoUpload: boolean;
  storageQuotaGb: number;
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <StorageOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Bộ Nhớ Máy Chủ Nội Bộ (Local Storage)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Lưu trữ tại thư mục <code>/public/uploads/</code>
                </Typography>
              </Box>
            </Box>
            <Chip label="Đang Hoạt Động" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.6875rem' }} />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                Ước tính đã dùng: <strong>1.4 GB / {storageQuotaGb} GB (7%)</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                An toàn
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={7}
              sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
              Pipeline Sharp (Ảnh WebP) & FFmpeg (Video 720p) giúp tiết kiệm 70% dung lượng đĩa cứng.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, pb: 1, borderBottom: '1px solid #f1f5f9' }}>
            Cấu Hình Giới Hạn Tải Lên & Định Dạng Tệp Tin
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="MIME types được phép tải lên (phân cách bởi dấu phẩy)"
              required
              fullWidth
              size="small"
              value={allowedFileTypes}
              onChange={(e) => setAllowedFileTypes(e.target.value)}
              helperText="Mặc định: image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Dung lượng 1 Ảnh tối đa (MB)"
                type="number"
                inputProps={{ min: 1, max: 50 }}
                required
                fullWidth
                size="small"
                value={maxImageSizeMb}
                onChange={(e) => setMaxImageSizeMb(Number(e.target.value))}
                helperText="Ảnh tự động nén WebP trước khi lưu"
              />

              <TextField
                label="Dung lượng 1 Video tối đa (MB)"
                type="number"
                inputProps={{ min: 5, max: 200 }}
                required
                fullWidth
                size="small"
                value={maxVideoSizeMb}
                onChange={(e) => setMaxVideoSizeMb(Number(e.target.value))}
                helperText="Video tự động nén về chuẩn 720p"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, alignItems: 'center' }}>
              <TextField
                label="Hạn mức ổ đĩa phân bổ (GB)"
                type="number"
                inputProps={{ min: 1, max: 500 }}
                required
                fullWidth
                size="small"
                value={storageQuotaGb}
                onChange={(e) => setStorageQuotaGb(Number(e.target.value))}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={allowVideoUpload}
                    onChange={(e) => setAllowVideoUpload(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>Cho phép đính kèm Video tái hiện lỗi</Typography>}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon fontSize="small" />}
              >
                Lưu Cấu Hình
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
