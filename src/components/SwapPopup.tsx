import { motion } from "framer-motion";
import { Meal, Recipe } from "@/types";
import { X, Clock, ChefHat } from "lucide-react";

interface SwapPopupProps {
  meal: Meal;
  alternatives: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

export default function SwapPopup({ meal, alternatives, onSelect, onClose }: SwapPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Swap meal</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Replacing <strong>{meal.recipe.title}</strong>
        </p>

        {alternatives.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alternatives found. Try changing your diet style.</p>
        ) : (
          <div className="space-y-2">
            {alternatives.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="w-full rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <p className="mb-1 font-display text-sm font-bold">{r.title}</p>
                <p className="mb-1 text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {r.cookingTimeMinutes}m
                  <ChefHat className="h-3 w-3" /> {r.effortLevel}
                  {r.suitableForBaby && <span>👶</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
