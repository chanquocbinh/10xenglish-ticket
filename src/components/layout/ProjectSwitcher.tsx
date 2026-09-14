'use client';

import { useProjectStore, ProjectScope } from '@/stores/useProjectStore';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';

export function ProjectSwitcher() {
  const { activeProject, setActiveProject } = useProjectStore();
  const router = useRouter();

  const handleChange = (e: SelectChangeEvent<ProjectScope>) => {
    const val = e.target.value as ProjectScope;
    setActiveProject(val);
    router.refresh();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
        <LayersOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline' }, letterSpacing: 0.5 }}
        >
          DỰ ÁN:
        </Typography>
      </Box>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={activeProject}
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
          <MenuItem value="ALL" sx={{ fontSize: '0.8125rem' }}>
            📁 Tất cả dự án (Tổng hợp)
          </MenuItem>
          <MenuItem value="LMS" sx={{ fontSize: '0.8125rem' }}>
            🎓 Project 1: LMS Học Vụ
          </MenuItem>
          <MenuItem value="CRM" sx={{ fontSize: '0.8125rem' }}>
            💼 Project 2: CRM Tuyển Sinh & Kế Toán
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
