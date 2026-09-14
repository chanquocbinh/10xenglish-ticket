import { create } from 'zustand';

export type ProjectScope = 'ALL' | 'LMS' | 'CRM';

interface ProjectState {
  activeProject: ProjectScope;
  setActiveProject: (project: ProjectScope) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProject: 'ALL',
  setActiveProject: (project) => {
    // Lưu vào document cookie để Next.js SSR đọc được
    if (typeof document !== 'undefined') {
      document.cookie = `active_project=${project}; path=/; max-age=31536000; SameSite=Lax`;
    }
    set({ activeProject: project });
  },
}));
