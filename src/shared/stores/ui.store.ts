import { create } from 'zustand';

/** State UI toàn cục: sidebar + các modal dùng chung ở nhiều trang. */
interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  ticketModalOpen: boolean;
  setTicketModalOpen: (open: boolean) => void;
  sprintGuardModalOpen: boolean;
  setSprintGuardModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  ticketModalOpen: false,
  setTicketModalOpen: (open) => set({ ticketModalOpen: open }),
  sprintGuardModalOpen: false,
  setSprintGuardModalOpen: (open) => set({ sprintGuardModalOpen: open }),
}));
