import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  ticketModalOpen: boolean;
  setTicketModalOpen: (open: boolean) => void;
  taskModalOpen: boolean;
  setTaskModalOpen: (open: boolean) => void;
  sprintGuardModalOpen: boolean;
  setSprintGuardModalOpen: (open: boolean) => void;
  userModalOpen: boolean;
  setUserModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  ticketModalOpen: false,
  setTicketModalOpen: (open) => set({ ticketModalOpen: open }),
  taskModalOpen: false,
  setTaskModalOpen: (open) => set({ taskModalOpen: open }),
  sprintGuardModalOpen: false,
  setSprintGuardModalOpen: (open) => set({ sprintGuardModalOpen: open }),
  userModalOpen: false,
  setUserModalOpen: (open) => set({ userModalOpen: open }),
}));
