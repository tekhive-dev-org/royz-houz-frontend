import { z } from "zod";

export const profileListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  roleId: z.string().uuid().optional(),
});

export const profileStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "suspended"]),
  confirm: z.literal(true, { errorMap: () => ({ message: "Explicit confirmation is required." }) }),
});

export const roleAssignmentSchema = z.object({
  userId: z.string().uuid(),
  roleIds: z.array(z.string().uuid()).min(1).max(20),
  confirm: z.literal(true, { errorMap: () => ({ message: "Explicit confirmation is required." }) }),
});

export const roleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).nullable().optional(),
  permissionIds: z.array(z.string().uuid()).max(200),
  confirm: z.literal(true, { errorMap: () => ({ message: "Explicit confirmation is required." }) }),
});

export const inviteCreateSchema = z.object({
  email: z.string().trim().email().max(254),
  roleId: z.string().uuid(),
});

export const inviteRevokeSchema = z.object({
  id: z.string().uuid(),
  confirm: z.literal(true, { errorMap: () => ({ message: "Explicit confirmation is required." }) }),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().trim().max(150).optional(),
  actor: z.string().uuid().optional(),
  entityType: z.string().trim().max(80).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});
