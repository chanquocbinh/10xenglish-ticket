import { requirePagePermission } from '@/core/server/page';
import { ApprovalView } from '@/modules/approval/components/ApprovalView';
import { getApprovalQueue } from '@/modules/approval/approval.service';

export default async function ApprovalPage() {
  const currentUser = await requirePagePermission('approval.view');
  const { pendingTasks, pendingTickets, auditLogs } = await getApprovalQueue();

  return (
    <ApprovalView
      currentUser={currentUser}
      pendingTasks={pendingTasks}
      pendingTickets={pendingTickets}
      auditLogs={auditLogs}
    />
  );
}
