import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import { SprintGuardModal } from '@/components/tasks/SprintGuardModal';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Lấy danh sách project và task cho modal toàn cục
  const projects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
  });

  const currentTasks = await prisma.task.findMany({
    where: { sprint: { isCurrent: true } },
    select: {
      id: true,
      title: true,
      storyPoints: true,
      project: { select: { code: true } },
    },
    take: 10,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 antialiased">
      <Sidebar currentUser={currentUser} />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
          {children}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CreateTicketModal projects={projects} />
      <SprintGuardModal currentTasks={currentTasks} projects={projects} />
    </div>
  );
}
