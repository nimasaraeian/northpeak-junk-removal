import { z } from "zod";

export const assistantActionKeySchema = z.enum([
  "estimate",
  "services",
  "serviceArea",
  "contact",
  "howItWorks",
  "about",
  "locations",
]);

export const assistantResponseSchema = z.object({
  message: z.string().min(1).max(4000),
  actions: z.array(assistantActionKeySchema).max(3),
});

export type ParsedAssistantResponse = z.infer<typeof assistantResponseSchema>;
