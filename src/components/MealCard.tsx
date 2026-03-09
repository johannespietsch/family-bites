import { useState } from "react";
import { motion } from "framer-motion";
import { Meal, DIET_LABELS } from "@/types";
import { Lock, Unlock, RefreshCw, ArrowRightLeft, Clock, ChefHat } from "lucide-react";

interface MealCardProps {
  meal: Meal;
  onToggleLock: () => void;
  onRegenerate: () => void;
  onSwap: () => void;
}

export default function MealCard({ meal, onToggleLock, onRegenerate, onSwap }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const r = meal.recipe;

  const effortColor = r.effortLevel === "easy" ? "text-primary" : r.effortLevel === "medium" ? "text-honey" : "text-accent";

  return (
    <motion.div
      layout
      className={`group relative rounded-xl border p-2.5 text-xs transition-all cursor-pointer ${
        meal.locked
          ? "border-primary/40 bg-sage-light"
          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <p className="mb-1 font-display text-[11px] font-bold leading-tight line-clamp-2">
        {r.title}
      </p>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{r.cookingTimeMinutes}m</span>
        <ChefHat className={`h-3 w-3 ${effortColor}`} />
        {r.suitableForBaby && <span>👶</span>}
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 space-y-1.5 border-t border-border pt-2"
        >
          <p className="text-[10px] text-muted-foreground">{r.description}</p>
          <p className="text-[10px]">
            <strong>Ingredients:</strong>{" "}
            {r.ingredients.map((i) => `${i.name} (${i.quantity}${i.unit})`).join(", ")}
          </p>
          <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={onToggleLock} className="rounded-md bg-muted p-1 hover:bg-muted/80" title={meal.locked ? "Unlock" : "Lock"}>
              {meal.locked ? <Lock className="h-3 w-3 text-primary" /> : <Unlock className="h-3 w-3" />}
            </button>
            <button onClick={onRegenerate} className="rounded-md bg-muted p-1 hover:bg-muted/80" title="Regenerate">
              <RefreshCw className="h-3 w-3" />
            </button>
            <button onClick={onSwap} className="rounded-md bg-muted p-1 hover:bg-muted/80" title="Swap">
              <ArrowRightLeft className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
