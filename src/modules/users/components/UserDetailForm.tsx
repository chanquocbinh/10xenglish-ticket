'use client';

import Link from 'next/link';
import { formatDateTime } from '@/shared/utils/date';
import { useUserDetailForm } from '@/modules/users/hooks/useUserDetailForm';
import type { UserDetailItem } from '@/modules/users/users.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { ArrowLeft, RotateCcw } from 'lucide';

export function UserDetailForm({
  user,
  roles,
}: {
  user: UserDetailItem;
  roles: { id: string; name: string }[];
}) {
  const { roleId, setRoleId, message, isSaving, handleSaveRole, handleResetPass } = useUserDetailForm(user);

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
              Chi Tiết Tài Khoản: {user.fullName}
            </Typography>
          </Box>
          <Button component={Link} href="/users" color="inherit" size="small">
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        {/* Left Column: Information & Role Management */}
        <Card sx={{ height: 'fit-content' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Thông Tin Thành Viên</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{user.fullName}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                {user.email} • @{user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontFamily: 'monospace', mt: 0.5 }}>
                Tạo lúc: {formatDateTime(user.createdAt)} • Phòng ban: {user.department?.name || 'Chưa gán'}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Phân Quyền Vai Trò</Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="role-label">Vai trò hiện tại</InputLabel>
                <Select
                  labelId="role-label"
                  label="Vai trò hiện tại"
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <AppButton
                  size="small"
                  onClick={handleSaveRole}
                  disabled={isSaving || roleId === user.roleId}
                  startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  Lưu Thay Đổi Vai Trò
                </AppButton>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Right Column: Security & Password Management */}
        <Card sx={{ height: 'fit-content' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Trạng Thái Bảo Mật & Mật Khẩu</Typography>
              <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: user.isPasswordChanged ? 'success.main' : 'warning.dark' }}>
                  {user.isPasswordChanged ? '✓ Đã đổi mật khẩu cá nhân' : '⚠ Đang dùng mật khẩu mặc định (10xEnglish@2026)'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                  {user.isPasswordChanged
                    ? 'Tài khoản này đã chủ động đổi mật khẩu riêng tư.'
                    : 'Tài khoản chưa đổi mật khẩu kể từ khi cấp.'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Thao Tác Quản Trị</Typography>
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<MorphIcon icon={RotateCcw} size={14} />}
                  onClick={handleResetPass}
                >
                  Reset Mật Khẩu Về Mặc Định
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
