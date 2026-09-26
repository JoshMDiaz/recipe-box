import type { RecipeInput } from "./types";

/**
 * Heuristic recipe parser. Reads pasted text and pulls out a title,
 * ingredients, steps, servings and time. A future Cloud Function could
 * swap this for an AI parser behind the same signature.
 */
export function parseRecipeText(raw: string): RecipeInput {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const ingredients: string[] = [];
  const steps: string[] = [];
  const desc: string[] = [];
  let section: "none" | "ing" | "steps" = "none";
  let title = "";
  let servings: string | undefined;
  let totalTime: string | undefined;
  let fallbackTime: string | undefined;

  const isIngHeader = (l: string) => /^ingredients?\s*:?$/i.test(l);
  const isStepHeader = (l: string) =>
    /^(directions|instructions|method|steps|preparation)\s*:?$/i.test(l);
  const looksLikeIngredient = (l: string) =>
    /^[-•*]?\s*(\d+[\d/.\s]*|½|¼|¾|⅓|⅔|a |one |two |pinch|dash)/i.test(l) &&
    /\b(cups?|tbsp|tsp|tablespoons?|teaspoons?|g|kg|oz|lbs?|ml|l|cloves?|pinch|cans?|slices?|large|small|medium|whole)\b/i.test(
      l,
    );

  for (const line of lines) {
    // Metadata only counts at the start of a line, so a step like
    // "Serve with rice" or "Bake until set, about the time..." isn't misread.
    const s = line.match(/^(serves|servings|yield|makes)\b\s*:?\s*(.+)/i);
    if (s) {
      servings ??= s[2];
      continue;
    }
    const t = line.match(/^(total time|ready in|time|cook time|prep time)\b\s*:?\s*(.+)/i);
    if (t) {
      if (/^(total time|ready in|time)$/i.test(t[1]!)) totalTime ??= t[2];
      else fallbackTime ??= t[2];
      continue;
    }

    if (isIngHeader(line)) {
      section = "ing";
      continue;
    }
    if (isStepHeader(line)) {
      section = "steps";
      continue;
    }
    if (!title) {
      title = line.replace(/^#+\s*/, "");
      continue;
    }

    const clean = line.replace(/^([-•*]|\d+[.)])\s*/, "");
    if (section === "ing") ingredients.push(clean);
    else if (section === "steps") steps.push(clean);
    else if (looksLikeIngredient(line)) ingredients.push(clean);
    else if (/^\d+[.)]\s/.test(line)) steps.push(clean);
    else if (ingredients.length && line.length > 40) steps.push(clean);
    else desc.push(line);
  }

  const lower = raw.toLowerCase();
  const tags = [
    "vegetarian",
    "vegan",
    "dessert",
    "chicken",
    "pasta",
    "soup",
    "breakfast",
    "salad",
    "quick",
  ].filter((k) => new RegExp(`\\b${k}\\b`).test(lower));

  return {
    title: title || "Untitled recipe",
    description: desc.join(" ").slice(0, 240) || undefined,
    servings,
    totalTime: totalTime ?? fallbackTime,
    ingredients,
    steps,
    tags,
    sourceText: raw,
  };
}
