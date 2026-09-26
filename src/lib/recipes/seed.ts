import type { Recipe } from "./types";

const img = (id: string) => `https://images.unsplash.com/${id}?w=900&q=70&auto=format&fit=crop`;

export const seedRecipes: Recipe[] = [
  {
    id: "seed-1", createdAt: 5,
    title: "Lemon Garlic Roast Chicken",
    description: "Crispy skin, juicy meat, and a bright pan sauce. Sunday dinner staple.",
    servings: "4", totalTime: "1 hr 20 min",
    ingredients: ["1 whole chicken (4 lb)", "2 lemons", "6 cloves garlic", "2 tbsp olive oil", "1 tbsp salt", "Fresh thyme"],
    steps: ["Heat oven to 425°F.", "Pat chicken dry and season well.", "Stuff with lemon, garlic and thyme.", "Roast 70 minutes until 165°F.", "Rest 10 minutes, then carve."],
    tags: ["chicken", "dinner"],
    imageUrl: img("photo-1598103442097-8b74394b95c6"),
  },
  {
    id: "seed-2", createdAt: 4,
    title: "Weeknight Tomato Basil Pasta",
    description: "Twenty minutes, one pan, big flavor.",
    servings: "2", totalTime: "20 min",
    ingredients: ["200 g spaghetti", "1 pint cherry tomatoes", "3 cloves garlic", "Handful basil", "Parmesan"],
    steps: ["Boil pasta.", "Blister tomatoes with garlic in olive oil.", "Toss with pasta and pasta water.", "Finish with basil and parmesan."],
    tags: ["pasta", "vegetarian", "quick"],
    imageUrl: img("photo-1621996346565-e3dbc646d9a9"),
  },
  {
    id: "seed-3", createdAt: 3,
    title: "Brown Butter Chocolate Chip Cookies",
    description: "Nutty, chewy, and dangerously easy.",
    servings: "24 cookies", totalTime: "45 min",
    ingredients: ["1 cup butter, browned", "1 cup brown sugar", "2 eggs", "2 1/4 cups flour", "1 tsp baking soda", "2 cups chocolate chips"],
    steps: ["Brown butter and cool.", "Whisk in sugar and eggs.", "Fold in dry ingredients and chips.", "Bake at 350°F for 11 minutes."],
    tags: ["dessert"],
    imageUrl: img("photo-1499636136210-6f4ee915583e"),
  },
  {
    id: "seed-4", createdAt: 2,
    title: "Green Goddess Grain Bowl",
    description: "Herby dressing over quinoa and roasted veg.",
    servings: "2", totalTime: "35 min",
    ingredients: ["1 cup quinoa", "1 sweet potato", "1 avocado", "1 cup chickpeas", "Green goddess dressing"],
    steps: ["Cook quinoa.", "Roast sweet potato and chickpeas.", "Assemble bowls and drizzle dressing."],
    tags: ["vegan", "salad"],
  },
];
