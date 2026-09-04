import { z } from "zod";

export const bookingStatusSchema = z.enum(["new", "reviewing", "contacted", "confirmed", "declined", "cancelled", "archived"]);
export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().trim().max(160).optional(),
  status: bookingStatusSchema.optional(),
});
export const bookingUpdateSchema = z.object({
  id: z.string().uuid(),
  status: bookingStatusSchema.optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  internalNotes: z.string().trim().max(5000).nullable().optional(),
}).refine((value) => value.status !== undefined || value.assignedTo !== undefined || value.internalNotes !== undefined, { message: "Provide at least one booking update." });
