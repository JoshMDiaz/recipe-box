import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, type CSSProperties, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { Recipe } from "../types";
import { RecipeHero } from "./recipe-meta";

/** Full recipe on a card — scrolls internally so you can cook straight from the carousel. */
export function RecipeCard({
  recipe,
  className,
  style,
}: {
  recipe: Recipe;
  className?: string;
  style?: CSSProperties;
}) {
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
      style={style}
      className={cn(
        "group flex animate-rise cursor-pointer flex-col overflow-hidden rounded-[26px] bg-surface text-label shadow-[0_18px_40px_-22px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue/50",
        className,
      )}
    >
      <RecipeHero
        recipe={recipe}
        className="h-48 shrink-0"
        title={
          <h2>
            <Link
              to="/recipes/$recipeId"
              params={{ recipeId: recipe.id }}
              className="focus-visible:outline-none"
            >
              {recipe.title}
            </Link>
          </h2>
        }
      />
      <div className="-mr-1 min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-4 pr-6 pb-5 text-[15px] leading-snug">
        {recipe.description && <p className="text-label-2">{recipe.description}</p>}
        {recipe.ingredients.length > 0 && (
          <section>
            <h3 className="mb-1.5 text-[13px] text-label-2 uppercase">Ingredients</h3>
            <ul className="divide-y divide-separator">
              {recipe.ingredients.map((i, k) => (
                <li key={k} className="py-1.5">
                  {i}
                </li>
              ))}
            </ul>
          </section>
        )}
        {recipe.steps.length > 0 && (
          <section>
            <h3 className="mb-1.5 text-[13px] text-label-2 uppercase">Steps</h3>
            <ol className="space-y-2.5">
              {recipe.steps.map((s, k) => (
                <li key={k} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fill font-rounded text-[13px] font-semibold text-label-2 tabular-nums">
                    {k + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </article>
  );
}
