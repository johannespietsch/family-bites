import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { loadPreferences, savePreferences, resetOnboarding } from "@/store/preferences";
import {
  Preferences, DietStyle, DIET_LABELS, DIET_EMOJIS,
} from "@/types";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const CUISINES = ["Italian", "Asian", "Indian", "Mexican", "Dutch", "Greek", "American", "Middle Eastern"];
const COMMON_DISLIKES = ["Mushrooms", "Olives", "Cilantro", "Seafood", "Eggplant", "Tofu", "Spicy food"];
const ALLERGENS = ["Dairy", "Gluten", "Nuts", "Eggs", "Soy", "Fish"];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences());

  const update = (partial: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...partial }));

  const toggleArray = (field: "cuisinePreferences" | "dislikes" | "babyAllergens", value: string) => {
    const arr = prefs[field];
    update({ [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] } as any);
  };

  const chipClass = (active: boolean) =>
    `rounded-xl border-2 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-primary/40"
    }`;

  const handleSave = () => {
    savePreferences(prefs);
    toast.success("Preferences saved!");
  };

  const handleReset = () => {
    resetOnboarding();
    window.location.href = "/onboarding";
  };

  return (
    <div className="container max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl">Settings</h1>

      <div className="space-y-8">
        {/* Family */}
        <Section title="👨‍👩‍👶 Family">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Adults</span>
              <input type="number" min={1} max={6} value={prefs.adultsCount}
                onChange={(e) => update({ adultsCount: +e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">Children</span>
              <input type="number" min={0} max={6} value={prefs.childrenCount}
                onChange={(e) => update({ childrenCount: +e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" />
            </label>
          </div>
        </Section>

        {/* Diet */}
        <Section title="🥗 Diet style">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIET_LABELS) as DietStyle[]).map((d) => (
              <button key={d} className={chipClass(prefs.dietStyle === d)} onClick={() => update({ dietStyle: d })}>
                {DIET_EMOJIS[d]} {DIET_LABELS[d]}
              </button>
            ))}
          </div>
        </Section>

        {/* Taste */}
        <Section title="😋 Taste preferences">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cuisines</p>
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
        </Section>

        {/* Schedule */}
        <Section title="⏰ Schedule">
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-xs font-medium">Max cooking time</span>
              <div className="flex gap-2">
                {[15, 20, 30, 45, 60].map((t) => (
                  <button key={t} className={chipClass(prefs.cookingTimeLimit === t)} onClick={() => update({ cookingTimeLimit: t })}>
                    {t}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium">Budget</span>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((b) => (
                  <button key={b} className={chipClass(prefs.budgetLevel === b)} onClick={() => update({ budgetLevel: b })}>
                    {b === "low" ? "💰 Budget" : b === "medium" ? "💰💰 Normal" : "💰💰💰 Premium"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Baby */}
        <Section title="👶 Baby">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={prefs.babyEatingSolids} onChange={(e) => update({ babyEatingSolids: e.target.checked })}
                className="h-4 w-4 rounded accent-primary" />
              <span className="text-sm">Eating solids</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={prefs.babySharesMeals} onChange={(e) => update({ babySharesMeals: e.target.checked })}
                className="h-4 w-4 rounded accent-primary" />
              <span className="text-sm">Shares family meals</span>
            </label>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allergens</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a) => (
                  <button key={a} className={chipClass(prefs.babyAllergens.includes(a))} onClick={() => toggleArray("babyAllergens", a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Picnic */}
        <Section title="🛒 Picnic Connection">
          <div className="rounded-xl border-2 border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Picnic integration requires a backend connection.
              Enable Lovable Cloud to securely store your Picnic credentials and sync your shopping cart.
            </p>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="h-4 w-4" /> Save preferences
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5"
    >
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      {children}
    </motion.section>
  );
}
