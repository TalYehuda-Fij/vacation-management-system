import { z } from 'zod';

export const createRequestSchema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    reason: z.string().optional(),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: 'end_date must be >= start_date',
    path: ['end_date'],
  });

export type CreateRequestDto = z.infer<typeof createRequestSchema>;

export const listQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('desc'),
});

export type ListQueryDto = z.infer<typeof listQuerySchema>;

export const approveSchema = z.object({
  comments: z.string().optional(),
});

export const rejectSchema = z.object({
  comments: z.string().trim().min(1, 'comments is required when rejecting'),
});
