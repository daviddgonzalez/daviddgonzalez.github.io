import { ThemeToggle } from "@/theme/ThemeToggle";

const LINKS = [
  ["About", "#about"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
] as const;

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur border-b border-current/10 bg-bg/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#top" className="font-display font-bold text-fg">David Gonzalez</a>
        <div className="flex items-center gap-5">
          <ul className="hidden gap-5 text-sm text-muted sm:flex">
            {LINKS.map(([label, href]) => (
              <li key={href}><a href={href} className="hover:text-accent">{label}</a></li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
