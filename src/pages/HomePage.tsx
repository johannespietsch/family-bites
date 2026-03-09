import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChefHat, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isOnboarded } from "@/store/preferences";

const FEATURES = [
  { icon: ChefHat, title: "Smart meal plans", desc: "Weekly plans tailored to your family's taste and diet." },
  { icon: Heart, title: "Baby-friendly", desc: "Mark meals safe for your little one." },
  { icon: ShoppingBag, title: "Auto shopping list", desc: "One click to generate a complete list." },
  { icon: Sparkles, title: "Zero stress", desc: "Simplified mode when life gets overwhelming." },
];

export default function HomePage() {
  const onboarded = isOnboarded();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            For busy families 🍳
          </p>
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Meal planning,{" "}
            <span className="text-primary">without the stress</span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
            Generate a healthy weekly meal plan for your family in seconds.
            Respects your diet, your baby's needs, and your schedule.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {onboarded ? (
              <Button asChild size="lg" className="text-base font-semibold px-8">
                <Link to="/planner">Start planning this week →</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="text-base font-semibold px-8">
                <Link to="/onboarding">Get started →</Link>
              </Button>
            )}
            {onboarded && (
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/settings">Edit preferences</Link>
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sage-light">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 font-display text-base font-bold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
