import { z } from "zod";

export const testimonialItemSchema = z.object({
  id: z.string().trim().min(1).default(() => `testimonial-${Date.now()}`),
  name: z.string().trim().min(1, "Author name is required").max(160),
  role: z.string().trim().min(1, "Role or location is required").max(160),
  quote: z.string().trim().min(1, "Quote is required").max(2000),
  avatar: z.string().trim().default("/assets/img/talents/blessing.jpg"),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const testimonialsPayloadSchema = z.object({
  badge: z.string().trim().max(100).optional().default("TESTIMONIALS"),
  title: z.string().trim().max(200).optional().default("Impact - Changing Stories"),
  description: z.string().trim().max(500).optional().default("Explore the stories and experiences of members who have connected and found meaningful opportunities."),
  items: z.array(testimonialItemSchema).default([]),
});

export const saveTestimonialItemSchema = z.object({
  item: testimonialItemSchema,
});

export const reorderTestimonialsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
