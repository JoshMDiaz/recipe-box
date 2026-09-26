import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  seedRecipes,
  updateRecipe,
} from "./api";
import type { Recipe, RecipeInput } from "./types";

export const recipeKeys = {
  all: ["recipes"] as const,
  detail: (id: string) => ["recipes", id] as const,
};

export const recipesQuery = queryOptions({
  queryKey: recipeKeys.all,
  queryFn: listRecipes,
});

export const recipeQuery = (id: string) =>
  queryOptions({
    queryKey: recipeKeys.detail(id),
    queryFn: () => getRecipe(id),
  });

function useInvalidateRecipes() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: recipeKeys.all });
}

export function useCreateRecipe() {
  const invalidate = useInvalidateRecipes();
  return useMutation({
    mutationFn: ({ input, photo }: { input: RecipeInput; photo?: File }) =>
      createRecipe(input, photo),
    onSuccess: invalidate,
  });
}

export function useUpdateRecipe() {
  const invalidate = useInvalidateRecipes();
  return useMutation({
    mutationFn: ({
      recipe,
      input,
      photo,
    }: {
      recipe: Recipe;
      input: RecipeInput;
      photo?: File | null;
    }) => updateRecipe(recipe, input, photo),
    onSuccess: invalidate,
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRecipe,
    // The detail entry is left for the caller to drop once it has navigated
    // away — removing it while the page is mounted would refetch a missing doc.
    onSuccess: () => qc.invalidateQueries({ queryKey: recipeKeys.all, exact: true }),
  });
}

export function useSeedRecipes() {
  const invalidate = useInvalidateRecipes();
  return useMutation({ mutationFn: seedRecipes, onSuccess: invalidate });
}
