import { z } from "zod";
import { paginationSchema, slugSchema } from "./common";

export const publicListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(160).optional(),
  category: slugSchema.optional(),
  featured: z.enum(["true", "false"]).optional(),
});

export const slugQuerySchema = z.object({ slug: slugSchema });
