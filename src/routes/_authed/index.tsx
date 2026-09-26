import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpenIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AddRecipeDialog } from "@/features/recipes/components/add-recipe-dialog";
import { RecipeCard } from "@/features/recipes/components/recipe-card";
import { RecipeCarousel } from "@/features/recipes/components/recipe-carousel";
import { recipesQuery, useSeedRecipes } from "@/features/recipes/queries";
import { SEED_RECIPES } from "@/features/recipes/seed";
import type { Recipe } from "@/features/recipes/types";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  tag: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_authed/")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(recipesQuery),
  pendingComponent: HomeSkeleton,
  component: Home,
});

function matches(r: Recipe, q: string) {
  const hay = [r.title, r.description, ...r.tags, ...r.ingredients].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

function Home() {
  const { data: recipes } = useSuspenseQuery(recipesQuery);
  const { q = "", tag } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [adding, setAdding] = useState(false);

  const allTags = useMemo(() => [...new Set(recipes.flatMap((r) => r.tags))].sort(), [recipes]);
  const visible = useMemo(
    () => recipes.filter((r) => (!tag || r.tags.includes(tag)) && (!q || matches(r, q))),
    [recipes, q, tag],
  );
  const setSearch = (next: { q?: string; tag?: string }) =>
    void navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });

  return (
    <main className="mx-auto max-w-6xl pb-16">
      <div className="flex items-end justify-between gap-4 px-4 pt-6">
        <div className="min-w-0">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Your recipes
          </h1>
          <p className="text-sm text-muted-foreground">
            {recipes.length} saved
            {visible.length > 1 && <span className="md:hidden"> · swipe to browse</span>}
          </p>
        </div>
        <Button size="lg" className="shrink-0 rounded-full px-4" onClick={() => setAdding(true)}>
          <PlusIcon data-icon="inline-start" /> Add recipe
        </Button>
      </div>

      {recipes.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} />
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 px-4">
            <div className="relative sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={q}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search recipes or ingredients"
                aria-label="Search recipes"
                className="h-10 rounded-full bg-card pl-9"
              />
            </div>
            {allTags.length > 0 && (
              <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1">
                <TagChip active={!tag} onClick={() => setSearch({ tag: undefined })}>
                  All
                </TagChip>
                {allTags.map((t) => (
                  <TagChip
                    key={t}
                    active={tag === t}
                    onClick={() => setSearch({ tag: tag === t ? undefined : t })}
                  >
                    {t}
                  </TagChip>
                ))}
              </div>
            )}
          </div>

          <section className="mt-5" aria-label="Recipes">
            {visible.length === 0 ? (
              <div className="mx-4 rounded-3xl border border-dashed p-10 text-center">
                <p className="text-muted-foreground">No recipes match.</p>
                <Button variant="link" onClick={() => setSearch({ q: undefined, tag: undefined })}>
                  <XIcon data-icon="inline-start" /> Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="md:hidden">
                  {/* Remount when the filtered set changes so the carousel resets to the start. */}
                  <RecipeCarousel key={visible.map((r) => r.id).join()} recipes={visible} />
                </div>
                <div className="hidden grid-cols-2 gap-6 px-4 md:grid lg:grid-cols-3">
                  {visible.map((r) => (
                    <RecipeCard key={r.id} recipe={r} className="h-[34rem]" />
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}

      <AddRecipeDialog open={adding} onOpenChange={setAdding} />
    </main>
  );
}

function TagChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 shrink-0 rounded-full border px-3 text-sm capitalize transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const seed = useSeedRecipes();
  return (
    <div className="mx-4 mt-8 flex flex-col items-center rounded-3xl border border-dashed px-6 py-14 text-center">
      <BookOpenIcon className="size-10 text-primary" aria-hidden />
      <h2 className="mt-4 font-heading text-2xl font-semibold">Your recipe box is empty</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Paste a recipe from anywhere and we'll pull out the ingredients and steps.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button size="lg" className="rounded-full px-4" onClick={onAdd}>
          <PlusIcon data-icon="inline-start" /> Add your first recipe
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full px-4"
          disabled={seed.isPending}
          onClick={() =>
            seed.mutate(SEED_RECIPES, {
              onError: (err) => toast.error("Couldn't load samples", { description: err.message }),
            })
          }
        >
          Load sample recipes
        </Button>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-6 h-10 w-full rounded-full sm:max-w-sm" />
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className={cn("h-[34rem] rounded-3xl", i > 0 && "hidden md:block")} />
        ))}
      </div>
    </main>
  );
}
