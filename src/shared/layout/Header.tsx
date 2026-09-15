'use client';

import { useUIStore } from '@/shared/stores/ui.store';
import { ProjectSwitcher } from './ProjectSwitcher';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Menu } from 'lucide';

import type { AccessibleProject } from '@/modules/projects/projects.types';

export function Header({ projects }: { projects: AccessibleProject[] }) {
  const { toggleSidebar } = useUIStore();

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
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
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
      </Toolbar>
    </AppBar>
  );
}
