import { z } from "zod";

export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  servings: z.string().optional(),
  totalTime: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  /** The photo: a data URL for an uploaded photo (see image.ts), or an external link. */
  imageUrl: z.string().optional(),
  sourceText: z.string().optional(),
  /** Epoch millis. */
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

/** The editable part of a recipe — everything the user controls. */
export type RecipeInput = Omit<Recipe, "id" | "createdAt" | "updatedAt">;
