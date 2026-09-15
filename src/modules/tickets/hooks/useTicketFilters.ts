'use client';

import { useMemo, useState } from 'react';
import type { TicketWithDetails } from '@/modules/tickets/tickets.types';

/**
 * State bộ lọc danh sách ticket: tìm kiếm theo tiêu đề/mã #TK,
 * lọc theo mức độ nghiêm trọng và trạng thái.
 */
export function useTicketFilters(tickets: TicketWithDetails[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) => {
        const matchSearch =
          searchTerm === '' ||
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `#tk-${t.ticketNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSeverity = severityFilter === '' || t.severity === severityFilter;
        const matchStatus = statusFilter === '' || t.status === statusFilter;
        return matchSearch && matchSeverity && matchStatus;
      }),
    [tickets, searchTerm, severityFilter, statusFilter],
  );

  return {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    filteredTickets,
  };
}
