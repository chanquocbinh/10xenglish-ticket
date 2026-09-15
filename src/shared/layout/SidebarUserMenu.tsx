'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { logoutAction, updateProfileAction } from '@/modules/auth/auth.actions';
import { useServerAction } from '@/shared/hooks/useServerAction';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { AppButton } from '@/shared/ui/AppButton';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { UserCog, LogOut, ChevronUp } from 'lucide';

export function SidebarUserMenu({ currentUser }: { currentUser: AuthJWTPayload }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { execute, isLoading } = useServerAction<[FormData], void>(updateProfileAction, {
    onSuccess: () => setMessage({ type: 'success', text: 'Đã cập nhật thông tin cá nhân.' }),
    onError: (text) => setMessage({ type: 'error', text }),
  });

  const menuOpen = Boolean(anchorEl);

  const openProfile = () => {
    setAnchorEl(null);
    setMessage(null);
    setFullName(currentUser.fullName);
    setEmail(currentUser.email);
    setProfileOpen(true);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi portal?')) return;
    await logoutAction();
    router.push('/login');
    router.refresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    const result = await execute(formData);
    if (result.success) setProfileOpen(false);
  };

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          p: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'left',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {currentUser.fullName.slice(0, 2).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8125rem' }}>
            {currentUser.fullName}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.6875rem' }}>
            {currentUser.roleName}
          </Typography>
        </Box>
        <MorphIcon icon={ChevronUp} size={16} />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{ paper: { sx: { width: 218 } } }}
      >
        <MenuItem onClick={openProfile} sx={{ fontSize: '0.8125rem' }}>
          <ListItemIcon>
            <MorphIcon icon={UserCog} size={18} />
          </ListItemIcon>
          Thông tin cá nhân
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.8125rem', color: 'error.main' }}>
          <ListItemIcon>
            <MorphIcon icon={LogOut} size={18} />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Thông Tin Cá Nhân</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {message && (
              <Alert severity={message.type} sx={{ fontSize: '0.8125rem' }}>
                {message.text}
              </Alert>
            )}
            <TextField
              label="Họ và tên"
              size="small"
              fullWidth
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Tên đăng nhập"
              size="small"
              fullWidth
              value={currentUser.username}
              disabled
            />
            <TextField
              label="Vai trò"
              size="small"
              fullWidth
              value={currentUser.roleName}
              disabled
            />
            {currentUser.departmentName && (
              <TextField
                label="Phòng ban"
                size="small"
                fullWidth
                value={currentUser.departmentName}
                disabled
              />
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setProfileOpen(false)} color="inherit" size="small">
              Hủy
            </Button>
            <AppButton
              type="submit"
              size="small"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Lưu Thay Đổi
            </AppButton>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
