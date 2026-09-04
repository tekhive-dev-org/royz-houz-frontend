import { z } from "zod";

export const workflowStatusSchema = z.enum(["new", "reviewing", "contacted", "resolved", "archived"]);

export const submissionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().trim().max(160).optional(),
  status: workflowStatusSchema.optional(),
  assignedTo: z.string().uuid().optional(),
});

export const submissionUpdateSchema = z.object({
  id: z.string().uuid(),
  status: workflowStatusSchema.optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});
