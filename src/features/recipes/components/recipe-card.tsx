import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { Recipe } from "../types";
import { RecipeImage, RecipeMeta } from "./recipe-meta";

/** Full recipe on a card — scrolls internally so you can cook straight from the carousel. */
export function RecipeCard({ recipe, className }: { recipe: Recipe; className?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const target = { to: "/recipes/$recipeId", params: { recipeId: recipe.id } } as const;
  const pressedAt = useRef({ x: 0, y: 0 });

  // The whole card opens the recipe. A click handler rather than a link
  // overlay, so the ingredients can still scroll inside the card. Keyboard
  // and screen-reader users get the title link.
  const open = (e: MouseEvent) => {
    // Links handle themselves, and dragging to highlight text isn't a click.
    const moved = Math.hypot(e.clientX - pressedAt.current.x, e.clientY - pressedAt.current.y);
    if ((e.target as Element).closest("a") || moved > 5 || getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) window.open(router.buildLocation(target).href, "_blank");
    else void navigate(target);
  };

  return (
    <article
      onPointerDown={(e) => (pressedAt.current = { x: e.clientX, y: e.clientY })}
      onClick={open}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link to="/recipes/$recipeId" params={{ recipeId: recipe.id }} tabIndex={-1}>
        <RecipeImage recipe={recipe} className="h-44 shrink-0" />
      </Link>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
        <h2 className="font-heading text-2xl leading-tight font-semibold">
          <Link
            to="/recipes/$recipeId"
            params={{ recipeId: recipe.id }}
            className="rounded-sm group-hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {recipe.title}
          </Link>
        </h2>
        <RecipeMeta recipe={recipe} />
        <div className="-mr-2 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 text-sm">
          {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}
          {recipe.ingredients.length > 0 && (
            <section>
              <h3 className="mb-1 text-xs font-semibold tracking-wide text-primary uppercase">
                Ingredients
              </h3>
              <ul className="list-disc space-y-0.5 pl-5 marker:text-muted-foreground">
                {recipe.ingredients.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </section>
          )}
          {recipe.steps.length > 0 && (
            <section>
              <h3 className="mb-1 text-xs font-semibold tracking-wide text-primary uppercase">
                Steps
              </h3>
              <ol className="list-decimal space-y-1 pl-5 marker:text-muted-foreground">
                {recipe.steps.map((s, k) => (
                  <li key={k}>{s}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
