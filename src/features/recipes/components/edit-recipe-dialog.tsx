import { toast } from "sonner";
import { NavButton, Sheet } from "@/components/sheet";
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
    <Sheet open={open} onOpenChange={onOpenChange} title="Edit recipe">
      {/* Unmounted while closed, so each open starts from the saved recipe. */}
      <RecipeForm
        initial={recipe}
        initialImageUrl={recipe.imageUrl}
        title="Edit Recipe"
        left={<NavButton onClick={() => onOpenChange(false)}>Cancel</NavButton>}
        submitLabel="Save"
        pending={update.isPending}
        onSubmit={(input, photo) =>
          update.mutate(
            { recipe, input, photo },
            {
              onSuccess: () => {
                toast.success("Recipe updated");
                onOpenChange(false);
              },
              onError: (err) => toast.error("Couldn't save changes", { description: err.message }),
            },
          )
        }
      />
    </Sheet>
  );
}
