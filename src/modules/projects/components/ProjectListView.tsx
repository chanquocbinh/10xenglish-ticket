'use client';

import Link from 'next/link';
import type { ProjectListItem } from '../projects.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
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
import { Plus, Pencil } from 'lucide';

export function ProjectListView({ projects }: { projects: ProjectListItem[] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Quản Lý Dự Án
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Tạo và cấu hình các workspace dự án của tổ chức
            </Typography>
          </Box>
          <AppButton
            component={Link}
            href="/admin/projects/new"
            size="small"
            startIcon={<MorphIcon icon={Plus} size={18} />}
          >
            Tạo Project Mới
          </AppButton>
        </CardContent>
      </Card>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tên dự án</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thành viên</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  Chưa có dự án nào
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {p.name}
                    </Typography>
                    {p.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {p.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{p.memberCount}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                      color={p.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <AppButton
                      component={Link}
                      href={`/admin/projects/${p.id}`}
                      size="small"
                      variant="text"
                      startIcon={<MorphIcon icon={Pencil} size={14} />}
                    >
                      Cấu hình
                    </AppButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
