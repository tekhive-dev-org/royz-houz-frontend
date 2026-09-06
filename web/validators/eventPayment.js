import { z } from "zod";

export const initializeEventPaymentSchema = z.object({
  eventSlug: z.string().trim().min(1).max(160),
  tierId: z.string().trim().min(1).max(160),
  quantity: z.number().int().min(1).max(10),
  customer: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(3).max(50),
    organization: z.string().trim().max(160).optional(),
    dietary: z.string().trim().max(100).optional(),
    subscribeNews: z.boolean().optional(),
  }).strict(),
});

export const verifyEventPaymentSchema = z.object({
  reference: z.string().trim().regex(/^RH-TKT-[A-Z0-9-]+$/),
});
