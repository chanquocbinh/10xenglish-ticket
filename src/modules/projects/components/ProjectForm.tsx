'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createProjectAction, updateProjectAction } from '../projects.actions';
import type { ProjectDetail } from '../projects.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { ArrowLeft } from 'lucide';

export function ProjectForm({
  mode,
  project,
}: {
  mode: 'create' | 'edit';
  project?: ProjectDetail;
}) {
  const router = useRouter();
  const [code, setCode] = useState(project?.code ?? '');
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [isActive, setIsActive] = useState(project?.isActive ?? true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res =
      mode === 'create'
        ? await createProjectAction({ code: code.toUpperCase().trim(), name, description })
        : await updateProjectAction({
            projectId: project!.id,
            name,
            description,
            isActive,
          });

    setIsSubmitting(false);
    if (res.success) {
      router.push('/admin/projects');
      router.refresh();
    } else {
      setErrorMessage(res.error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton component={Link} href="/admin/projects" size="small">
              <MorphIcon icon={ArrowLeft} size={18} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {mode === 'create' ? 'Tạo Dự Án Mới' : `Cấu Hình Dự Án: ${project?.name}`}
            </Typography>
          </Box>
          <Button component={Link} href="/admin/projects" color="inherit" size="small">
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Card>
        <CardContent
          sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            label="Mã dự án (viết HOA, VD: PORTAL)"
            required
            size="small"
            value={code}
            disabled={mode === 'edit'}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            helperText="2-16 ký tự, chữ HOA và số, bắt đầu bằng chữ. Không sửa được sau khi tạo."
          />

          <TextField
            label="Tên dự án"
            required
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Mô tả"
            multiline
            minRows={3}
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {mode === 'edit' && (
            <FormControlLabel
              control={
                <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              }
              label="Dự án đang hoạt động"
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <AppButton
              type="submit"
              size="small"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {mode === 'create' ? 'Tạo Dự Án' : 'Lưu Thay Đổi'}
            </AppButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
