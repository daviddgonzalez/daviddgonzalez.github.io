import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useActiveSection } from "@/components/useActiveSection";

const LINKS = [
  ["About", "#about"],
  ["Education", "#education"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
] as const;

const SECTION_IDS = LINKS.map(([, href]) => href.slice(1));

export function Nav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  return (
    <nav className="sticky top-0 z-50 border-b border-current/10 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#top" className="font-display font-bold text-fg">David Gonzalez</a>
        <div className="flex items-center gap-4">
          <ul className="hidden gap-5 text-sm sm:flex">
            {LINKS.map(([label, href]) => {
              const isActive = href.slice(1) === active;
              return (
                <li key={href}>
                  <a
                    href={href}
                    aria-current={isActive ? "true" : undefined}
                    className={`transition-colors hover:text-accent ${isActive ? "font-medium text-accent" : "text-muted"}`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
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
        <ul className="border-t border-current/10 bg-bg/95 px-6 py-3 text-sm sm:hidden">
          {LINKS.map(([label, href]) => {
            const isActive = href.slice(1) === active;
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={isActive ? "true" : undefined}
                  className={`block py-2 transition-colors hover:text-accent ${isActive ? "font-medium text-accent" : "text-muted"}`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
