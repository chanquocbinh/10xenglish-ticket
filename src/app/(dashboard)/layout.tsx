import { requirePageUser } from '@/core/server/page';
import { Sidebar } from '@/shared/layout/Sidebar';
import { Header } from '@/shared/layout/Header';
import { listAccessibleProjects } from '@/modules/projects/projects.service';
import { listCurrentSprintTaskOptions } from '@/modules/tasks/tasks.service';
import { CreateTicketModal } from '@/modules/tickets/components/CreateTicketModal';
import { SprintGuardModal } from '@/modules/tasks/components/SprintGuardModal';
import { Toaster } from '@/shared/ui/Toaster';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requirePageUser();

  // Lấy danh sách project và task cho modal toàn cục
  const [accessibleProjects, currentTasks] = await Promise.all([
    listAccessibleProjects(currentUser),
    listCurrentSprintTaskOptions(),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 antialiased">
      <Sidebar currentUser={currentUser} projects={accessibleProjects} />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <Header projects={accessibleProjects} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
          {children}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CreateTicketModal projects={accessibleProjects} />
      <SprintGuardModal currentTasks={currentTasks} projects={accessibleProjects} />
      <Toaster />
    </div>
  );
}
