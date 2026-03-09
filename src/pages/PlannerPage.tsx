import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Meal, MealPlan, DietStyle, DAYS, DAY_LABELS, MEAL_TYPES, MEAL_LABELS,
  DIET_LABELS, DIET_EMOJIS,
} from "@/types";
import { loadPreferences, isOnboarded } from "@/store/preferences";
import { generateWeeklyPlan, generateMealForSlot, getAlternatives, generateShoppingList } from "@/services/planner";
import MealCard from "@/components/MealCard";
import SwapPopup from "@/components/SwapPopup";
import { RefreshCw, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlannerPage() {
  const navigate = useNavigate();
  const prefs = loadPreferences();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [dietStyle, setDietStyle] = useState<DietStyle>(prefs.dietStyle);
  const [swapTarget, setSwapTarget] = useState<Meal | null>(null);
  const [simplified, setSimplified] = useState(prefs.simplifiedMode);

  if (!isOnboarded()) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <h2 className="mb-2 text-2xl font-bold">Let's set up your preferences first!</h2>
        <p className="mb-6 text-muted-foreground">A quick wizard to personalize your meal plans.</p>
        <Button asChild size="lg"><Link to="/onboarding">Start setup →</Link></Button>
      </div>
    );
  }

  const generate = useCallback(() => {
    const lockedMeals = plan?.meals.filter((m) => m.locked) || [];
    const p = { ...prefs, dietStyle, simplifiedMode: simplified };
    setPlan(generateWeeklyPlan(p, lockedMeals));
  }, [prefs, dietStyle, plan, simplified]);

  const toggleLock = (mealId: string) => {
    if (!plan) return;
    setPlan({
      ...plan,
      meals: plan.meals.map((m) =>
        m.id === mealId ? { ...m, locked: !m.locked } : m
      ),
    });
  };

  const regenerateMeal = (meal: Meal) => {
    if (!plan) return;
    const p = { ...prefs, dietStyle, simplifiedMode: simplified };
    const exclude = plan.meals.map((m) => m.recipe.id);
    const newMeal = generateMealForSlot(meal.dayOfWeek, meal.mealType, p, exclude);
    if (!newMeal) return;
    setPlan({
      ...plan,
      meals: plan.meals.map((m) => (m.id === meal.id ? { ...newMeal, id: m.id, locked: m.locked } : m)),
    });
  };

  const swapMeal = (oldMeal: Meal, newRecipe: any) => {
    if (!plan) return;
    setPlan({
      ...plan,
      meals: plan.meals.map((m) =>
        m.id === oldMeal.id ? { ...m, recipe: newRecipe } : m
      ),
    });
    setSwapTarget(null);
  };

  const goToShopping = () => {
    if (!plan) return;
    const items = generateShoppingList(plan);
    localStorage.setItem("family-meals-shopping", JSON.stringify(items));
    navigate("/shopping");
  };

  // Stats for reassuring message
  const avgTime = plan
    ? Math.round(plan.meals.reduce((s, m) => s + m.recipe.cookingTimeMinutes, 0) / plan.meals.length)
    : 0;

  return (
    <div className="container px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl">Weekly Planner</h1>
          <p className="text-sm text-muted-foreground">Plan your family's meals for the week.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {plan ? "Regenerate" : "Generate week"}
          </Button>
          {plan && (
            <Button variant="outline" onClick={goToShopping} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Shopping list
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DIET_LABELS) as DietStyle[]).map((d) => (
            <button
              key={d}
              onClick={() => setDietStyle(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                dietStyle === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {DIET_EMOJIS[d]} {DIET_LABELS[d]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSimplified(!simplified)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            simplified ? "bg-honey text-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          Simplified
        </button>
      </div>

      {/* Reassuring message */}
      {plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-2 rounded-xl bg-sage-light px-4 py-3 text-sm text-primary"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>
            Your plan averages <strong>{avgTime} minutes</strong> per meal.{" "}
            {simplified ? "Simplified mode is on — fewer new recipes, more leftovers." : "Looking good!"}
          </span>
        </motion.div>
      )}

      {/* Weekly grid */}
      {plan ? (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="mb-2 grid grid-cols-[100px_repeat(7,1fr)] gap-2">
              <div />
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {DAY_LABELS[d]}
                </div>
              ))}
            </div>

            {/* Meal rows */}
            {MEAL_TYPES.filter((mt) => !simplified || mt !== "snack").map((mt) => (
              <div key={mt} className="mb-2 grid grid-cols-[100px_repeat(7,1fr)] gap-2">
                <div className="flex items-center text-xs font-semibold text-muted-foreground">
                  {MEAL_LABELS[mt]}
                </div>
                {DAYS.map((day) => {
                  const meal = plan.meals.find((m) => m.dayOfWeek === day && m.mealType === mt);
                  return (
                    <div key={`${day}-${mt}`}>
                      {meal ? (
                        <MealCard
                          meal={meal}
                          onToggleLock={() => toggleLock(meal.id)}
                          onRegenerate={() => regenerateMeal(meal)}
                          onSwap={() => setSwapTarget(meal)}
                        />
                      ) : (
                        <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">No plan yet</p>
          <p className="mb-4 text-sm text-muted-foreground">Click "Generate week" to create your meal plan.</p>
        </div>
      )}

      {/* Swap popup */}
      {swapTarget && plan && (
        <SwapPopup
          meal={swapTarget}
          alternatives={getAlternatives(
            swapTarget.mealType,
            { ...prefs, dietStyle },
            plan.meals.map((m) => m.recipe.id)
          )}
          onSelect={(recipe) => swapMeal(swapTarget, recipe)}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  );
}
