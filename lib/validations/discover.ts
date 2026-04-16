import { z } from "zod/v4";

export const discoverRequestSchema = z.object({
  product_description: z
    .string()
    .min(20, "Product description must be at least 20 characters")
    .max(2000, "Product description must be under 2000 characters"),
  target_audience: z
    .string()
    .max(500, "Target audience must be under 500 characters")
    .optional(),
  min_subscribers: z.number().min(100).default(1000),
  max_results: z.number().min(5).max(30).default(15),
});

export type DiscoverRequest = z.infer<typeof discoverRequestSchema>;
