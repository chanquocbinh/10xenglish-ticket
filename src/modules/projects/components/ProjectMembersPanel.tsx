'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignProjectMembersAction } from '../projects.actions';
import type { ProjectDetail } from '../projects.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { AppButton } from '@/shared/ui/AppButton';

interface UserOption {
  id: string;
  fullName: string;
  username: string;
}

export function ProjectMembersPanel({
  project,
  users,
}: {
  project: ProjectDetail;
  users: UserOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<UserOption[]>(
    users.filter((u) => project.members.some((m) => m.userId === u.id)),
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setMessage(null);
    setIsSaving(true);
    const res = await assignProjectMembersAction(
      project.id,
      selected.map((u) => u.id),
    );
    setIsSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Đã cập nhật thành viên dự án.' });
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
            Thành Viên Dự Án
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Chọn những người dùng được phép truy cập workspace này.
          </Typography>
        </Box>

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        <Autocomplete
          multiple
          options={users}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          getOptionLabel={(u) => `${u.fullName} (@${u.username})`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderTags={(value, getTagProps) =>
            value.map((u, index) => (
              <Chip
                {...getTagProps({ index })}
                key={u.id}
                size="small"
                label={u.fullName}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} size="small" label="Thành viên" placeholder="Thêm người dùng" />
          )}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton
            size="small"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Lưu Thành Viên
          </AppButton>
        </Box>
      </CardContent>
    </Card>
  );
}
