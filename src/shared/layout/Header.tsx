'use client';

import { useUIStore } from '@/shared/stores/ui.store';
import { ProjectSwitcher } from './ProjectSwitcher';
import { logoutAction } from '@/modules/auth/auth.actions';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { AppButton } from '@/shared/ui/AppButton';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Menu, PlusCircle, Shield, LogOut } from 'lucide';

import type { AccessibleProject } from '@/modules/projects/projects.types';

export function Header({ projects }: { projects: AccessibleProject[] }) {
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
            <MorphIcon icon={Menu} size={20} />
          </IconButton>
          <ProjectSwitcher projects={projects} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AppButton
            size="small"
            startIcon={<MorphIcon icon={PlusCircle} size={18} />}
            onClick={() => setTicketModalOpen(true)}
          >
            Báo Bug Mới
          </AppButton>

          <AppButton
            size="small"
            startIcon={<MorphIcon icon={Shield} size={18} />}
            onClick={() => setSprintGuardModalOpen(true)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Ràng Buộc Sprint
          </AppButton>

          <Tooltip title="Đăng xuất">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
              <MorphIcon icon={LogOut} size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
