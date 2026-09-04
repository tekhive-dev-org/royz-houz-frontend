import { z } from "zod";

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(80).optional().default("website"),
});
