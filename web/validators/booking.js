import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid event date.")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Enter a valid event date.");

export const bookingRequestSchema = z.object({
  submissionKey: z.string().uuid(),
  talentId: z.string().uuid(),
  talentSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  talentName: z.string().trim().min(1).max(200),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().min(3).max(50),
  eventType: z.string().trim().min(1).max(160),
  eventDate: isoDateSchema,
  eventLocation: z.string().trim().min(1).max(300),
  eventDescription: z.string().trim().min(1).max(3000),
  budget: z.string().trim().max(100).nullable().optional(),
  agreedToTerms: z.literal(true),
});
