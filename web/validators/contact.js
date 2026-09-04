import { z } from "zod";

export const contactSubmissionSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional().nullable(),
  countryCode: z.string().regex(/^[A-Z]{2}$/).optional().nullable(),
  reason: z.string().trim().max(160).optional().nullable(),
  message: z.string().trim().min(1).max(600),
});
