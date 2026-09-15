'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, runAction } from '@/core/server/action';
import {
  addCommentSchema,
  createTicketSchema,
  updateTicketStatusSchema,
  type CreateTicketPayload,
} from '@/modules/tickets/tickets.schema';
import * as ticketsService from '@/modules/tickets/tickets.service';
import type { TicketStatus } from '@/modules/tickets/tickets.types';

export async function createTicketAction(data: CreateTicketPayload) {
  return runAction(async () => {
    const actor = await requirePermission('tickets.create');
    const ticket = await ticketsService.createTicket(actor, createTicketSchema.parse(data));

    revalidatePath('/tickets');
    revalidatePath('/');
    return ticket;
  });
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: TicketStatus,
  note?: string,
) {
  return runAction(async () => {
    const actor = await requirePermission('tickets.update');
    const ticket = await ticketsService.updateTicketStatus(
      actor,
      updateTicketStatusSchema.parse({ ticketId, status, note }),
    );

    revalidatePath('/tickets');
    revalidatePath('/approval');
    revalidatePath('/');
    return ticket;
  });
}

export async function addCommentAction(
  ticketId: string,
  content: string,
  attachments: string[] = [],
) {
  return runAction(async () => {
    const actor = await requirePermission('tickets.comment');
    const comment = await ticketsService.addComment(
      actor,
      addCommentSchema.parse({ ticketId, content, attachments }),
    );

    revalidatePath('/tickets');
    return comment;
  });
}
