import { z } from "zod";

export const newsletterListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  status: z.enum(["subscribed", "unsubscribed"]).optional(),
});

export const newsletterUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["subscribed", "unsubscribed"]),
});
