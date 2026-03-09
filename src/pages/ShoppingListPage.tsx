import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingItem } from "@/types";
import { Check, ShoppingCart, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("family-meals-shopping");
    if (stored) {
      try { setItems(JSON.parse(stored)); } catch {}
    }
  }, []);

  const togglePantry = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inPantry: !item.inPantry } : item))
    );
  };

  const toBuy = items.filter((i) => !i.inPantry);
  const inPantry = items.filter((i) => i.inPantry);

  const handlePrint = () => window.print();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="mb-2 text-xl font-bold">No shopping list yet</h2>
        <p className="text-sm text-muted-foreground">Generate a meal plan first, then create your shopping list.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Shopping List</h1>
          <p className="text-sm text-muted-foreground">{toBuy.length} items to buy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* To buy */}
      <div className="space-y-1.5">
        {toBuy.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => togglePantry(item.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-all hover:border-primary/30"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-border">
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.ingredientName}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {item.quantity} {item.unit}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Already have */}
      {inPantry.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ✅ Already have ({inPantry.length})
          </p>
          <div className="space-y-1">
            {inPantry.map((item) => (
              <button
                key={item.id}
                onClick={() => togglePantry(item.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-muted/50 px-4 py-2.5 text-left opacity-60 transition-all hover:opacity-80"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-primary bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
                <p className="flex-1 text-sm line-through">{item.ingredientName}</p>
                <span className="text-xs text-muted-foreground">
                  {item.quantity} {item.unit}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Picnic placeholder */}
      <div className="mt-8 rounded-2xl border-2 border-dashed border-border p-6 text-center">
        <p className="mb-1 text-sm font-medium text-muted-foreground">🛒 Picnic Integration</p>
        <p className="text-xs text-muted-foreground">
          Connect your Picnic account in Settings to send items directly to your cart.
        </p>
      </div>
    </div>
  );
}
