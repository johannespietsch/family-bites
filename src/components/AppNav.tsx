import { Link, useLocation } from "react-router-dom";
import { UtensilsCrossed, ShoppingCart, Settings, CalendarDays } from "lucide-react";

const NAV_ITEMS = [
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/shopping", label: "Shopping", icon: ShoppingCart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppNav() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <UtensilsCrossed className="h-5 w-5" />
          <span>FamilyBites</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
