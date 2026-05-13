import type { Recipe } from "@/data/recipes";

const BASE = "https://www.themealdb.com/api/json/v1/1";

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBListItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

function extractIngredients(meal: MealDBMeal): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]?.trim();
    const mea = meal[`strMeasure${i}`]?.trim();
    if (ing) {
      out.push(mea ? `${mea} ${ing}` : ing);
    }
  }
  return out;
}

function extractSteps(instructions: string): string[] {
  return instructions
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter((s) => s.length > 10);
}

function stableRating(id: string): number {
  const n = parseInt(id, 10) % 20;
  return parseFloat((4.0 + n / 20).toFixed(1));
}

export function adaptMeal(meal: MealDBMeal): Recipe {
  const steps = extractSteps(meal.strInstructions ?? "");
  const firstStep = steps[0] ?? "";
  const description =
    firstStep.length > 150 ? firstStep.slice(0, 147) + "..." : firstStep || meal.strCategory;

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory,
    image: meal.strMealThumb,
    time: 30,
    servings: 4,
    difficulty: "Medium",
    rating: stableRating(meal.idMeal),
    calories: 0,
    description,
    ingredients: extractIngredients(meal),
    steps,
    isFeatured: false,
  };
}

export function adaptListItem(item: MealDBListItem, category: string): Recipe {
  return {
    id: item.idMeal,
    title: item.strMeal,
    category,
    image: item.strMealThumb,
    time: 30,
    servings: 4,
    difficulty: "Medium",
    rating: stableRating(item.idMeal),
    calories: 0,
    description: "",
    ingredients: [],
    steps: [],
    isFeatured: false,
  };
}

export async function searchMeals(query: string): Promise<Recipe[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return (data.meals ?? []).map(adaptMeal);
}

export async function getMealsByLetter(letter: string): Promise<Recipe[]> {
  const res = await fetch(`${BASE}/search.php?f=${letter}`);
  const data = await res.json();
  return (data.meals ?? []).map(adaptMeal);
}

export async function getMealById(id: string): Promise<Recipe | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  if (!data.meals?.[0]) return null;
  return adaptMeal(data.meals[0]);
}

export async function getRandomMeal(): Promise<Recipe | null> {
  const res = await fetch(`${BASE}/random.php`);
  const data = await res.json();
  if (!data.meals?.[0]) return null;
  return adaptMeal(data.meals[0]);
}

export async function getMealsByCategory(category: string): Promise<Recipe[]> {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  return (data.meals ?? []).map((m: MealDBListItem) => adaptListItem(m, category));
}

export async function getDBCategories(): Promise<MealDBCategory[]> {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories ?? [];
}

export const CATEGORY_META: Record<
  string,
  { icon: string; color: string; bgColor: string; emoji: string }
> = {
  Beef: { icon: "restaurant", color: "#C62828", bgColor: "#FFEBEE", emoji: "🥩" },
  Chicken: { icon: "restaurant", color: "#7C3AED", bgColor: "#EDE9FE", emoji: "🐔" },
  Dessert: { icon: "ice-cream", color: "#E91E63", bgColor: "#FCE4EC", emoji: "🍰" },
  Lamb: { icon: "restaurant", color: "#6D4C41", bgColor: "#EFEBE9", emoji: "🐑" },
  Miscellaneous: { icon: "grid", color: "#546E7A", bgColor: "#ECEFF1", emoji: "🍽️" },
  Pasta: { icon: "restaurant", color: "#F57F17", bgColor: "#FFFDE7", emoji: "🍝" },
  Pork: { icon: "restaurant", color: "#AD1457", bgColor: "#FCE4EC", emoji: "🐷" },
  Seafood: { icon: "fish", color: "#0277BD", bgColor: "#E1F5FE", emoji: "🦞" },
  Side: { icon: "leaf", color: "#2E7D32", bgColor: "#E8F5E9", emoji: "🥗" },
  Starter: { icon: "restaurant", color: "#5B21B6", bgColor: "#EDE9FE", emoji: "🥙" },
  Vegan: { icon: "leaf", color: "#388E3C", bgColor: "#E8F5E9", emoji: "🌿" },
  Vegetarian: { icon: "leaf", color: "#43A047", bgColor: "#E8F5E9", emoji: "🥦" },
  Breakfast: { icon: "sunny", color: "#F9A825", bgColor: "#FFFDE7", emoji: "🍳" },
  Goat: { icon: "restaurant", color: "#795548", bgColor: "#EFEBE9", emoji: "🐐" },
};
