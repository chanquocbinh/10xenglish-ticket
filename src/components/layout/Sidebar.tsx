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

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarProps {
  currentUser: AuthJWTPayload;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const navItems = [
    { label: 'Dashboard & Báo Cáo', href: '/', icon: DashboardOutlinedIcon },
    { label: 'Quản Lý Ticket Bug', href: '/tickets', icon: BugReportOutlinedIcon, badge: 'Bug' },
    { label: 'Task & Todolist Hàng Ngày', href: '/tasks', icon: ChecklistRtlOutlinedIcon },
    { label: 'Feature & Sprint Board', href: '/sprints', icon: ViewKanbanOutlinedIcon },
    { label: 'Phê Duyệt Nghiệm Thu (UAT)', href: '/approval', icon: VerifiedUserOutlinedIcon, badge: 'Sign-off' },
  ];

  const adminItems = [
    { label: 'Quản Lý Người Dùng', href: '/users', icon: PeopleAltOutlinedIcon, role: ['DEV_ADMIN', 'MANAGER'] },
    { label: 'Cấu Hình & Lưu Trữ', href: '/settings', icon: SettingsOutlinedIcon, role: ['DEV_ADMIN'] },
  ];

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0f172a',
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
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
              letterSpacing: 0.5,
            }}
          >
            10X
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.2 }}>
              10X ENGLISH
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6875rem' }}>
              Portal Quản Lý & Nghiệm Thu
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={() => setSidebarOpen(false)}
          size="small"
          sx={{ display: { lg: 'none' }, color: '#94a3b8' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Navigation list */}
      <Box sx={{ flex: 1, py: 2, px: 1.5, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{ px: 1, pb: 1, display: 'block', fontWeight: 600, color: '#475569', letterSpacing: 0.5 }}
        >
          PHÂN HỆ NGHIỆP VỤ
        </Typography>
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  selected={isActive}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    px: 1.5,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    bgcolor: isActive ? '#1e293b !important' : 'transparent',
                    borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: '#1e293b',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? 'primary.main' : '#64748b' }}>
                    <Icon fontSize="small" />
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
          sx={{ px: 1.5, pt: 3, pb: 1, display: 'block', fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}
        >
          HỆ THỐNG
        </Typography>
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {adminItems.map((item) => {
            if (!item.role.includes(currentUser.role)) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  selected={isActive}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    px: 1.5,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    bgcolor: isActive ? '#1e293b !important' : 'transparent',
                    borderLeft: isActive ? '3px solid #1976d2' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: '#1e293b',
                      color: '#ffffff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? 'primary.main' : '#64748b' }}>
                    <Icon fontSize="small" />
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

      <Divider sx={{ borderColor: '#1e293b' }} />

      {/* User profile card */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#0b1120' }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
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
