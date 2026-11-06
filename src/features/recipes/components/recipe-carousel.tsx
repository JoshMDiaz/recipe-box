import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRef, useState } from "react";
import { roundButton } from "@/components/grouped";
import { cn } from "@/lib/utils";
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
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain pb-6 [&::-webkit-scrollbar]:hidden"
      >
        {recipes.map((r, i) => (
          <div key={r.id} className="w-full shrink-0 snap-center px-4">
            <RecipeCard
              recipe={r}
              style={{ animationDelay: `${Math.min(i, 3) * 70}ms` }}
              className="h-[calc(100dvh-20rem)] min-h-[24rem] active:scale-[0.99]"
            />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button type="button" className={roundButton} onClick={() => go(-1)}>
            <ChevronLeftIcon className="size-5" strokeWidth={2.5} />
            <span className="sr-only">Previous recipe</span>
          </button>
          {n <= 10 ? (
            <div className="flex gap-1.5" aria-hidden>
              {recipes.map((r, i) => (
                <span
                  key={r.id}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-5 bg-blue" : "w-2 bg-fill-2",
                  )}
                />
              ))}
            </div>
          ) : (
            <span className="font-rounded text-[15px] font-semibold text-label-2 tabular-nums">
              {index + 1} / {n}
            </span>
          )}
          <button type="button" className={roundButton} onClick={() => go(1)}>
            <ChevronRightIcon className="size-5" strokeWidth={2.5} />
            <span className="sr-only">Next recipe</span>
          </button>
        </div>
      )}
    </div>
  );
}
