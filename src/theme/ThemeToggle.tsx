import { Blocks, Moon } from "lucide-react";
import { useTheme } from "./useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLego = theme === "lego";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLego}
      aria-label={isLego ? "Switch to Default theme" : "Switch to Lego theme"}
      className="tactile inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-brand)] border border-current/20 px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:border-current/40 hover:text-accent"
    >
      {isLego ? <Moon size={16} /> : <Blocks size={16} />}
      <span>{isLego ? "Default" : "Lego"}</span>
    </button>
  );
}
