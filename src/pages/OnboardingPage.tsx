import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Preferences, DEFAULT_PREFERENCES, DietStyle, DIET_LABELS, DIET_EMOJIS } from "@/types";
import { savePreferences, setOnboarded } from "@/store/preferences";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const STEPS = ["Family", "Diet", "Taste", "Schedule", "Baby"];

const CUISINES = ["Italian", "Asian", "Indian", "Mexican", "Dutch", "Greek", "American", "Middle Eastern"];
const COMMON_DISLIKES = ["Mushrooms", "Olives", "Cilantro", "Seafood", "Eggplant", "Tofu", "Spicy food"];
const ALLERGENS = ["Dairy", "Gluten", "Nuts", "Eggs", "Soy", "Fish"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>({ ...DEFAULT_PREFERENCES });

  const update = (partial: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...partial }));

  const toggleArray = (field: "cuisinePreferences" | "dislikes" | "babyAllergens", value: string) => {
    const arr = prefs[field];
    update({ [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } as any);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };
  const back = () => setStep(Math.max(0, step - 1));

  const finish = () => {
    savePreferences(prefs);
    setOnboarded();
    navigate("/planner");
  };

  const chipClass = (active: boolean) =>
    `rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all cursor-pointer select-none ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-primary/40"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                i <= step ? "w-10 bg-primary" : "w-6 bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            {step === 0 && (
              <div>
                <h2 className="mb-2 text-2xl">👨‍👩‍👶 Your family</h2>
                <p className="mb-6 text-sm text-muted-foreground">Who are we cooking for?</p>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Adults</span>
                    <input
                      type="number" min={1} max={6} value={prefs.adultsCount}
                      onChange={(e) => update({ adultsCount: +e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Children / babies</span>
                    <input
                      type="number" min={0} max={6} value={prefs.childrenCount}
                      onChange={(e) => update({ childrenCount: +e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-2 text-2xl">🥗 Diet style</h2>
                <p className="mb-6 text-sm text-muted-foreground">Pick what fits your family best.</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(DIET_LABELS) as DietStyle[]).map((d) => (
                    <button key={d} className={chipClass(prefs.dietStyle === d)} onClick={() => update({ dietStyle: d })}>
                      {DIET_EMOJIS[d]} {DIET_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-2 text-2xl">😋 Taste</h2>
                <p className="mb-4 text-sm text-muted-foreground">Pick cuisines you enjoy & things you'd rather avoid.</p>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Favourite cuisines</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {CUISINES.map((c) => (
                    <button key={c} className={chipClass(prefs.cuisinePreferences.includes(c))} onClick={() => toggleArray("cuisinePreferences", c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dislikes</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DISLIKES.map((d) => (
                    <button key={d} className={chipClass(prefs.dislikes.includes(d))} onClick={() => toggleArray("dislikes", d)}>
                      {d}
                    </button>
                  ))}
                </div>
                <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spice level</p>
                <div className="flex gap-2">
                  {(["mild", "medium", "spicy"] as const).map((s) => (
                    <button key={s} className={chipClass(prefs.spiceLevel === s)} onClick={() => update({ spiceLevel: s })}>
                      {s === "mild" ? "🌶️ Mild" : s === "medium" ? "🌶️🌶️ Medium" : "🔥 Spicy"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="mb-2 text-2xl">⏰ Schedule</h2>
                <p className="mb-6 text-sm text-muted-foreground">How much time and energy do you have?</p>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Max cooking time per meal</span>
                    <div className="flex gap-2">
                      {[15, 20, 30, 45, 60].map((t) => (
                        <button key={t} className={chipClass(prefs.cookingTimeLimit === t)} onClick={() => update({ cookingTimeLimit: t })}>
                          {t}min
                        </button>
                      ))}
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Days cooking per week</span>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6, 7].map((d) => (
                        <button key={d} className={chipClass(prefs.daysCookingPerWeek === d)} onClick={() => update({ daysCookingPerWeek: d })}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Budget</span>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as const).map((b) => (
                        <button key={b} className={chipClass(prefs.budgetLevel === b)} onClick={() => update({ budgetLevel: b })}>
                          {b === "low" ? "💰 Budget" : b === "medium" ? "💰💰 Normal" : "💰💰💰 Premium"}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="mb-2 text-2xl">👶 Baby</h2>
                <p className="mb-6 text-sm text-muted-foreground">Tell us about your little one.</p>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={prefs.babyEatingSolids} onChange={(e) => update({ babyEatingSolids: e.target.checked })}
                      className="h-5 w-5 rounded border-input accent-primary" />
                    <span className="text-sm font-medium">Baby is eating solid food</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={prefs.babySharesMeals} onChange={(e) => update({ babySharesMeals: e.target.checked })}
                      className="h-5 w-5 rounded border-input accent-primary" />
                    <span className="text-sm font-medium">Baby shares parts of our meals</span>
                  </label>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allergens to avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGENS.map((a) => (
                        <button key={a} className={chipClass(prefs.babyAllergens.includes(a))} onClick={() => toggleArray("babyAllergens", a)}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={next} className="gap-1">
            {step === STEPS.length - 1 ? (
              <>Done <Check className="h-4 w-4" /></>
            ) : (
              <>Next <ChevronRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
