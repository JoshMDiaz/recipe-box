import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Recipe } from "../types";
import { RecipeCard } from "./recipe-card";

/** Mobile: native scroll-snap swiping, one recipe per screen. */
export function RecipeCarousel({ recipes }: { recipes: Recipe[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const n = recipes.length;

  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const go = (delta: number) => {
    const el = track.current;
    if (!el || !n) return;
    const next = (index + delta + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
      >
        {recipes.map((r) => (
          <div key={r.id} className="w-full shrink-0 snap-center px-4">
            <RecipeCard recipe={r} className="h-[calc(100dvh-21.5rem)] min-h-[22rem]" />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button variant="outline" size="icon-lg" className="rounded-full" onClick={() => go(-1)}>
            <ChevronLeftIcon />
            <span className="sr-only">Previous recipe</span>
          </Button>
          {n <= 10 ? (
            <div className="flex gap-1.5" aria-hidden>
              {recipes.map((r, i) => (
                <span
                  key={r.id}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground tabular-nums">
              {index + 1} / {n}
            </span>
          )}
          <Button variant="outline" size="icon-lg" className="rounded-full" onClick={() => go(1)}>
            <ChevronRightIcon />
            <span className="sr-only">Next recipe</span>
          </Button>
        </div>
      )}
    </div>
  );
}
