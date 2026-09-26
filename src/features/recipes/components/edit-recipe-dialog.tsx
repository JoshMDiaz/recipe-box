import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateRecipe } from "../queries";
import type { Recipe } from "../types";
import { RecipeForm } from "./recipe-form";

export function EditRecipeDialog({
  recipe,
  open,
  onOpenChange,
}: {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateRecipe();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Edit recipe</DialogTitle>
        </DialogHeader>
        {open && (
          <RecipeForm
            initial={recipe}
            initialImageUrl={recipe.imageUrl}
            submitLabel="Save changes"
            pending={update.isPending}
            onSubmit={(input, photo) =>
              update.mutate(
                { recipe, input, photo },
                {
                  onSuccess: () => {
                    toast.success("Recipe updated");
                    onOpenChange(false);
                  },
                  onError: (err) =>
                    toast.error("Couldn't save changes", { description: err.message }),
                },
              )
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
