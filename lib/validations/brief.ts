import { z } from "zod/v4";

export const generateBriefRequestSchema = z.object({
  subreddit_id: z
    .string()
    .min(1, "Subreddit is required")
    .max(50, "Invalid subreddit name"),
  force_refresh: z.boolean().default(false),
});

export type GenerateBriefRequest = z.infer<typeof generateBriefRequestSchema>;
