import { Preferences, DEFAULT_PREFERENCES } from "@/types";

const STORAGE_KEY = "family-meals-preferences";
const ONBOARDED_KEY = "family-meals-onboarded";

export function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_PREFERENCES };
}

export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function isOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === "true";
}

export function setOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, "true");
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDED_KEY);
  localStorage.removeItem(STORAGE_KEY);
}
