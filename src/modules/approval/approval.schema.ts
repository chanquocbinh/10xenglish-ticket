import { z } from 'zod';

export const signOffSchema = z.object({
  targetType: z.enum(['TICKET', 'TASK']),
  targetId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});

export type SignOffInput = z.input<typeof signOffSchema>;
export type SignOffData = z.output<typeof signOffSchema>;
