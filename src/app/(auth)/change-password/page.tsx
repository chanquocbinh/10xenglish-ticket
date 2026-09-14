'use client';

import { useState } from 'react';
import { changePasswordAction } from '@/app/actions/auth.actions';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('10xEnglish@2026');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const res = await changePasswordAction(formData);
    setIsSubmitting(false);

    if (res?.error) {
      setErrorMessage(res.error);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'warning.light',
                color: 'warning.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockResetOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                ĐỔI MẬT KHẨU BẮT BUỘC
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Chính sách bảo mật cho lần đăng nhập đầu
              </Typography>
            </Box>
          </Box>

          <Alert severity="warning" variant="outlined" sx={{ mb: 3, fontSize: '0.8125rem' }}>
            Để bảo vệ tài khoản nhân sự trung tâm, bạn cần thay đổi mật khẩu mặc định{' '}
            <code>10xEnglish@2026</code> thành mật khẩu cá nhân có ít nhất 8 ký tự, bao gồm chữ in hoa và chữ số.
          </Alert>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8125rem' }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Mật khẩu hiện tại"
              type="password"
              required
              fullWidth
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <TextField
              label="Mật khẩu mới"
              type="password"
              required
              fullWidth
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 số"
            />

            <TextField
              label="Xác nhận mật khẩu mới"
              type="password"
              required
              fullWidth
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="medium"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ mt: 1, py: 1 }}
            >
              Lưu Mật Khẩu & Vào Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
