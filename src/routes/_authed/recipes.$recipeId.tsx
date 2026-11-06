import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Group, headerAction, Row } from "@/components/grouped";
import { ConfirmSheet } from "@/components/sheet";
import { EditRecipeDialog } from "@/features/recipes/components/edit-recipe-dialog";
import { RecipeHero, TagPills } from "@/features/recipes/components/recipe-meta";
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

const shell =
  "mx-auto min-h-dvh w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),32px)] md:max-w-4xl";

function RecipeDetail() {
  const { recipeId } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(recipeQuery(recipeId));
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  /** Uncheck every item in one list ("i" ingredients, "s" steps). */
  const reset = (prefix: string) =>
    setDone((prev) => new Set([...prev].filter((k) => !k.startsWith(prefix))));
  const countDone = (prefix: string) => [...done].filter((k) => k.startsWith(prefix)).length;

  // The loader 404s missing recipes, so this only happens mid-delete.
  if (!recipe) return null;

  const ingredientsDone = countDone("i");
  const stepsDone = countDone("s");

  return (
    <main className={shell}>
      <nav className="flex min-h-11 items-center justify-between gap-2 pt-1">
        <Link
          to="/"
          className="-ml-1.5 flex items-center rounded-md text-[17px] text-blue focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:opacity-50"
        >
          <ChevronLeftIcon className="size-7" strokeWidth={2.25} aria-hidden /> Recipes
        </Link>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md text-[17px] text-blue focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:opacity-50"
        >
          Edit
        </button>
      </nav>

      <article className="mt-2">
        <RecipeHero
          recipe={recipe}
          large
          title={<h1>{recipe.title}</h1>}
          className="aspect-[1.35/1] animate-rise rounded-[26px] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] sm:aspect-auto sm:h-80"
        />

        {(recipe.description || recipe.tags.length > 0) && (
          <div className="mt-4 space-y-3 px-1">
            {recipe.description && (
              <p className="text-[17px] leading-snug text-pretty text-label-2">
                {recipe.description}
              </p>
            )}
            <TagPills tags={recipe.tags} />
          </div>
        )}

        <div className="grid items-start md:grid-cols-[2fr_3fr] md:gap-6">
          {recipe.ingredients.length > 0 && (
            <Group
              header={
                <>
                  Ingredients
                  {ingredientsDone > 0 && (
                    <span className="normal-case">
                      {" "}
                      · {ingredientsDone} of {recipe.ingredients.length}
                    </span>
                  )}
                </>
              }
              action={
                ingredientsDone > 0 && (
                  <button type="button" className={headerAction} onClick={() => reset("i")}>
                    Uncheck all
                  </button>
                )
              }
            >
              <ul className="divide-y divide-separator">
                {recipe.ingredients.map((item, i) => {
                  const key = `i${i}`;
                  const checked = done.has(key);
                  return (
                    <li key={key}>
                      <label className="flex min-h-12 cursor-pointer items-start gap-3 px-4 py-3 active:bg-fill has-focus-visible:bg-fill">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(key)}
                          className="sr-only"
                        />
                        <CheckCircle checked={checked} />
                        <span
                          className={cn(
                            "text-[17px] leading-snug transition-colors",
                            checked && "text-label-3 line-through",
                          )}
                        >
                          {item}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Group>
          )}

          {recipe.steps.length > 0 && (
            <Group
              header={
                <>
                  Steps
                  {stepsDone > 0 && (
                    <span className="normal-case">
                      {" "}
                      · {stepsDone} of {recipe.steps.length}
                    </span>
                  )}
                </>
              }
              action={
                stepsDone > 0 && (
                  <button type="button" className={headerAction} onClick={() => reset("s")}>
                    Uncheck all
                  </button>
                )
              }
            >
              <ol className="divide-y divide-separator">
                {recipe.steps.map((step, i) => {
                  const key = `s${i}`;
                  const checked = done.has(key);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        aria-pressed={checked}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left focus-visible:bg-fill focus-visible:outline-none active:bg-fill"
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full font-rounded text-[15px] font-bold tabular-nums transition-colors",
                            checked ? "bg-green text-white" : "bg-blue text-white",
                          )}
                        >
                          {checked ? (
                            <CheckIcon className="size-4" strokeWidth={3} aria-hidden />
                          ) : (
                            i + 1
                          )}
                        </span>
                        <span
                          className={cn(
                            "pt-0.5 text-[17px] leading-snug transition-colors",
                            checked && "text-label-3 line-through",
                          )}
                        >
                          {step}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Group>
          )}
        </div>

        {recipe.sourceText && (
          <Group>
            <details className="group/details">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[17px] active:bg-fill [&::-webkit-details-marker]:hidden">
                Original Text
                <ChevronRightIcon
                  className="size-5 text-label-3 transition-transform group-open/details:rotate-90"
                  aria-hidden
                />
              </summary>
              <pre className="border-t border-separator px-4 py-3 font-sans text-[15px] whitespace-pre-wrap text-label-2">
                {recipe.sourceText}
              </pre>
            </details>
          </Group>
        )}

        <Group>
          <Row destructive onClick={() => setDeleting(true)}>
            Delete Recipe
          </Row>
        </Group>
      </article>

      <EditRecipeDialog recipe={recipe} open={editing} onOpenChange={setEditing} />
      <DeleteSheet recipe={recipe} open={deleting} onOpenChange={setDeleting} />
    </main>
  );
}

/** The round check from iOS Reminders. */
function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-px flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        checked ? "border-green bg-green text-white" : "border-label-3",
      )}
    >
      {checked && <CheckIcon className="size-3.5" strokeWidth={3.5} />}
    </span>
  );
}

function DeleteSheet({
  recipe,
  open,
  onOpenChange,
}: {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const del = useDeleteRecipe();
  return (
    <ConfirmSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete “${recipe.title}”?`}
      action="Delete Recipe"
      pending={del.isPending}
      onConfirm={() =>
        del.mutate(recipe, {
          onSuccess: async () => {
            toast.success("Recipe deleted");
            await navigate({ to: "/" });
            queryClient.removeQueries({ queryKey: recipeQuery(recipe.id).queryKey });
          },
          onError: (err) => toast.error("Couldn't delete the recipe", { description: err.message }),
        })
      }
    >
      This removes the recipe for good. It can't be undone.
    </ConfirmSheet>
  );
}

function DetailSkeleton() {
  return (
    <main className={shell}>
      <div className="mt-2 h-7 w-28 animate-pulse rounded-lg bg-fill" />
      <div className="mt-3 aspect-[1.35/1] animate-pulse rounded-[26px] bg-fill sm:aspect-auto sm:h-80" />
      <div className="mt-6 h-64 animate-pulse rounded-2xl bg-fill" />
    </main>
  );
}
