import { findRecentAuditLogs } from '@/core/audit/audit.service';
import * as dashboardRepository from './dashboard.repository';
import type { DashboardData } from './dashboard.types';

/**
 * Số liệu trang tổng quan cho một dự án.
 * Các truy vấn độc lập nên chạy song song để giảm thời gian render.
 */
export async function getDashboardData(projectId: string): Promise<DashboardData> {
  const scopeWhere = { projectId };

  const [
    pendingBugsCount,
    blockerBugsCount,
    pendingApprovalCount,
    totalTasks,
    doneTasks,
    currentSprint,
    recentTickets,
    pendingApprovalTasks,
    recentAuditLogs,
  ] = await Promise.all([
    dashboardRepository.countOpenTickets(scopeWhere),
    dashboardRepository.countOpenBlockerTickets(scopeWhere),
    dashboardRepository.countPendingApprovalTasks(scopeWhere),
    dashboardRepository.countTasks(scopeWhere),
    dashboardRepository.countDoneTasks(scopeWhere),
    dashboardRepository.findCurrentSprint(),
    dashboardRepository.findRecentTickets(scopeWhere),
    dashboardRepository.findPendingApprovalTasks(scopeWhere),
    findRecentAuditLogs({ take: 4 }),
  ]);

  return {
    pendingBugsCount,
    blockerBugsCount,
    pendingApprovalCount,
    totalTasks,
    doneTasks,
    progressPercent: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    currentSprint,
    recentTickets,
    pendingApprovalTasks,
    recentAuditLogs,
  };
}
