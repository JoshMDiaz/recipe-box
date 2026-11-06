import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpenIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { roundButton } from "@/components/grouped";
import { PageHeader } from "@/components/page-header";
import { UserMenu } from "@/features/auth/user-menu";
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

const shell =
  "mx-auto min-h-dvh w-full max-w-md pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),32px)] md:max-w-6xl";

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
  const filtered = Boolean(q || tag);

  return (
    <main className={shell}>
      <div className="px-4">
        <PageHeader
          title="Recipe Box"
          actions={
            <>
              <button
                type="button"
                onClick={() => setAdding(true)}
                aria-label="Add recipe"
                className={roundButton}
              >
                <PlusIcon className="size-5" strokeWidth={2.5} />
              </button>
              <UserMenu />
            </>
          }
        />

        {recipes.length > 0 && (
          <section className="mt-4 px-1" aria-live="polite">
            <p className="text-[15px] text-label-2">
              {filtered
                ? `Showing ${visible.length} of ${recipes.length}`
                : allTags.length > 0
                  ? `Across ${allTags.length} ${allTags.length === 1 ? "tag" : "tags"}`
                  : "In your box"}
            </p>
            <p className="font-rounded text-[52px] leading-none font-bold tracking-tight tabular-nums">
              {filtered ? visible.length : recipes.length}
              <span className="text-[26px] text-label-2">
                {" "}
                {(filtered ? visible.length : recipes.length) === 1 ? "recipe" : "recipes"}
              </span>
            </p>
          </section>
        )}
      </div>

      {recipes.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} />
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 px-4">
            <div className="relative md:max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-label-2" />
              <input
                type="search"
                value={q}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search recipes or ingredients"
                aria-label="Search recipes"
                className="h-10 w-full rounded-xl bg-fill pr-3 pl-9 text-[17px] outline-none placeholder:text-label-2 focus:ring-2 focus:ring-blue/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setSearch({ q: undefined })}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-label-3 text-surface"
                >
                  <XIcon className="size-3" strokeWidth={3} />
                </button>
              )}
            </div>
            {allTags.length > 0 && (
              <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
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

          <section className="mt-4" aria-label="Recipes">
            {visible.length === 0 ? (
              <div className="mx-4 rounded-[26px] border-2 border-dashed border-separator px-6 py-14 text-center">
                <p className="text-[17px] font-semibold">No recipes match</p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-[15px] font-medium text-blue active:opacity-50"
                  onClick={() => setSearch({ q: undefined, tag: undefined })}
                >
                  <XIcon className="size-4" /> Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="md:hidden">
                  {/* Remount when the filtered set changes so the carousel resets to the start. */}
                  <RecipeCarousel key={visible.map((r) => r.id).join()} recipes={visible} />
                </div>
                <div className="hidden grid-cols-2 gap-5 px-4 pb-4 md:grid lg:grid-cols-3">
                  {visible.map((r, i) => (
                    <RecipeCard
                      key={r.id}
                      recipe={r}
                      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                      className="h-[34rem] hover:-translate-y-0.5 active:scale-[0.99]"
                    />
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
        "h-8 shrink-0 rounded-full px-3.5 text-[15px] font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:outline-none active:scale-95",
        active ? "bg-blue text-white" : "bg-surface text-label",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const seed = useSeedRecipes();
  return (
    <div className="mx-4 mt-6 flex flex-col items-center rounded-[26px] border-2 border-dashed border-separator px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#ff9f0a,#ff375f)] text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5)]">
        <BookOpenIcon className="size-7" aria-hidden />
      </span>
      <h2 className="mt-4 text-[20px] font-semibold tracking-tight">Your recipe box is empty</h2>
      <p className="mt-1 max-w-sm text-[15px] text-label-2">
        Paste a recipe from anywhere and we'll pull out the ingredients and steps.
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue text-[17px] font-semibold text-white transition-transform active:scale-[0.98]"
        >
          <PlusIcon className="size-5" strokeWidth={2.5} /> Add Your First Recipe
        </button>
        <button
          type="button"
          disabled={seed.isPending}
          onClick={() =>
            seed.mutate(SEED_RECIPES, {
              onError: (err) => toast.error("Couldn't load samples", { description: err.message }),
            })
          }
          className="flex h-12 items-center justify-center rounded-2xl bg-fill text-[17px] font-semibold text-blue transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          Load Sample Recipes
        </button>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <main className={cn(shell, "px-4")}>
      <PageHeader title="Recipe Box" />
      <div className="mt-4 h-[74px] w-48 animate-pulse rounded-2xl bg-fill" />
      <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-fill md:max-w-sm" />
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[34rem] animate-pulse rounded-[26px] bg-fill",
              i > 0 && "hidden md:block",
            )}
          />
        ))}
      </div>
    </main>
  );
}
