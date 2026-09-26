import { describe, expect, it } from "vitest";
import { parseRecipeText } from "./parser";
import { SAMPLE_RECIPE_TEXT } from "./seed";

describe("parseRecipeText", () => {
  it("reads a well-structured recipe", () => {
    const r = parseRecipeText(SAMPLE_RECIPE_TEXT);
    expect(r.title).toBe("Easy Banana Bread");
    expect(r.servings).toBe("8");
    expect(r.totalTime).toBe("1 hr 10 min");
    expect(r.ingredients).toEqual([
      "3 ripe bananas",
      "1/3 cup melted butter",
      "3/4 cup sugar",
      "1 egg",
      "1 tsp baking soda",
      "1 1/2 cups flour",
    ]);
    expect(r.steps).toHaveLength(4);
    expect(r.steps[0]).toBe("Heat oven to 350°F.");
    expect(r.sourceText).toBe(SAMPLE_RECIPE_TEXT);
  });

  it("detects ingredients and numbered steps without section headers", () => {
    const r = parseRecipeText(
      "Quick Eggs\n2 large eggs\n1 tbsp butter\n1. Melt the butter.\n2. Scramble the eggs.",
    );
    expect(r.ingredients).toEqual(["2 large eggs", "1 tbsp butter"]);
    expect(r.steps).toEqual(["Melt the butter.", "Scramble the eggs."]);
    expect(r.tags).toContain("quick");
  });

  it("does not mistake steps mentioning serving or time for metadata", () => {
    const r = parseRecipeText(
      "Rice Bowl\nDirections\nServe with rice.\nCook until the time is right, about 10 minutes.",
    );
    expect(r.servings).toBeUndefined();
    expect(r.totalTime).toBeUndefined();
    expect(r.steps).toHaveLength(2);
  });

  it("prefers total time over prep or cook time", () => {
    const r = parseRecipeText("Soup\nPrep time: 10 min\nTotal time: 40 min");
    expect(r.totalTime).toBe("40 min");
  });

  it("falls back to prep time when there is no total", () => {
    expect(parseRecipeText("Soup\nPrep time: 10 min").totalTime).toBe("10 min");
  });

  it("only tags whole words", () => {
    expect(parseRecipeText("Pastachio cake").tags).not.toContain("pasta");
  });

  it("names empty input", () => {
    expect(parseRecipeText("").title).toBe("Untitled recipe");
  });
});
