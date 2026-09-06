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

export const inviteVerifySchema = z.object({
  token: z.string().trim().min(10).max(255),
});

export const inviteAcceptSchema = z.object({
  token: z.string().trim().min(10).max(255),
  displayName: z.string().trim().min(2, "Name must be at least 2 characters.").max(160, "Name cannot exceed 160 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().max(254),
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
