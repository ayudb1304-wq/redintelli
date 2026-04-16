import { z } from "zod/v4";

export const addFeedRequestSchema = z.object({
  subreddit_id: z
    .string()
    .min(1, "Subreddit is required")
    .max(50, "Invalid subreddit name"),
  keywords: z
    .array(z.string().max(50))
    .min(1, "At least one keyword is required")
    .max(10, "Maximum 10 keywords"),
  min_intent_score: z.number().min(0).max(100).default(0),
  notify_email: z.boolean().default(true),
  notify_digest: z.boolean().default(true),
});

export type AddFeedRequest = z.infer<typeof addFeedRequestSchema>;
