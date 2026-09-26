import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createRecipe, deleteRecipe, listRecipes, parseRecipe, uploadImage } from "@/lib/recipes/api";
import type { NewRecipe, Recipe } from "@/lib/recipes/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Recipe Box — Your saved recipes" },
      { name: "description", content: "Paste any recipe, save it automatically, and swipe through your personal recipe library." },
      { property: "og:title", content: "Recipe Box — Your saved recipes" },
      { property: "og:description", content: "Paste any recipe, save it automatically, and swipe through your library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const qc = useQueryClient();
  const { data: recipes = [], isLoading } = useQuery({ queryKey: ["recipes"], queryFn: listRecipes });
  const [index, setIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const del = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
  });
  const n = recipes.length;

  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const go = (d: number) => {
    const el = track.current;
    if (!el || !n) return;
    const next = (index + d + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 pt-8">
        <div className="min-w-0">
          <h1 className="font-serif text-4xl font-bold tracking-tight">Recipe Box</h1>
          <p className="text-sm text-muted-foreground">
            {n} saved<span className="md:hidden"> · swipe to browse</span>
          </p>
        </div>
        <button onClick={() => setAdding(true)} className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90">
          + Add recipe
        </button>
      </header>

      <section className="mx-auto mt-8 max-w-6xl pb-16">
        {isLoading ? (
          <div className="mx-5 h-[560px] animate-pulse rounded-3xl bg-muted" />
        ) : n === 0 ? (
          <div className="mx-5 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No recipes yet. Add your first one!</div>
        ) : (
          <>
            {/* Mobile: native swipe carousel */}
            <div className="md:hidden">
              <div
                ref={track}
                onScroll={onScroll}
                className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {recipes.map((r) => (
                  <div key={r.id} className="w-full shrink-0 snap-center px-5">
                    <RecipeCard recipe={r} onDelete={() => del.mutate(r.id)} className="h-[70vh]" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-center gap-5">
                <button onClick={() => go(-1)} aria-label="Previous recipe" className="h-11 w-11 rounded-full border border-border bg-card text-xl">←</button>
                <div className="flex gap-1.5">
                  {recipes.map((r, i) => (
                    <span key={r.id} className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-2 bg-border"}`} />
                  ))}
                </div>
                <button onClick={() => go(1)} aria-label="Next recipe" className="h-11 w-11 rounded-full border border-border bg-card text-xl">→</button>
              </div>
            </div>

            {/* Desktop: gallery */}
            <div className="hidden grid-cols-2 gap-6 px-5 md:grid lg:grid-cols-3">
              {recipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} onDelete={() => del.mutate(r.id)} className="h-[560px]" />
              ))}
            </div>
          </>
        )}
      </section>

      {adding && <AddRecipeDialog onClose={() => setAdding(false)} onSaved={() => { setAdding(false); track.current?.scrollTo({ left: 0 }); }} />}
    </main>
  );
}

function RecipeCard({ recipe, onDelete, className = "" }: { recipe: Recipe; onDelete: () => void; className?: string }) {
  return (
    <article className={`flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg ${className}`}>
      {recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt={recipe.title} draggable={false} className="h-48 w-full shrink-0 object-cover" />
      ) : (
        <div className="flex h-36 shrink-0 items-center justify-center bg-secondary font-serif text-5xl text-secondary-foreground">{recipe.title[0]}</div>
      )}
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-2xl font-bold leading-tight">{recipe.title}</h2>
          <button onClick={onDelete} className="shrink-0 text-xs text-muted-foreground hover:text-destructive">Delete</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {recipe.totalTime && <span className="rounded-full bg-muted px-2.5 py-1">⏱ {recipe.totalTime}</span>}
          {recipe.servings && <span className="rounded-full bg-muted px-2.5 py-1">Serves {recipe.servings}</span>}
          {recipe.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">{t}</span>)}
        </div>
        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
          {recipe.description && <p className="text-muted-foreground">{recipe.description}</p>}
          {recipe.ingredients.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Ingredients</h3>
              <ul className="list-disc space-y-0.5 pl-5">{recipe.ingredients.map((i, k) => <li key={k}>{i}</li>)}</ul>
            </div>
          )}
          {recipe.steps.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Steps</h3>
              <ol className="list-decimal space-y-1 pl-5">{recipe.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const SAMPLE = `Easy Banana Bread
Serves: 8
Total time: 1 hr 10 min
Ingredients
3 ripe bananas
1/3 cup melted butter
3/4 cup sugar
1 egg
1 tsp baking soda
1 1/2 cups flour
Directions
1. Heat oven to 350°F.
2. Mash bananas and mix in butter.
3. Stir in sugar, egg, baking soda, then flour.
4. Bake in a loaf pan for 60 minutes.`;

function AddRecipeDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<NewRecipe | null>(null);
  const [image, setImage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const read = async () => { setBusy(true); setDraft(await parseRecipe(text)); setBusy(false); };
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    await createRecipe(image ? { ...draft, imageUrl: image } : draft);
    await qc.invalidateQueries({ queryKey: ["recipes"] });
    onSaved();
  };
  const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Add a recipe</h2>
          <button onClick={onClose} className="text-muted-foreground">✕</button>
        </div>

        {!draft ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">Paste the recipe text and we'll read it for you.</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Paste recipe here…"
              className="mt-4 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <div className="mt-3 flex justify-between">
              <button onClick={() => setText(SAMPLE)} className="text-sm text-primary underline">Try a sample</button>
              <button disabled={!text.trim() || busy} onClick={read} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Reading…" : "Read recipe"}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background p-2" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>Serves<input value={draft.servings ?? ""} onChange={(e) => setDraft({ ...draft, servings: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background p-2" /></label>
              <label>Time<input value={draft.totalTime ?? ""} onChange={(e) => setDraft({ ...draft, totalTime: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background p-2" /></label>
            </div>
            <label className="block">Ingredients (one per line)
              <textarea rows={5} defaultValue={draft.ingredients.join("\n")} onChange={(e) => setDraft({ ...draft, ingredients: lines(e.target.value) })} className="mt-1 w-full rounded-xl border border-input bg-background p-2" />
            </label>
            <label className="block">Steps (one per line)
              <textarea rows={5} defaultValue={draft.steps.join("\n")} onChange={(e) => setDraft({ ...draft, steps: lines(e.target.value) })} className="mt-1 w-full rounded-xl border border-input bg-background p-2" />
            </label>
            <label className="block">Photo (optional)
              <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImage(await uploadImage(f)); }} className="mt-1 block w-full text-sm" />
            </label>
            {image && <img src={image} alt="Preview" className="h-32 w-full rounded-xl object-cover" />}
            <div className="flex justify-between pt-2">
              <button onClick={() => setDraft(null)} className="text-sm text-muted-foreground">← Back</button>
              <button disabled={busy} onClick={save} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Saving…" : "Save recipe"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
