import type { NewRecipe } from "./types";

/**
 * Heuristic recipe parser (stub). Reads pasted text and pulls out a title,
 * ingredients, steps, servings and time. Swap for an AI/cloud parser later.
 */
export function parseRecipeText(raw: string): NewRecipe {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const ingredients: string[] = [];
  const steps: string[] = [];
  const desc: string[] = [];
  let section: "none" | "ing" | "steps" = "none";
  let title = "";

  const isIngHeader = (l: string) => /^ingredients?\b:?/i.test(l);
  const isStepHeader = (l: string) => /^(directions|instructions|method|steps|preparation)\b:?/i.test(l);
  const looksLikeIngredient = (l: string) =>
    /^[-•*]?\s*(\d+[\d\/.\s]*|½|¼|¾|a |one |two |pinch|dash)/i.test(l) &&
    /(cup|tbsp|tsp|tablespoon|teaspoon|g\b|kg|oz|lb|ml|clove|pinch|can|slice|large|small|medium|whole)/i.test(l);

  let servings: string | undefined;
  let totalTime: string | undefined;

  for (const line of lines) {
    const s = line.match(/(serves|servings|yield)s?:?\s*(.+)/i);
    if (s) { servings = s[2]; continue; }
    const t = line.match(/(total time|time|cook time|prep time):?\s*(.+)/i);
    if (t && !totalTime) { totalTime = t[2]; continue; }

    if (isIngHeader(line)) { section = "ing"; continue; }
    if (isStepHeader(line)) { section = "steps"; continue; }
    if (!title) { title = line.replace(/^#+\s*/, ""); continue; }

    const clean = line.replace(/^([-•*]|\d+[.)])\s*/, "");
    if (section === "ing") ingredients.push(clean);
    else if (section === "steps") steps.push(clean);
    else if (looksLikeIngredient(line)) ingredients.push(clean);
    else if (/^\d+[.)]\s/.test(line)) steps.push(clean);
    else if (ingredients.length && line.length > 40) steps.push(clean);
    else desc.push(line);
  }

  const lower = raw.toLowerCase();
  const tags = ["vegetarian", "vegan", "dessert", "chicken", "pasta", "soup", "breakfast", "salad", "quick"]
    .filter((k) => lower.includes(k));

  return {
    title: title || "Untitled recipe",
    description: desc.join(" ").slice(0, 240) || undefined,
    servings,
    totalTime,
    ingredients,
    steps,
    tags,
    sourceText: raw,
  };
}
