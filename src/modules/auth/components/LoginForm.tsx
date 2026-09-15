'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/modules/auth/auth.actions';
import type { LoginResult } from '@/modules/auth/auth.types';
import { useServerAction } from '@/shared/hooks/useServerAction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { AppButton } from '@/shared/ui/AppButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

export function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('digihome');
  const [password, setPassword] = useState('Admin@123456');
  const router = useRouter();
  const { execute, isLoading, error } = useServerAction<[FormData], LoginResult>(loginAction, {
    refresh: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('usernameOrEmail', usernameOrEmail);
    formData.append('password', password);

    const result = await execute(formData);
    if (!result.success) return;

    if (!result.data.isPasswordChanged) {
      router.push('/change-password');
    } else {
      router.push('/');
    }
    router.refresh();
  };

  const quickFill = (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
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
          {/* Logo brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              10X
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                10X ENGLISH PORTAL
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Quản Lý Ticket & Bằng Chứng Nghiệm Thu
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8125rem' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên đăng nhập hoặc Email"
              required
              fullWidth
              size="small"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="admin, ceo@..., gv@..."
            />

            <TextField
              label="Mật khẩu"
              type="password"
              required
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <AppButton
              type="submit"
              fullWidth
              size="medium"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ mt: 0.5, py: 1 }}
            >
              Đăng Nhập Vào Portal
            </AppButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quick accounts */}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5 }}>
            Tài khoản thử nghiệm nhanh:
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Paper
              variant="outlined"
              onClick={() => quickFill('digihome', 'Admin@123456')}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                borderRadius: 1.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                Dev Super Admin
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                digihome
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              onClick={() => quickFill('tuan.ceo', '10xEnglish@2026')}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                borderRadius: 1.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'warning.dark' }}>
                Ban Giám Đốc (CEO)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                tuan.ceo
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              onClick={() => quickFill('huong.lms', '10xEnglish@2026')}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                borderRadius: 1.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: '#f8fafc' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                Cô Lan Hương (LMS)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                huong.lms
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              onClick={() => quickFill('maianh.acc', '10xEnglish@2026')}
              sx={{
                p: 1.25,
                cursor: 'pointer',
                borderRadius: 1.5,
                '&:hover': { borderColor: 'error.main', bgcolor: '#f8fafc' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'error.dark' }}>
                Mai Anh Kế Toán
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                Đổi pass lần đầu
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
