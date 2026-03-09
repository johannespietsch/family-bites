export type DietStyle =
  | "normal"
  | "vegetarian"
  | "vegan"
  | "ayurvedic"
  | "mediterranean"
  | "high-protein"
  | "family-comfort";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export const DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
  snack: "🍎 Snack",
};

export const DIET_LABELS: Record<DietStyle, string> = {
  normal: "No restrictions",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  ayurvedic: "Ayurvedic",
  mediterranean: "Mediterranean",
  "high-protein": "High Protein",
  "family-comfort": "Family Comfort",
};

export const DIET_EMOJIS: Record<DietStyle, string> = {
  normal: "🍽️",
  vegetarian: "🥬",
  vegan: "🌱",
  ayurvedic: "🧘",
  mediterranean: "🫒",
  "high-protein": "💪",
  "family-comfort": "🏠",
};

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  dietStyles: DietStyle[];
  cuisine: string;
  effortLevel: "easy" | "medium" | "hard";
  cookingTimeMinutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  suitableForBaby: boolean;
  mealTypes: MealType[];
}

export interface Meal {
  id: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipe: Recipe;
  locked: boolean;
}

export interface MealPlan {
  id: string;
  weekStartDate: string;
  meals: Meal[];
  createdAt: string;
}

export interface Preferences {
  adultsCount: number;
  childrenCount: number;
  dietStyle: DietStyle;
  cuisinePreferences: string[];
  dislikes: string[];
  spiceLevel: "mild" | "medium" | "spicy";
  cookingTimeLimit: number; // minutes
  daysCookingPerWeek: number;
  budgetLevel: "low" | "medium" | "high";
  babyEatingSolids: boolean;
  babySharesMeals: boolean;
  babyAllergens: string[];
  simplifiedMode: boolean;
}

export interface ShoppingItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  inPantry: boolean;
  picnicProductId?: string;
}

export const DEFAULT_PREFERENCES: Preferences = {
  adultsCount: 2,
  childrenCount: 1,
  dietStyle: "normal",
  cuisinePreferences: [],
  dislikes: [],
  spiceLevel: "mild",
  cookingTimeLimit: 30,
  daysCookingPerWeek: 5,
  budgetLevel: "medium",
  babyEatingSolids: true,
  babySharesMeals: true,
  babyAllergens: [],
  simplifiedMode: false,
};
