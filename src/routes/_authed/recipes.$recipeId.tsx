import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditRecipeDialog } from "@/features/recipes/components/edit-recipe-dialog";
import { RecipeImage, RecipeMeta } from "@/features/recipes/components/recipe-meta";
import { recipeQuery, recipesQuery, useDeleteRecipe } from "@/features/recipes/queries";
import type { Recipe } from "@/features/recipes/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/recipes/$recipeId")({
  loader: async ({ context: { queryClient }, params: { recipeId } }) => {
    // Seed from the list cache when we came from the home page.
    const cached = queryClient.getQueryData(recipesQuery.queryKey)?.find((r) => r.id === recipeId);
    if (cached) queryClient.setQueryData(recipeQuery(recipeId).queryKey, cached);
    const recipe = await queryClient.ensureQueryData(recipeQuery(recipeId));
    if (!recipe) throw notFound();
  },
  pendingComponent: DetailSkeleton,
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipeId } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(recipeQuery(recipeId));
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  // The loader 404s missing recipes, so this only happens mid-delete.
  if (!recipe) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 pt-4 pb-16">
      <div className="flex items-center justify-between gap-2">
        <Link to="/" className={buttonVariants({ variant: "ghost", className: "-ml-2" })}>
          <ArrowLeftIcon data-icon="inline-start" /> All recipes
        </Link>
        <div className="flex gap-1">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilIcon data-icon="inline-start" /> Edit
          </Button>
          <DeleteButton recipe={recipe} />
        </div>
      </div>

      <article className="mt-4 overflow-hidden rounded-3xl border bg-card shadow-sm">
        <RecipeImage recipe={recipe} className="h-56 sm:h-80" />
        <div className="space-y-4 p-5 sm:p-8">
          <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-4xl">
            {recipe.title}
          </h1>
          <RecipeMeta recipe={recipe} />
          {recipe.description && (
            <p className="text-pretty text-muted-foreground">{recipe.description}</p>
          )}

          <div className="grid gap-8 pt-2 md:grid-cols-[2fr_3fr]">
            {recipe.ingredients.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase">
                  Ingredients
                </h2>
                <ul className="space-y-1">
                  {recipe.ingredients.map((item, i) => {
                    const key = `i${i}`;
                    return (
                      <li key={key}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1.5 hover:bg-muted/60">
                          <input
                            type="checkbox"
                            checked={done.has(key)}
                            onChange={() => toggle(key)}
                            className="mt-1 size-4 shrink-0 accent-primary"
                          />
                          <span
                            className={cn(done.has(key) && "text-muted-foreground line-through")}
                          >
                            {item}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
            {recipe.steps.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase">
                  Steps
                </h2>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => {
                    const key = `s${i}`;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          aria-pressed={done.has(key)}
                          className="flex w-full items-start gap-3 rounded-lg p-1.5 text-left hover:bg-muted/60"
                        >
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
                              done.has(key) && "bg-muted text-muted-foreground",
                            )}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={cn(
                              "pt-0.5",
                              done.has(key) && "text-muted-foreground line-through",
                            )}
                          >
                            {step}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </div>

          {recipe.sourceText && (
            <details className="rounded-xl border p-4 text-sm">
              <summary className="cursor-pointer font-medium">Original text</summary>
              <pre className="mt-3 font-sans whitespace-pre-wrap text-muted-foreground">
                {recipe.sourceText}
              </pre>
            </details>
          )}
        </div>
      </article>

      <EditRecipeDialog recipe={recipe} open={editing} onOpenChange={setEditing} />
    </main>
  );
}

function DeleteButton({ recipe }: { recipe: Recipe }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const del = useDeleteRecipe();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" className="text-destructive" onClick={() => setOpen(true)}>
        <Trash2Icon data-icon="inline-start" /> Delete
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{recipe.title}”?</AlertDialogTitle>
            <AlertDialogDescription>This removes the recipe for good.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={del.isPending}
              onClick={() =>
                del.mutate(recipe, {
                  onSuccess: async () => {
                    toast.success("Recipe deleted");
                    await navigate({ to: "/" });
                    queryClient.removeQueries({ queryKey: recipeQuery(recipe.id).queryKey });
                  },
                  onError: (err) =>
                    toast.error("Couldn't delete the recipe", { description: err.message }),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-4 pt-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-4 h-[32rem] rounded-3xl" />
    </main>
  );
}
