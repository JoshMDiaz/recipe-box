import { useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, SparklesIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { NavButton, Sheet, SheetNav } from "@/components/sheet";
import { parseRecipeText } from "../parser";
import { useCreateRecipe } from "../queries";
import { SAMPLE_RECIPE_TEXT } from "../seed";
import type { RecipeInput } from "../types";
import { RecipeForm } from "./recipe-form";

const BLANK: RecipeInput = { title: "", ingredients: [], steps: [], tags: [] };

export function AddRecipeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Add a recipe">
      {/* The sheet unmounts its content once closed, so each open starts at the paste step. */}
      <AddRecipeFlow onDone={() => onOpenChange(false)} />
    </Sheet>
  );
}

function AddRecipeFlow({ onDone }: { onDone: () => void }) {
  const id = useId();
  const navigate = useNavigate();
  const create = useCreateRecipe();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<RecipeInput | null>(null);

  const save = (input: RecipeInput, photo: File | null | undefined) =>
    create.mutate(
      { input, photo: photo ?? undefined },
      {
        onSuccess: (recipeId) => {
          toast.success(`Saved “${input.title.trim()}”`);
          onDone();
          void navigate({ to: "/recipes/$recipeId", params: { recipeId } });
        },
        onError: (err) => toast.error("Couldn't save the recipe", { description: err.message }),
      },
    );

  if (draft) {
    return (
      <div className="animate-fade">
        <RecipeForm
          initial={draft}
          title="Check Details"
          left={
            <NavButton onClick={() => setDraft(null)}>
              <ChevronLeftIcon className="-ml-1.5 size-6" strokeWidth={2.25} aria-hidden /> Back
            </NavButton>
          }
          submitLabel="Save"
          pending={create.isPending}
          onSubmit={save}
        />
      </div>
    );
  }

  return (
    <form
      className="animate-fade"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) setDraft(parseRecipeText(text));
      }}
    >
      <SheetNav
        left={<NavButton onClick={onDone}>Cancel</NavButton>}
        title="New Recipe"
        right={
          <NavButton type="submit" bold disabled={!text.trim()}>
            Next
          </NavButton>
        }
      />
      <div className="flex flex-col items-center pt-4 pb-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#ff9f0a,#ff375f)] text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5)]">
          <SparklesIcon className="size-7" aria-hidden />
        </span>
        <p className="mt-3 text-[20px] font-semibold tracking-tight">Paste a recipe</p>
        <p className="mt-1 max-w-xs text-[15px] text-label-2">
          From a website, a note or a message. We'll pull out the ingredients and steps.
        </p>
      </div>
      <label htmlFor={`${id}-paste`} className="sr-only">
        Recipe text
      </label>
      <textarea
        id={`${id}-paste`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste a recipe here…"
        className="block min-h-56 w-full resize-none rounded-2xl bg-surface px-4 py-3 text-[17px] leading-snug outline-none placeholder:text-label-3 focus:ring-2 focus:ring-blue/40"
        autoFocus
      />
      <div className="mt-3 flex items-center justify-center gap-2 text-[15px]">
        <button
          type="button"
          className="font-medium text-blue active:opacity-50"
          onClick={() => setText(SAMPLE_RECIPE_TEXT)}
        >
          Try a sample
        </button>
        <span className="text-label-3">·</span>
        <button
          type="button"
          className="font-medium text-blue active:opacity-50"
          onClick={() => setDraft(BLANK)}
        >
          Type it in
        </button>
      </div>
      <button
        type="submit"
        disabled={!text.trim()}
        className="mt-5 mb-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue text-[17px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        <SparklesIcon className="size-4" aria-hidden /> Read Recipe
      </button>
    </form>
  );
}
