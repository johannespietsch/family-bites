import { useParams, useNavigate } from "react-router-dom";
import { SEED_RECIPES } from "@/data/recipes";
import { DIET_LABELS, DIET_EMOJIS } from "@/types";
import { ArrowLeft, Clock, ChefHat, Baby, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipe = SEED_RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <p className="text-lg text-muted-foreground">Recipe not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary underline">Go back</button>
      </div>
    );
  }

  const effortColor =
    recipe.effortLevel === "easy" ? "text-primary" : recipe.effortLevel === "medium" ? "text-honey" : "text-accent";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <h1 className="font-display text-2xl font-bold leading-tight text-foreground">{recipe.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{recipe.description}</p>

      {/* Meta badges */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          <Clock className="h-3.5 w-3.5" /> {recipe.cookingTimeMinutes} min
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium ${effortColor}`}>
          <ChefHat className="h-3.5 w-3.5" /> {recipe.effortLevel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          <UtensilsCrossed className="h-3.5 w-3.5" /> {recipe.cuisine}
        </span>
        {recipe.suitableForBaby && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Baby className="h-3.5 w-3.5" /> Baby-friendly
          </span>
        )}
      </div>

      {/* Diet style tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {recipe.dietStyles.map((ds) => (
          <Badge key={ds} variant="secondary" className="text-[11px]">
            {DIET_EMOJIS[ds]} {DIET_LABELS[ds]}
          </Badge>
        ))}
      </div>

      {/* Ingredients */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">Ingredients</h2>
        <ul className="mt-3 space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline justify-between border-b border-border pb-2 text-sm">
              <span>{ing.name}</span>
              <span className="text-muted-foreground">
                {ing.quantity} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Instructions */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">Instructions</h2>
        <ol className="mt-3 space-y-4">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </span>
              <p className="pt-0.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
