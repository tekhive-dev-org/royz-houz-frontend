import { z } from "zod";

const boundedHttpsUrl = z.string().url().max(2048).refine((value) => value.startsWith("https://"));

export const joinApplicationSchema = z.object({
  fullName: z.string().trim().min(1).max(160),
  stageName: z.string().trim().max(160).optional().nullable(),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(3).max(50),
  dateOfBirth: z.string().date().optional().nullable(),
  stateRegion: z.string().trim().max(160).optional().nullable(),
  talentCategory: z.string().trim().min(1).max(100),
  customTalentCategory: z.string().trim().max(100).optional().nullable(),
  experienceLevel: z.string().trim().max(100).optional().nullable(),
  yearsOfExperience: z.string().trim().max(100).optional().nullable(),
  shortBio: z.string().trim().min(1).max(500),
  genresSpecialties: z.string().trim().max(500).optional().nullable(),
  socialProfiles: z
    .array(
      z.object({
        id: z.string().max(100).optional(),
        platform: z.string().trim().min(1).max(64),
        url: boundedHttpsUrl,
      })
    )
    .max(10),
  portfolioUrls: z.array(boundedHttpsUrl).max(10),
  availability: z
    .object({
      interestedInBookings: z.string().max(100).optional(),
      opportunities: z.array(z.string().min(1).max(100)).max(10).optional(),
      generalAvailability: z.string().max(100).optional(),
      preferredEngagement: z.string().max(100).optional(),
      workLocations: z.array(z.string().min(1).max(100)).max(10).optional(),
    })
    .strict(),
  additionalDetails: z
    .object({
      languages: z.string().max(500).optional(),
      equipmentResources: z.string().max(1000).optional(),
      achievements: z.array(z.string().min(1).max(500)).max(10).optional(),
      references: z.string().max(1000).optional(),
    })
    .strict(),
  confirmedAccuracy: z.literal(true),
});
