import { SEED_RECIPES } from "@/data/recipes";
import {
  Recipe, Preferences, Meal, MealPlan, MealType, DayOfWeek,
  DAYS, MEAL_TYPES, ShoppingItem,
} from "@/types";

/**
 * Meal plan generation service.
 * 
 * Currently uses a curated recipe dataset with filtering and random selection.
 * 
 * TO PLUG IN AN LLM:
 * Replace `generateWeeklyPlan()` with an API call to your LLM service.
 * The function signature and return type should remain the same.
 * Pass preferences as context to the LLM prompt.
 */

function getRecipesForMeal(
  mealType: MealType,
  prefs: Preferences,
  exclude: string[] = []
): Recipe[] {
  return SEED_RECIPES.filter((r) => {
    if (!r.mealTypes.includes(mealType)) return false;
    if (exclude.includes(r.id)) return false;
    // Diet style filter
    if (prefs.dietStyle !== "normal" && !r.dietStyles.includes(prefs.dietStyle)) return false;
    // Cooking time filter
    if (r.cookingTimeMinutes > prefs.cookingTimeLimit) return false;
    // Dislikes filter
    if (prefs.dislikes.some((d) => r.ingredients.some((i) => i.name.toLowerCase().includes(d.toLowerCase())))) return false;
    return true;
  });
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let idCounter = 0;
function genId(): string {
  return `meal-${Date.now()}-${idCounter++}`;
}

export function generateMealForSlot(
  day: DayOfWeek,
  mealType: MealType,
  prefs: Preferences,
  exclude: string[] = []
): Meal | null {
  const candidates = getRecipesForMeal(mealType, prefs, exclude);
  if (candidates.length === 0) {
    // Fallback: try without diet filter
    const fallback = SEED_RECIPES.filter(
      (r) => r.mealTypes.includes(mealType) && !exclude.includes(r.id)
    );
    if (fallback.length === 0) return null;
    const recipe = pickRandom(fallback);
    return { id: genId(), dayOfWeek: day, mealType, recipe, locked: false };
  }
  const recipe = pickRandom(candidates);
  return { id: genId(), dayOfWeek: day, mealType, recipe, locked: false };
}

export function generateWeeklyPlan(
  prefs: Preferences,
  lockedMeals: Meal[] = [],
  weekStart?: string
): MealPlan {
  const meals: Meal[] = [...lockedMeals];
  const usedRecipeIds = lockedMeals.map((m) => m.recipe.id);

  const mealTypes: MealType[] = prefs.simplifiedMode
    ? ["breakfast", "lunch", "dinner"]
    : MEAL_TYPES;

  for (const day of DAYS) {
    for (const mt of mealTypes) {
      const existing = meals.find((m) => m.dayOfWeek === day && m.mealType === mt);
      if (existing) continue;

      const meal = generateMealForSlot(day, mt, prefs, usedRecipeIds);
      if (meal) {
        meals.push(meal);
        usedRecipeIds.push(meal.recipe.id);
      }
    }
  }

  const start = weekStart || getNextMonday();

  return {
    id: `plan-${Date.now()}`,
    weekStartDate: start,
    meals,
    createdAt: new Date().toISOString(),
  };
}

export function getAlternatives(
  mealType: MealType,
  prefs: Preferences,
  exclude: string[],
  count = 3
): Recipe[] {
  const candidates = getRecipesForMeal(mealType, prefs, exclude);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateShoppingList(plan: MealPlan): ShoppingItem[] {
  const aggregated: Map<string, ShoppingItem> = new Map();

  for (const meal of plan.meals) {
    for (const ing of meal.recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}-${ing.unit}`;
      if (aggregated.has(key)) {
        const existing = aggregated.get(key)!;
        existing.quantity += ing.quantity;
      } else {
        aggregated.set(key, {
          id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ingredientName: ing.name,
          quantity: Math.round(ing.quantity * 10) / 10,
          unit: ing.unit,
          inPantry: false,
        });
      }
    }
  }

  return Array.from(aggregated.values()).sort((a, b) =>
    a.ingredientName.localeCompare(b.ingredientName)
  );
}

function getNextMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().split("T")[0];
}
