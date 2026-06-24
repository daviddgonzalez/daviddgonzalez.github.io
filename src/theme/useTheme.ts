import { createContext, useContext } from "react";

export type Theme = "default" | "lego";
export const THEME_STORAGE_KEY = "portfolio-theme";
export const THEMES: Theme[] = ["default", "lego"];

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export function isTheme(value: unknown): value is Theme {
  return value === "default" || value === "lego";
}
