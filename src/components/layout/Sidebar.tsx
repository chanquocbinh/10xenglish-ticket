'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/useUIStore';
import { AuthJWTPayload } from '@/types/auth';
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

import { MorphIcon } from '@/components/ui/MorphIcon';
import {
  LayoutDashboard,
  Bug,
  ListTodo,
  Kanban,
  ShieldCheck,
  Users,
  Settings,
  X,
} from 'lucide';

interface SidebarProps {
  currentUser: AuthJWTPayload;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const navItems: NavItem[] = [
    { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { label: 'Quản lý ticket', href: '/tickets', icon: Bug, badge: 'Bug' },
    { label: 'Quản lý task', href: '/tasks', icon: ListTodo },
    { label: 'Feature & Sprint', href: '/sprints', icon: Kanban },
    { label: 'Nghiệm thu', href: '/approval', icon: ShieldCheck, badge: 'Sign-off' },
  ];

  const adminItems = [
    { label: 'Quản lý người dùng', href: '/users', icon: Users, role: ['DEV_ADMIN', 'MANAGER'] },
    { label: 'Cấu hình hệ thống', href: '/settings', icon: Settings, role: ['DEV_ADMIN'] },
  ];

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
          borderBottom: '1px solid var(--color-primary-border)',
        }}
      >
        <Box
          component={Link}
          href="/"
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
        <Typography
          variant="caption"
          sx={{ px: 2, pb: 1, display: 'block', fontWeight: 600, color: '#475569', letterSpacing: 0.5, fontSize: '8px' }}
        >
          CÔNG VIỆC
        </Typography>
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => {
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
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    bgcolor: isActive ? 'var(--color-primary-active) !important' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-primary-accent)' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'var(--color-primary-hover)',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#ffffff' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
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
                        bgcolor: item.badge === 'Bug' ? '#7f1d1d' : '#78350f',
                        color: item.badge === 'Bug' ? '#fca5a5' : '#fde68a',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Typography
          variant="caption"
          sx={{ px: 2, pt: 3, pb: 1, display: 'block', fontWeight: 700, color: '#475569', letterSpacing: 0.5, fontSize: '8px' }}
        >
          HỆ THỐNG
        </Typography>
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {adminItems.map((item) => {
            if (!item.role.includes(currentUser.role)) return null;
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
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    bgcolor: isActive ? 'var(--color-primary-active) !important' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-primary-accent)' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'var(--color-primary-hover)',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#ffffff' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
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

      <Divider sx={{ borderColor: 'var(--color-primary-border)' }} />

      {/* User profile card */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'var(--color-primary-dark)' }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'var(--color-primary-light)',
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
          <Typography variant="caption" noWrap sx={{ color: '#64748b', display: 'block', fontSize: '0.6875rem' }}>
            {currentUser.role === 'DEV_ADMIN'
              ? 'Dev Super Admin'
              : currentUser.role === 'MANAGER'
                ? 'Ban Quản Lý'
                : currentUser.departmentName || currentUser.role}
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, border: 'none' },
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
          borderRight: '1px solid #1e293b',
          height: '100vh',
        }}
      >
        {sidebarContent}
      </Box>
    </>
  );
}
