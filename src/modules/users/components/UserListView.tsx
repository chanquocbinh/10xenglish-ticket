'use client';

import Link from 'next/link';
import { AuthJWTPayload } from '@/core/auth/auth.types';
import { hasPermission } from '@/core/auth/permissions';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { resetPasswordAction } from '@/modules/users/users.actions';
import type { UserListItem } from '@/modules/users/users.types';
import { formatDateTime } from '@/shared/utils/date';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Users, Key, Plus, Copy, RotateCcw, ShieldQuestion, Eye } from 'lucide';
import { TableActionMenu } from '@/shared/ui/TableActionMenu';

export function UserListView({
  initialUsers,
  currentUser,
}: {
  initialUsers: UserListItem[];
  currentUser: AuthJWTPayload;
}) {
  const canCreateUser = hasPermission(currentUser, 'users.create');
  const canResetPassword = hasPermission(currentUser, 'users.resetPassword');
  const canEditUser = hasPermission(currentUser, 'users.update');
  const users = initialUsers;

  const resetPassword = useServerAction(resetPasswordAction, {
    onSuccess: (data) => alert(`Đã reset mật khẩu thành công về: ${data.defaultPassword}`),
  });

  const handleResetPass = async (userId: string, name: string) => {
    if (confirm(`Reset mật khẩu của "${name}" về mặc định "10xEnglish@2026"?`)) {
      await resetPassword.execute(userId);
    }
  };

  const handleCopyZalo = (u: UserListItem) => {
    const text = `Chào ${u.fullName}, IT 10X English xin gửi tài khoản truy cập Portal Báo Bug & Nghiệm Thu:\n- Link: http://localhost:3000/login\n- Tên đăng nhập: ${u.username}\n- Mật khẩu mặc định: 10xEnglish@2026\n(Lưu ý: Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới trong lần đầu đăng nhập).`;
    navigator.clipboard.writeText(text).then(() => {
      alert(`Đã sao chép thông tin gửi Zalo cho ${u.fullName}:\n\n${text}`);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 2 Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#dbeafe',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MorphIcon icon={Users} size={20} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Tổng Tài Khoản
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {users.length} người dùng
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#ffedd5',
                color: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MorphIcon icon={Key} size={20} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Mật Khẩu Cấp Ban Đầu
              </Typography>
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'warning.dark' }}>
                10xEnglish@2026
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Action Bar */}
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
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Danh Sách Thành Viên & Phân Quyền
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasPermission(currentUser, 'roles.view') && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<MorphIcon icon={ShieldQuestion} size={16} />}
                component={Link}
                href="/roles"
              >
                Quản Lý Vai Trò
              </Button>
            )}
            {canCreateUser && (
              <AppButton
                size="small"
                startIcon={<MorphIcon icon={Plus} size={18} />}
                component={Link}
                href="/users/new"
              >
                Tạo Tài Khoản Mới
              </AppButton>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, whiteSpace: 'nowrap' }}>Thành viên</TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>Phòng ban</TableCell>
              <TableCell sx={{ width: 170, whiteSpace: 'nowrap' }}>Vai trò</TableCell>
              <TableCell sx={{ width: 150, whiteSpace: 'nowrap' }}>Mật khẩu ban đầu</TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>Trạng thái</TableCell>
              <TableCell sx={{ width: 80, whiteSpace: 'nowrap' }} align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {u.fullName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block' }}>
                    {u.email} • @{u.username}
                  </Typography>
                  {u.createdAt && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem', display: 'block', fontFamily: 'monospace' }}>
                      Tạo lúc: {formatDateTime(u.createdAt)}
                    </Typography>
                  )}
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                    {u.department?.name || 'Chưa gán'}
                  </Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {u.role.name}
                  </Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {!u.isPasswordChanged ? (
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'warning.dark', fontWeight: 600 }}>
                      10xEnglish@2026
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                      Đã đổi pass riêng
                    </Typography>
                  )}
                </TableCell>

                {/* Status: Text + Color Dot */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: u.isPasswordChanged ? '#2e7d32' : '#ea580c',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: u.isPasswordChanged ? 'success.main' : 'warning.dark',
                      }}
                    >
                      {u.isPasswordChanged ? 'Đã kích hoạt' : 'Chờ đổi pass'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <TableActionMenu
                    actions={[
                      {
                        label: 'Gửi Zalo',
                        icon: Copy,
                        onClick: () => handleCopyZalo(u),
                      },
                      {
                        label: 'Reset Mật Khẩu',
                        icon: RotateCcw,
                        hidden: !canResetPassword,
                        onClick: () => handleResetPass(u.id, u.fullName),
                      },
                      {
                        label: 'Xem Chi Tiết',
                        icon: Eye,
                        hidden: !canEditUser,
                        href: `/users/${u.id}`,
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
