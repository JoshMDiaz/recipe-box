import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {/* Remount on each open so the dialog always starts at the paste step. */}
        {open && <AddRecipeFlow onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
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
      <>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Check the details</DialogTitle>
          <DialogDescription>Fix anything we misread, then save.</DialogDescription>
        </DialogHeader>
        <RecipeForm
          initial={draft}
          submitLabel="Save recipe"
          pending={create.isPending}
          onSubmit={save}
          secondaryAction={
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              <ArrowLeftIcon data-icon="inline-start" /> Back
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-2xl">Add a recipe</DialogTitle>
        <DialogDescription>Paste the recipe text and we'll sort it out for you.</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) setDraft(parseRecipeText(text));
        }}
      >
        <label htmlFor={`${id}-paste`} className="sr-only">
          Recipe text
        </label>
        <Textarea
          id={`${id}-paste`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste a recipe here…"
          className="min-h-56"
          autoFocus
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => setText(SAMPLE_RECIPE_TEXT)}
            >
              Try a sample
            </Button>
            <span className="self-center text-muted-foreground">·</span>
            <Button type="button" variant="link" className="px-0" onClick={() => setDraft(BLANK)}>
              Type it in
            </Button>
          </div>
          <Button type="submit" size="lg" disabled={!text.trim()} className="rounded-full px-5">
            <SparklesIcon data-icon="inline-start" /> Read recipe
          </Button>
        </div>
      </form>
    </>
  );
}
