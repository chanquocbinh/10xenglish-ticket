'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteRoleAction } from '../roles.actions';
import { permissionLabel } from '../roles.constants';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Plus, Lock, ArrowLeft, Eye, Pencil, Trash2 } from 'lucide';
import { TableActionMenu } from '@/shared/ui/TableActionMenu';

interface RoleData {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  _count: { users: number };
}

export function RoleListView({ initialRoles }: { initialRoles: RoleData[] }) {
  const router = useRouter();

  const handleDelete = async (role: RoleData) => {
    if (!confirm(`Xóa vai trò "${role.name}"? Thao tác này không thể hoàn tác.`)) return;
    const result = await deleteRoleAction(role.id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button component={Link} href="/users" size="small" color="inherit" startIcon={<MorphIcon icon={ArrowLeft} size={16} />}>
          Quay lại Người dùng
        </Button>
      </Box>

      <Card>
        <CardContent
          sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Danh Sách Vai Trò ({initialRoles.length})
          </Typography>
          <AppButton size="small" startIcon={<MorphIcon icon={Plus} size={18} />} component={Link} href="/roles/new">
            Tạo Vai Trò Mới
          </AppButton>
        </CardContent>
      </Card>

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 180, whiteSpace: 'nowrap' }}>Tên vai trò</TableCell>
              <TableCell sx={{ minWidth: 320 }}>Quyền</TableCell>
              <TableCell sx={{ width: 100, whiteSpace: 'nowrap' }}>Số user</TableCell>
              <TableCell sx={{ width: 80, whiteSpace: 'nowrap' }} align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initialRoles.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {r.name}
                    </Typography>
                    {r.isSystem && <MorphIcon icon={Lock} size={12} />}
                  </Box>
                  {r.description && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {r.description}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  {r.permissions.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {r.permissions.slice(0, 6).map((p) => (
                        <Chip key={p} label={permissionLabel(p)} size="small" sx={{ fontSize: '0.625rem', height: 20 }} />
                      ))}
                      {r.permissions.length > 6 && (
                        <Chip label={`+${r.permissions.length - 6}`} size="small" sx={{ fontSize: '0.625rem', height: 20 }} />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>Không có quyền đặc biệt</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{r._count.users}</Typography>
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <TableActionMenu
                    actions={[
                      {
                        label: r.isSystem ? 'Xem Chi Tiết' : 'Chỉnh Sửa',
                        icon: r.isSystem ? Eye : Pencil,
                        href: `/roles/${r.id}`,
                      },
                      {
                        label: 'Xóa Vai Trò',
                        icon: Trash2,
                        color: 'error',
                        hidden: r.isSystem,
                        onClick: () => handleDelete(r),
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
