import { z } from 'zod';

export const createTicketSchema = z.object({
  projectId: z.string().min(1, 'Vui lòng chọn Dự án (LMS hoặc CRM)'),
  title: z.string().min(6, 'Tiêu đề lỗi tối thiểu 6 ký tự').max(200),
  submodule: z.string().min(1, 'Vui lòng chọn phân hệ con'),
  affectedRole: z.string().min(1, 'Vui lòng chọn tài khoản gặp lỗi'),
  severity: z.enum(['BLOCKER', 'HIGH', 'MEDIUM', 'LOW']),
  description: z.string().min(10, 'Vui lòng mô tả ít nhất 10 ký tự về các bước tái hiện lỗi'),
  evidenceUrls: z.array(z.string()).optional().default([]),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'APPROVED', 'CLOSED', 'REJECTED']),
  note: z.string().optional(),
});

export const addCommentSchema = z.object({
  ticketId: z.string(),
  content: z.string().min(1, 'Nội dung bình luận không được để trống'),
  attachments: z.array(z.string()).optional().default([]),
});
