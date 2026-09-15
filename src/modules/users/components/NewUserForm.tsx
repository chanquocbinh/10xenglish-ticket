'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNewUserForm } from '@/modules/users/hooks/useNewUserForm';
import type { DepartmentOption } from '@/modules/users/users.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { ArrowLeft, Copy } from 'lucide';

interface RoleOption {
  id: string;
  name: string;
}

export function NewUserForm({
  departments,
  roles,
}: {
  departments: DepartmentOption[];
  roles: RoleOption[];
}) {
  const router = useRouter();
  const {
    fullName,
    setFullName,
    username,
    setUsername,
    email,
    setEmail,
    departmentId,
    setDepartmentId,
    roleId,
    setRoleId,
    createdResult,
    isSubmitting,
    errorMessage,
    handleSubmit,
  } = useNewUserForm(departments, roles);

  if (createdResult) {
    const zaloText = `Chào ${createdResult.fullName}, IT 10X English xin gửi tài khoản truy cập Portal Báo Bug & Nghiệm Thu:\n- Link: http://localhost:3000/login\n- Tên đăng nhập: ${createdResult.username}\n- Mật khẩu mặc định: ${createdResult.defaultPass}\n(Lưu ý: Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới trong lần đầu đăng nhập).`;
    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
              Tạo Tài Khoản Thành Công
            </Typography>
            <Button component={Link} href="/users" color="inherit" size="small">
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert severity="success">Đã tạo thành công tài khoản cho <strong>{createdResult.fullName}</strong>!</Alert>
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Mật khẩu mặc định khởi tạo:</Typography>
              <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'warning.dark', my: 0.5 }}>
                {createdResult.defaultPass}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Hệ thống yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MorphIcon icon={Copy} size={14} />}
                onClick={() => navigator.clipboard.writeText(zaloText)}
              >
                Sao chép thông tin gửi Zalo
              </Button>
              <AppButton onClick={() => router.push('/users')}>Quay Lại Danh Sách Người Dùng</AppButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Action Bar Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton component={Link} href="/users" size="small">
              <MorphIcon icon={ArrowLeft} size={18} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Tạo Tài Khoản Mới
            </Typography>
          </Box>
          <Button component={Link} href="/users" color="inherit" size="small">
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
              <TextField
                label="Họ và tên"
                required
                fullWidth
                size="small"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
              />

              <TextField
                label="Tên đăng nhập (Username)"
                required
                fullWidth
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nguyenvana"
              />

              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vana@10x..."
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="dept-label">Phòng ban</InputLabel>
                <Select
                  labelId="dept-label"
                  label="Phòng ban"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="role-select-label">Vai trò</InputLabel>
                <Select
                  labelId="role-select-label"
                  label="Vai trò"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Alert severity="info" variant="outlined" sx={{ fontSize: '0.75rem' }}>
              Mật khẩu mặc định: <code>10xEnglish@2026</code>. Người dùng sẽ đổi mật khẩu ở lần đăng nhập đầu tiên.
              {roles.length === 0 && ' Chưa có vai trò nào — vui lòng tạo vai trò trước ở trang Quản Lý Vai Trò.'}
            </Alert>
          </CardContent>

          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Button component={Link} href="/users" color="inherit" size="small">
              Hủy
            </Button>
            <AppButton
              type="submit"
              size="small"
              disabled={isSubmitting || roles.length === 0}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Tạo Tài Khoản
            </AppButton>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
