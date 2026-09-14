'use client';

import { useUIStore } from '@/stores/useUIStore';
import { ProjectSwitcher } from './ProjectSwitcher';
import { logoutAction } from '@/app/actions/auth.actions';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export function Header() {
  const { toggleSidebar, setTicketModalOpen, setSprintGuardModalOpen } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi portal?')) {
      await logoutAction();
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 }, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={toggleSidebar}
            edge="start"
            size="small"
            sx={{ display: { lg: 'none' }, color: 'text.secondary' }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <ProjectSwitcher />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddCircleOutlinedIcon />}
            onClick={() => setTicketModalOpen(true)}
          >
            Báo Bug Mới
          </Button>

          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<ShieldOutlinedIcon />}
            onClick={() => setSprintGuardModalOpen(true)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Ràng Buộc Sprint
          </Button>

          <Tooltip title="Đăng xuất">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
