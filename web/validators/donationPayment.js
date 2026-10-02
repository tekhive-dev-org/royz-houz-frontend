import { z } from "zod";

export const initializeDonationPaymentSchema = z.object({
  campaignSlug: z.string().trim().min(1).max(160),
  donorName: z.string().trim().min(1).max(160),
  donorEmail: z.string().trim().email().max(254),
  donorPhone: z.string().trim().max(50).optional().nullable(),
  amount: z.coerce.number().positive().min(100),
  currency: z.string().trim().max(3).optional().default("NGN"),
  frequency: z.enum(["one-time", "monthly", "sponsor"]).optional().default("one-time"),
});

export const verifyDonationPaymentSchema = z.object({
  reference: z.string().trim().regex(/^RH-DON-[A-Z0-9-]+$/),
});
