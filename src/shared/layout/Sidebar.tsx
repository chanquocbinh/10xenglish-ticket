'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/shared/stores/ui.store';
import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { hasPermission, type Permission } from '@/core/auth/permissions';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import {
  LayoutDashboard,
  Bug,
  ListTodo,
  Kanban,
  ShieldCheck,
  Users,
  Settings,
  ShieldQuestion,
  StickyNote,
  FolderKanban,
  X,
} from 'lucide';
import type { AccessibleProject } from '@/modules/projects/projects.types';

interface SidebarProps {
  currentUser: AuthJWTPayload;
  projects: AccessibleProject[];
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
  badge?: string;
}

export function Sidebar({ currentUser, projects }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const activeCode =
    projects.find((p) => p.code === firstSegment)?.code ?? projects[0]?.code ?? '';
  const base = activeCode ? `/${activeCode}` : '/';

  const navItems: NavItem[] = [
    { label: 'Tổng quan', href: base, icon: LayoutDashboard, permission: 'dashboard.view' },
    { label: 'Quản lý ticket', href: `${base === '/' ? '' : base}/tickets`, icon: Bug, permission: 'tickets.view', badge: 'Bug' },
    { label: 'Quản lý task', href: `${base === '/' ? '' : base}/tasks`, icon: ListTodo, permission: 'tasks.view' },
    { label: 'Feature & Sprint', href: `${base === '/' ? '' : base}/sprints`, icon: Kanban, permission: 'sprints.view' },
    { label: 'Nghiệm thu', href: '/approval', icon: ShieldCheck, permission: 'approval.view', badge: 'Sign-off' },
    { label: 'Ghi chú cá nhân', href: '/notes', icon: StickyNote },
  ];

  const adminItems: NavItem[] = [
    { label: 'Quản lý dự án', href: '/admin/projects', icon: FolderKanban, permission: 'projects.view' },
    { label: 'Quản lý người dùng', href: '/users', icon: Users, permission: 'users.view' },
    { label: 'Quản lý vai trò', href: '/roles', icon: ShieldQuestion, permission: 'roles.view' },
    { label: 'Cấu hình hệ thống', href: '/settings', icon: Settings, permission: 'settings.view' },
  ];

  const visibleNavItems = navItems.filter((item) => !item.permission || hasPermission(currentUser, item.permission));
  const visibleAdminItems = adminItems.filter((item) => !item.permission || hasPermission(currentUser, item.permission));

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--color-primary)',
        color: '#94a3b8',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          height: 56,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          component={Link}
          href={base}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
          }}
        >
          <Box
            component="img"
            src="/asset/logo.jpeg"
            alt="10X English"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 0.5,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.2 }}>
              QUẢN LÝ CÔNG VIỆC
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={() => setSidebarOpen(false)}
          size="small"
          sx={{ display: { lg: 'none' }, color: '#94a3b8' }}
        >
          <MorphIcon icon={X} size={18} />
        </IconButton>
      </Box>

      {/* Navigation list */}
      <Box sx={{ flex: 1, py: 2, px: 0, overflowY: 'auto' }}>
        {visibleNavItems.length > 0 && (
          <Typography
            variant="caption"
            sx={{ px: 2, pb: 1, display: 'block', fontWeight: 600, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: 0.5, fontSize: '9px' }}
          >
            CÔNG VIỆC
          </Typography>
        )}
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  selected={isActive}
                  sx={{
                    py: 1,
                    px: 2,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.1) !important' : 'transparent',
                    borderLeft: isActive ? '3px solid #60A5FA' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center' }}>
                    <MorphIcon icon={item.icon} size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        bgcolor: item.badge === 'Bug' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: item.badge === 'Bug' ? '#fca5a5' : '#fde68a',
                        border: item.badge === 'Bug' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {visibleAdminItems.length > 0 && (
          <Typography
            variant="caption"
            sx={{ px: 2, pt: 3, pb: 1, display: 'block', fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: 0.5, fontSize: '9px' }}
          >
            HỆ THỐNG
          </Typography>
        )}
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {visibleAdminItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  selected={isActive}
                  sx={{
                    py: 1,
                    px: 2,
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.1) !important' : 'transparent',
                    borderLeft: isActive ? '3px solid #60A5FA' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center' }}>
                    <MorphIcon icon={item.icon} size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* User profile card */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'transparent' }}>
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
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            border: 'none',
            bgcolor: 'var(--color-primary)',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Persistent Drawer / Static Box */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: 250,
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'var(--color-primary)',
          height: '100vh',
        }}
      >
        {sidebarContent}
      </Box>
    </>
  );
}
