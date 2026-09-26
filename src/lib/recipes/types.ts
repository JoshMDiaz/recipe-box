export type Recipe = {
  id: string;
  title: string;
  description?: string | undefined;
  servings?: string | undefined;
  totalTime?: string | undefined;
  ingredients: string[];
  steps: string[];
  tags: string[];
  imageUrl?: string | undefined;
  sourceText?: string | undefined;
  createdAt: number;
};

export type NewRecipe = Omit<Recipe, "id" | "createdAt">;
