import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/theme/ThemeToggle";

const LINKS = [
  ["About", "#about"],
  ["Education", "#education"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-current/10 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#top" className="font-display font-bold text-fg">David Gonzalez</a>
        <div className="flex items-center gap-4">
          <ul className="hidden gap-5 text-sm text-muted sm:flex">
            {LINKS.map(([label, href]) => (
              <li key={href}><a href={href} className="hover:text-accent">{label}</a></li>
            ))}
          </ul>
          <ThemeToggle />
          <button
            type="button"
            className="text-fg sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <ul className="border-t border-current/10 bg-bg/95 px-6 py-3 text-sm text-muted sm:hidden">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
