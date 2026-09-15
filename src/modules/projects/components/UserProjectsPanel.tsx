'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignUserProjectsAction } from '../projects.actions';
import type { AccessibleProject } from '../projects.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { AppButton } from '@/shared/ui/AppButton';

export function UserProjectsPanel({
  userId,
  allProjects,
  memberProjectIds,
  defaultProjectId,
}: {
  userId: string;
  allProjects: AccessibleProject[];
  memberProjectIds: string[];
  defaultProjectId: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<AccessibleProject[]>(
    allProjects.filter((p) => memberProjectIds.includes(p.id)),
  );
  const [defaultId, setDefaultId] = useState<string>(
    defaultProjectId && memberProjectIds.includes(defaultProjectId) ? defaultProjectId : '',
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedIds = selected.map((p) => p.id);

  const handleSave = async () => {
    setMessage(null);
    setIsSaving(true);
    const nextDefault = defaultId && selectedIds.includes(defaultId) ? defaultId : null;
    const res = await assignUserProjectsAction(userId, selectedIds, nextDefault);
    setIsSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Đã cập nhật dự án tham gia.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error });
    }
  };

  return (
    <Card>
      <CardContent
        sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Dự Án Tham Gia
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Gán người dùng vào các workspace và chọn dự án mặc định khi đăng nhập.
          </Typography>
        </Box>

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        <Autocomplete
          multiple
          options={allProjects}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          getOptionLabel={(p) => `${p.code} — ${p.name}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderTags={(value, getTagProps) =>
            value.map((p, index) => (
              <Chip {...getTagProps({ index })} key={p.id} size="small" label={p.code} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} size="small" label="Dự án" placeholder="Thêm dự án" />
          )}
        />

        <FormControl fullWidth size="small">
          <InputLabel id="default-project-label">Dự án mặc định</InputLabel>
          <Select
            labelId="default-project-label"
            label="Dự án mặc định"
            value={defaultId}
            onChange={(e) => setDefaultId(e.target.value)}
          >
            <MenuItem value="">
              <em>Không đặt (dùng dự án đầu tiên)</em>
            </MenuItem>
            {selected.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.code} — {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton
            size="small"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Lưu Dự Án
          </AppButton>
        </Box>
      </CardContent>
    </Card>
  );
}
