'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, runAction } from '@/core/server/action';
import { signOffSchema, type SignOffInput } from './approval.schema';
import * as approvalService from './approval.service';

export async function signOffAction(input: SignOffInput) {
  return runAction(async () => {
    const data = signOffSchema.parse(input);
    const actor = await requirePermission(
      data.targetType === 'TICKET' ? 'tickets.approve' : 'tasks.approve',
    );
    await approvalService.signOff(actor, data);

    revalidatePath('/approval');
    revalidatePath('/tasks');
    revalidatePath('/tickets');
    revalidatePath('/');
  });
}
