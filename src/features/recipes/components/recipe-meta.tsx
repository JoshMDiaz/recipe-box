import { ClockIcon, UsersIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gradientFor } from "../gradient";
import type { Recipe } from "../types";

/** Time and servings, for the line under a recipe's title. */
export function RecipeFacts({ recipe, className }: { recipe: Recipe; className?: string }) {
  if (!recipe.totalTime && !recipe.servings) return null;
  return (
    <span className={cn("flex flex-wrap items-center gap-x-3 gap-y-0.5", className)}>
      {recipe.totalTime && (
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" aria-hidden /> {recipe.totalTime}
        </span>
      )}
      {recipe.servings && (
        <span className="inline-flex items-center gap-1">
          <UsersIcon className="size-3.5" aria-hidden /> Serves {recipe.servings}
        </span>
      )}
    </span>
  );
}

/**
 * The top of a recipe, styled like a Family Bank card: the photo, or the
 * recipe's gradient with a glass sheen, with the title on top.
 */
export function RecipeHero({
  recipe,
  title,
  className,
  large,
}: {
  recipe: Recipe;
  /** The title element, so callers can make it a link or an <h1>. */
  title: ReactNode;
  className?: string;
  large?: boolean;
}) {
  const tag = recipe.tags[0];
  // A broken or blocked photo link falls back to the gradient.
  const [failedUrl, setFailedUrl] = useState<string>();
  const photo = recipe.imageUrl && recipe.imageUrl !== failedUrl ? recipe.imageUrl : undefined;
  return (
    <div
      style={photo ? undefined : { background: gradientFor(recipe.id) }}
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden text-white",
        className,
      )}
    >
      {photo ? (
        <>
          <img
            src={photo}
            onError={() => setFailedUrl(photo)}
            alt=""
            draggable={false}
            loading="lazy"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
          <span className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.25)_45%,transparent_70%)]" />
        </>
      ) : (
        <>
          {/* glass sheen */}
          <span className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.06)_32%,transparent_45%)]" />
          <span className="pointer-events-none absolute -right-16 -bottom-24 -z-10 size-64 rounded-full border-[28px] border-white/10" />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1 right-5 -z-10 font-rounded text-[120px] leading-none font-bold text-white/15 select-none"
          >
            {recipe.title.trim()[0]?.toUpperCase()}
          </span>
        </>
      )}

      {tag && !large && (
        <span className="absolute top-4 left-5 rounded-full bg-white/25 px-2.5 py-1 text-[12px] font-bold capitalize backdrop-blur-sm">
          {tag}
        </span>
      )}

      <div className={cn("p-5", large && "sm:p-7")}>
        <div
          className={cn(
            "font-semibold tracking-tight text-balance [text-shadow:0_1px_12px_rgba(0,0,0,0.25)]",
            large
              ? "text-[30px] leading-[1.1] sm:text-[40px]"
              : "line-clamp-2 text-[24px] leading-tight",
          )}
        >
          {title}
        </div>
        <RecipeFacts recipe={recipe} className="mt-1.5 text-[13px] font-medium text-white/80" />
      </div>
    </div>
  );
}

/** Tags as iOS-style pills. */
export function TagPills({ tags, className }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full bg-blue/12 px-2.5 py-1 text-[13px] font-medium text-blue capitalize"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
