'use client';

import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Layers } from 'lucide';
import type { AccessibleProject } from '@/modules/projects/projects.types';

/** Các segment scoped được giữ lại khi đổi dự án. */
const SCOPED_SUBPATHS: Record<string, true> = { tickets: true, tasks: true, sprints: true };

export function ProjectSwitcher({ projects }: { projects: AccessibleProject[] }) {
  const pathname = usePathname();
  const router = useRouter();

  if (projects.length === 0) return null;

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const activeProject = projects.find((p) => p.code === firstSegment) ?? projects[0];

  const handleChange = (e: SelectChangeEvent<string>) => {
    const nextCode = e.target.value;
    // Giữ lại subpath scoped (tickets/tasks/sprints) khi chuyển dự án.
    const sub = firstSegment === activeProject.code && SCOPED_SUBPATHS[segments[1]]
      ? `/${segments[1]}`
      : '';
    router.push(`/${nextCode}${sub}`);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <MorphIcon icon={Layers} size={18} />
        </Box>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline' }, letterSpacing: 0.5 }}
        >
          DỰ ÁN:
        </Typography>
      </Box>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={activeProject.code}
          onChange={handleChange}
          sx={{
            bgcolor: 'background.paper',
            fontSize: '0.8125rem',
            fontWeight: 600,
            '& .MuiSelect-select': {
              py: 0.75,
              px: 1.5,
            },
          }}
        >
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.code} sx={{ fontSize: '0.8125rem' }}>
              {p.code} — {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
