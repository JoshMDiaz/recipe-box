import { ClockIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "../types";

export function RecipeMeta({ recipe }: { recipe: Recipe }) {
  if (!recipe.totalTime && !recipe.servings && recipe.tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {recipe.totalTime && (
        <Badge variant="outline" className="h-6 px-2.5">
          <ClockIcon data-icon="inline-start" /> {recipe.totalTime}
        </Badge>
      )}
      {recipe.servings && (
        <Badge variant="outline" className="h-6 px-2.5">
          <UsersIcon data-icon="inline-start" /> Serves {recipe.servings}
        </Badge>
      )}
      {recipe.tags.map((t) => (
        <Badge key={t} variant="secondary" className="h-6 px-2.5 capitalize">
          {t}
        </Badge>
      ))}
    </div>
  );
}

export function RecipeImage({ recipe, className }: { recipe: Recipe; className?: string }) {
  return recipe.imageUrl ? (
    <img
      src={recipe.imageUrl}
      alt=""
      draggable={false}
      loading="lazy"
      className={`w-full object-cover ${className ?? ""}`}
    />
  ) : (
    <div
      aria-hidden
      className={`flex w-full items-center justify-center bg-secondary font-heading text-6xl text-secondary-foreground ${className ?? ""}`}
    >
      {recipe.title[0]?.toUpperCase()}
    </div>
  );
}
