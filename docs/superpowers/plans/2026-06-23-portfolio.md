# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page software-engineer portfolio for recruiters with a switchable two-theme system (professional Default + playful Lego), where the Lego theme decorates whitespace with bricks/minifigures and renders per-project/per-role builds as hand-authored SVG.

**Architecture:** Vite + React + TypeScript SPA. Theming is driven by a `data-theme` attribute on `<html>` that swaps a full set of CSS custom properties (consumed by Tailwind v4 `@theme` and shadcn/ui tokens). A `ThemeProvider` owns state + `localStorage` persistence; a pre-paint inline script prevents theme flash. Content lives in typed data files; sections render from data. Lego illustrations are composable SVG React components resolved per item through a registry with a fallback.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest + React Testing Library, jsdom.

---

## File Structure

```
index.html                      # includes pre-paint theme script
public/resume.pdf               # David's resume (moved from repo root)
src/
  main.tsx                      # mounts <App/>
  App.tsx                       # ThemeProvider + Nav + sections
  index.css                     # Tailwind entry + base
  theme/
    themes.css                  # per-theme CSS variable definitions + @theme
    ThemeProvider.tsx           # context, persistence, data-theme attribute
    useTheme.ts                 # hook + types
    ThemeToggle.tsx             # nav toggle control
  content/
    types.ts                    # Project, Role, Skill, Profile, BuildKey
    profile.ts                  # name, role, tagline, bio, socials, resumeUrl
    projects.ts                 # Project[]
    experience.ts               # Role[]
    skills.ts                   # Skill[]
  lego/
    Stud.tsx                    # primitive
    Brick.tsx                   # primitive
    Minifigure.tsx              # primitive
    builds/
      LegoComputer.tsx
      LegoPhone.tsx
      BrickLogo.tsx
      BrickStack.tsx            # fallback build
    registry.ts                 # BuildKey -> component, with fallback
  components/
    Nav.tsx
    Section.tsx
    DecorationLayer.tsx
    ProjectCard.tsx
    RoleCard.tsx
  sections/
    Hero.tsx
    About.tsx
    Projects.tsx
    Experience.tsx
    Skills.tsx
    Contact.tsx
  test/
    setup.ts                    # RTL/jsdom setup
```

---

### Task 0: Project scaffold & tooling

**Goal:** A running Vite + React + TS app with Tailwind v4, shadcn/ui initialized, a working Vitest test runner, git initialized, and the resume in `public/`.

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`, `.gitignore`, `components.json` (shadcn)
- Move: `David_Gonzalez_28.pdf` → `public/resume.pdf`

**Acceptance Criteria:**
- [ ] `npm run dev` serves the app with a visible "Portfolio" heading.
- [ ] `npm run test` runs Vitest and passes a trivial smoke test.
- [ ] Tailwind utility classes apply (e.g. a `text-3xl` heading renders large).
- [ ] `public/resume.pdf` exists; original root PDF removed.
- [ ] `git status` works; `.superpowers/`, `node_modules/`, `dist/` are ignored.

**Verify:** `npm run test` → 1 passed; `npm run build` → succeeds.

**Steps:**

- [ ] **Step 1: Scaffold Vite React-TS app in place**

```bash
cd ~/projects/portfolio
npm create vite@latest . -- --template react-ts
npm install
```
If prompted about the non-empty directory (docs/, the PDF), choose "Ignore files and continue".

- [ ] **Step 2: Install Tailwind v4, testing libs, shadcn deps**

```bash
npm install tailwindcss @tailwindcss/vite
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Wire Tailwind v4 + Vitest into `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 4: Add path alias to `tsconfig.json`** (merge into `compilerOptions`)

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

- [ ] **Step 5: Tailwind entry in `src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 6: Test setup `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 7: Minimal `src/App.tsx` and `src/main.tsx`**

```tsx
// src/App.tsx
export default function App() {
  return <h1 className="text-3xl font-bold">Portfolio</h1>;
}
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 8: Smoke test `src/App.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders portfolio heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /portfolio/i })).toBeInTheDocument();
});
```

- [ ] **Step 9: Add test script to `package.json`** (`"test": "vitest run"`, `"test:watch": "vitest"`).

- [ ] **Step 10: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```
Accept defaults; this creates `components.json` and a `lib/utils.ts`. If it conflicts with `src/index.css`, keep the `@import "tailwindcss";` line.

- [ ] **Step 11: `.gitignore`, move resume, git init**

```bash
printf "node_modules\ndist\n.superpowers/\n*.local\n.DS_Store\n" >> .gitignore
mkdir -p public && mv David_Gonzalez_28.pdf public/resume.pdf
git init && git add -A && git commit -m "chore: scaffold vite+react+ts portfolio with tailwind, shadcn, vitest"
```

- [ ] **Step 12: Verify** — `npm run test` → 1 passed; `npm run dev` shows the heading.

---

### Task 1: Theme tokens (CSS variables for both themes)

**Goal:** Define every themeable value as CSS custom properties under `[data-theme="default"]` and `[data-theme="lego"]`, mapped into Tailwind v4 via `@theme`.

**Files:**
- Create: `src/theme/themes.css`
- Modify: `src/index.css` (import themes)

**Acceptance Criteria:**
- [ ] Setting `document.documentElement.dataset.theme` to `"default"` vs `"lego"` changes `--color-bg`, `--color-accent`, `--font-display`.
- [ ] Tailwind classes `bg-bg`, `text-fg`, `text-accent`, `font-display` resolve to the theme variables.
- [ ] Default theme is dark; Lego theme background is warm yellow.

**Verify:** `npm run build` succeeds; manual: toggling the attribute in devtools recolors the page.

**Steps:**

- [ ] **Step 1: `src/theme/themes.css`** — define tokens per theme and expose to Tailwind.

```css
/* Default theme (professional, dark, dot-grid) */
[data-theme="default"] {
  --color-bg: #0a0b0f;
  --color-surface: #14161c;
  --color-fg: #f5f6f8;
  --color-muted: #9aa0ab;
  --color-accent: #5b8cff;
  --font-display: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", sans-serif;
  --font-body: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --radius-brand: 10px;
  /* Background treatment: subtle dot grid */
  --bg-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
  --bg-size: 18px 18px;
}

/* Lego theme (playful, yellow play-table) */
[data-theme="lego"] {
  --color-bg: #f7c400;
  --color-surface: #fffdf5;
  --color-fg: #1a1a1a;
  --color-muted: #5a4a00;
  --color-accent: #d01012;
  --font-display: Verdana, Geneva, "DejaVu Sans", sans-serif;
  --font-body: Verdana, Geneva, sans-serif;
  --radius-brand: 6px;
  --bg-image: radial-gradient(circle at 50% 35%, rgba(255,255,255,0.22), transparent 60%);
  --bg-size: cover;
}

/* Map CSS vars into Tailwind v4 utilities */
@theme inline {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-fg: var(--color-fg);
  --color-muted: var(--color-muted);
  --color-accent: var(--color-accent);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
}
```

- [ ] **Step 2: Import + base body styling in `src/index.css`**

```css
@import "tailwindcss";
@import "./theme/themes.css";

html { color-scheme: dark; }
body {
  background-color: var(--color-bg);
  background-image: var(--bg-image);
  background-size: var(--bg-size);
  color: var(--color-fg);
  font-family: var(--font-body);
}
@media (prefers-reduced-motion: no-preference) {
  body { transition: background-color 0.3s ease, color 0.3s ease; }
}
```

- [ ] **Step 3: Default attribute on `index.html`** — set `<html lang="en" data-theme="default">` so styles apply before JS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(theme): add default and lego theme tokens as css variables"
```

---

### Task 2: ThemeProvider, useTheme, persistence

**Goal:** A React context that holds the current theme, persists it to `localStorage`, writes `data-theme` to `<html>`, and falls back to `default` for missing/invalid values.

**Files:**
- Create: `src/theme/useTheme.ts`, `src/theme/ThemeProvider.tsx`, `src/theme/ThemeProvider.test.tsx`

**Acceptance Criteria:**
- [ ] `useTheme()` outside a provider throws a clear error.
- [ ] With no stored value, theme defaults to `"default"`.
- [ ] An invalid stored value falls back to `"default"`.
- [ ] A valid stored value (`"lego"`) is restored on mount.
- [ ] `toggle()` flips default↔lego; `setTheme` sets explicitly.
- [ ] Changing theme updates `localStorage["portfolio-theme"]` and `document.documentElement.dataset.theme`.

**Verify:** `npm run test src/theme/ThemeProvider.test.tsx` → all pass.

**Steps:**

- [ ] **Step 1: Types + hook `src/theme/useTheme.ts`**

```ts
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
```

- [ ] **Step 2: Failing tests `src/theme/ThemeProvider.test.tsx`**

```tsx
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme, THEME_STORAGE_KEY } from "./useTheme";

function Probe() {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setTheme("lego")}>set-lego</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

test("defaults to 'default' with no stored value", () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("default");
  expect(document.documentElement.dataset.theme).toBe("default");
});

test("restores a valid stored theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "lego");
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("lego");
});

test("falls back to default for invalid stored theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "neon");
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("default");
});

test("toggle flips theme and persists", async () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  await userEvent.click(screen.getByText("toggle"));
  expect(screen.getByTestId("theme")).toHaveTextContent("lego");
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("lego");
  expect(document.documentElement.dataset.theme).toBe("lego");
});

test("setTheme sets explicitly", async () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  await userEvent.click(screen.getByText("set-lego"));
  expect(screen.getByTestId("theme")).toHaveTextContent("lego");
});

test("useTheme throws outside provider", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow(/within a ThemeProvider/);
  spy.mockRestore();
});
```

- [ ] **Step 3: Run tests → FAIL** (`ThemeProvider` not implemented). `npm run test src/theme/ThemeProvider.test.tsx`.

- [ ] **Step 4: Implement `src/theme/ThemeProvider.tsx`**

```tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext, THEME_STORAGE_KEY, isTheme, type Theme } from "./useTheme";

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return "default";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "default" ? "lego" : "default")),
    []
  );

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
```

- [ ] **Step 5: Run tests → PASS.** Wrap `<App/>` in `<ThemeProvider>` in `src/main.tsx`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(theme): ThemeProvider with persistence and data-theme attribute"
```

---

### Task 3: Pre-paint anti-FOUC script

**Goal:** Set `data-theme` from `localStorage` before first paint so there is no flash of the wrong theme.

**Files:**
- Modify: `index.html`

**Acceptance Criteria:**
- [ ] An inline `<script>` in `<head>` reads `localStorage["portfolio-theme"]` and sets `documentElement.dataset.theme`, defaulting to `"default"`.
- [ ] The storage key string matches `THEME_STORAGE_KEY` from Task 2.

**Verify:** Manual — set `localStorage.setItem('portfolio-theme','lego')`, reload; page paints yellow immediately (no dark flash).

**Steps:**

- [ ] **Step 1: Add inline script to `<head>` in `index.html`** (before the module script).

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("portfolio-theme");
      document.documentElement.dataset.theme = (t === "lego" || t === "default") ? t : "default";
    } catch (e) {
      document.documentElement.dataset.theme = "default";
    }
  })();
</script>
```

- [ ] **Step 2: Commit**

```bash
git add index.html && git commit -m "feat(theme): pre-paint script to prevent theme flash"
```

---

### Task 4: ThemeToggle control

**Goal:** A nav control that shows the current theme and switches it via `useTheme`.

**Files:**
- Create: `src/theme/ThemeToggle.tsx`, `src/theme/ThemeToggle.test.tsx`

**Acceptance Criteria:**
- [ ] Renders a button with an accessible name reflecting the action (e.g. "Switch to Lego theme").
- [ ] Clicking it calls `toggle` (theme value changes).
- [ ] Has `aria-pressed` reflecting whether Lego is active.

**Verify:** `npm run test src/theme/ThemeToggle.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/theme/ThemeToggle.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => localStorage.clear());

test("toggles theme on click", async () => {
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const btn = screen.getByRole("button", { name: /lego theme/i });
  expect(btn).toHaveAttribute("aria-pressed", "false");
  await userEvent.click(btn);
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/theme/ThemeToggle.tsx`**

```tsx
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
      className="inline-flex items-center gap-2 rounded-[var(--radius-brand)] border border-current/20 px-3 py-1.5 text-sm font-medium text-fg hover:text-accent"
    >
      {isLego ? <Moon size={16} /> : <Blocks size={16} />}
      <span>{isLego ? "Default" : "Lego"}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(theme): ThemeToggle control"
```

---

### Task 5: Content model & data files

**Goal:** Typed content (Profile, Project, Role, Skill, BuildKey) and data files the user edits, including the resume link.

**Files:**
- Create: `src/content/types.ts`, `src/content/profile.ts`, `src/content/projects.ts`, `src/content/experience.ts`, `src/content/skills.ts`, `src/content/content.test.ts`

**Acceptance Criteria:**
- [ ] Types compile and every data file is typed against them.
- [ ] `profile.resumeUrl` points to `/resume.pdf`.
- [ ] Each `Project` declares a `legoBuild: BuildKey`; each `Role` may declare one.
- [ ] A test asserts data arrays are non-empty and every `legoBuild` is a known `BuildKey`.

**Verify:** `npm run test src/content/content.test.ts` → pass.

**Steps:**

- [ ] **Step 1: `src/content/types.ts`**

```ts
export type BuildKey = "computer" | "phone" | "brickLogo" | "stack";

export interface Social { github?: string; linkedin?: string; email: string; }
export interface Profile {
  name: string; role: string; tagline: string; bio: string;
  socials: Social; resumeUrl: string;
}
export interface Project {
  id: string; name: string; blurb: string; description: string;
  tech: string[]; links: { demo?: string; repo?: string }; legoBuild: BuildKey;
}
export interface Role {
  id: string; company: string; title: string; period: string;
  summary: string; legoBuild?: BuildKey;
}
export interface Skill { label: string; category: string; }

export const BUILD_KEYS: BuildKey[] = ["computer", "phone", "brickLogo", "stack"];
```

- [ ] **Step 2: `src/content/profile.ts`** (real basics; bio editable)

```ts
import type { Profile } from "./types";

export const profile: Profile = {
  name: "David Gonzalez",
  role: "Software Engineer",
  tagline: "Building reliable software that ships.",
  bio: "Software engineer focused on building clean, dependable products. Replace this with your own bio.",
  socials: {
    email: "daviddgonzalez56@gmail.com",
    github: "https://github.com/", // TODO: set your GitHub URL
    linkedin: "https://linkedin.com/in/", // TODO: set your LinkedIn URL
  },
  resumeUrl: "/resume.pdf",
};
```

- [ ] **Step 3: `src/content/projects.ts`** (sample entries the user replaces with real projects)

```ts
import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "devdash",
    name: "DevDash",
    blurb: "Real-time analytics dashboard for engineering teams.",
    description: "A dashboard surfacing deploy frequency, lead time, and incident metrics in real time.",
    tech: ["React", "TypeScript", "Node"],
    links: { demo: "#", repo: "#" },
    legoBuild: "computer",
  },
  {
    id: "brickui",
    name: "BrickUI",
    blurb: "A component library & design system, brick by brick.",
    description: "A themeable component library with accessible primitives and documentation.",
    tech: ["TypeScript", "Storybook"],
    links: { repo: "#" },
    legoBuild: "brickLogo",
  },
  {
    id: "gotrack",
    name: "GoTrack",
    blurb: "Mobile habit tracker with offline-first sync.",
    description: "A cross-platform habit tracker with conflict-free offline sync.",
    tech: ["Flutter", "SQLite"],
    links: { demo: "#", repo: "#" },
    legoBuild: "phone",
  },
];
```

- [ ] **Step 4: `src/content/experience.ts`** and `src/content/skills.ts`

```ts
// experience.ts
import type { Role } from "./types";
export const experience: Role[] = [
  {
    id: "role-1",
    company: "Your Company",
    title: "Software Engineer Intern",
    period: "2025",
    summary: "Replace with a real role: what you built and the impact.",
    legoBuild: "stack",
  },
];
```

```ts
// skills.ts
import type { Skill } from "./types";
export const skills: Skill[] = [
  { label: "TypeScript", category: "Languages" },
  { label: "Python", category: "Languages" },
  { label: "React", category: "Frontend" },
  { label: "Node.js", category: "Backend" },
  { label: "PostgreSQL", category: "Data" },
  { label: "Git", category: "Tools" },
];
```

- [ ] **Step 5: Test `src/content/content.test.ts`**

```ts
import { describe, expect, test } from "vitest";
import { BUILD_KEYS } from "./types";
import { profile } from "./profile";
import { projects } from "./projects";
import { experience } from "./experience";
import { skills } from "./skills";

describe("content", () => {
  test("profile links to the resume pdf", () => {
    expect(profile.resumeUrl).toBe("/resume.pdf");
  });
  test("data arrays are non-empty", () => {
    expect(projects.length).toBeGreaterThan(0);
    expect(experience.length).toBeGreaterThan(0);
    expect(skills.length).toBeGreaterThan(0);
  });
  test("every project legoBuild is a known key", () => {
    for (const p of projects) expect(BUILD_KEYS).toContain(p.legoBuild);
  });
  test("role legoBuilds, when set, are known keys", () => {
    for (const r of experience) if (r.legoBuild) expect(BUILD_KEYS).toContain(r.legoBuild);
  });
});
```

- [ ] **Step 6: Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(content): typed content model and data files"
```

---

### Task 6: Lego SVG primitives (Stud, Brick, Minifigure)

**Goal:** Reusable SVG components for the Lego visual language, decorative by default (`aria-hidden`).

**Files:**
- Create: `src/lego/Stud.tsx`, `src/lego/Brick.tsx`, `src/lego/Minifigure.tsx`, `src/lego/lego.test.tsx`

**Acceptance Criteria:**
- [ ] `Brick` renders an `<svg>` with the given `color` and a configurable number of studs.
- [ ] `Minifigure` renders an `<svg>`.
- [ ] All three set `aria-hidden="true"` and `focusable="false"` by default.

**Verify:** `npm run test src/lego/lego.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/lego/lego.test.tsx`**

```tsx
import { render } from "@testing-library/react";
import { Brick } from "./Brick";
import { Minifigure } from "./Minifigure";

test("Brick renders an aria-hidden svg with the given color", () => {
  const { container } = render(<Brick color="#d01012" studs={3} data-testid="b" />);
  const svg = container.querySelector("svg")!;
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector('[fill="#d01012"]')).toBeTruthy();
});

test("Minifigure renders an svg", () => {
  const { container } = render(<Minifigure />);
  expect(container.querySelector("svg")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/lego/Stud.tsx`**

```tsx
export function Stud({ x, y, color }: { x: number; y: number; color: string }) {
  return <ellipse cx={x} cy={y} rx={7} ry={3} fill={color} />;
}
```

- [ ] **Step 4: Implement `src/lego/Brick.tsx`**

```tsx
type BrickProps = {
  color?: string;
  studs?: number;
  width?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export function Brick({
  color = "#006cb7",
  studs = 2,
  width = 64,
  className,
  ...rest
}: BrickProps) {
  const height = 26;
  const studGap = width / (studs + 1);
  const lighter = shade(color, 0.18);
  return (
    <svg
      viewBox={`0 0 ${width} ${height + 6}`}
      width={width}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x={0} y={6} width={width} height={height} rx={3} fill={color} />
      <rect x={0} y={height - 1} width={width} height={7} rx={3} fill={shade(color, -0.2)} opacity={0.5} />
      {Array.from({ length: studs }).map((_, i) => (
        <ellipse key={i} cx={studGap * (i + 1)} cy={6} rx={7} ry={3} fill={lighter} />
      ))}
    </svg>
  );
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + Math.round(255 * amt));
  const g = clamp(((n >> 8) & 255) + Math.round(255 * amt));
  const b = clamp((n & 255) + Math.round(255 * amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
```

- [ ] **Step 5: Implement `src/lego/Minifigure.tsx`** (classic minifig; uses the SVG authored during brainstorming)

```tsx
export function Minifigure({ width = 90, className }: { width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 180" width={width} className={className} aria-hidden="true" focusable="false">
      <rect x="50" y="14" width="20" height="9" rx="2" fill="#e6bd00" />
      <ellipse cx="60" cy="14" rx="10" ry="4" fill="#ffe04d" />
      <rect x="40" y="20" width="40" height="38" rx="11" fill="#ffd21f" />
      <circle cx="52" cy="38" r="3" fill="#1a1a1a" />
      <circle cx="68" cy="38" r="3" fill="#1a1a1a" />
      <path d="M50 45 Q60 54 70 45" stroke="#1a1a1a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <rect x="53" y="57" width="14" height="7" fill="#e6bd00" />
      <path d="M45 67 C30 72 25 90 27 106 L41 106 C41 92 45 80 52 74 Z" fill="#b20d10" />
      <path d="M75 67 C90 72 95 90 93 106 L79 106 C79 92 75 80 68 74 Z" fill="#b20d10" />
      <circle cx="29" cy="110" r="8" fill="#ffd21f" />
      <circle cx="91" cy="110" r="8" fill="#ffd21f" />
      <path d="M44 64 L76 64 L84 116 L36 116 Z" fill="#d01012" />
      <rect x="38" y="116" width="44" height="15" rx="3" fill="#163a82" />
      <rect x="40" y="130" width="18" height="42" rx="2" fill="#1c54a8" />
      <rect x="62" y="130" width="18" height="42" rx="2" fill="#1c54a8" />
    </svg>
  );
}
```

- [ ] **Step 6: Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(lego): Stud, Brick, and Minifigure SVG primitives"
```

---

### Task 7: Lego build components & registry

**Goal:** Per-project/per-role build illustrations and a registry that resolves `BuildKey → component` with a guaranteed fallback.

**Files:**
- Create: `src/lego/builds/LegoComputer.tsx`, `src/lego/builds/LegoPhone.tsx`, `src/lego/builds/BrickLogo.tsx`, `src/lego/builds/BrickStack.tsx`, `src/lego/registry.ts`, `src/lego/registry.test.tsx`

**Acceptance Criteria:**
- [ ] `getBuild(key)` returns the matching component for each known key.
- [ ] `getBuild(unknownKey)` returns the `BrickStack` fallback (never undefined).
- [ ] Each build renders an `<svg>`.

**Verify:** `npm run test src/lego/registry.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/lego/registry.test.tsx`**

```tsx
import { render } from "@testing-library/react";
import { getBuild } from "./registry";

test("resolves each known build key to an svg component", () => {
  for (const key of ["computer", "phone", "brickLogo", "stack"] as const) {
    const Build = getBuild(key);
    const { container } = render(<Build />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  }
});

test("falls back to BrickStack for unknown keys", () => {
  // @ts-expect-error testing runtime fallback
  const Build = getBuild("nope");
  const { container } = render(<Build />);
  expect(container.querySelector("svg")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: `LegoComputer.tsx`** (from the approved SVG)

```tsx
export function LegoComputer({ width = 150 }: { width?: number }) {
  return (
    <svg viewBox="0 0 180 150" width={width} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lc-scr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d3b66" />
          <stop offset="1" stopColor="#2a8fd4" />
        </linearGradient>
      </defs>
      <rect x="58" y="128" width="64" height="11" rx="3" fill="#2c3036" />
      <rect x="84" y="112" width="12" height="18" fill="#3a3f47" />
      <g fill="#565d68">
        <ellipse cx="52" cy="26" rx="9" ry="3.4" /><ellipse cx="78" cy="26" rx="9" ry="3.4" />
        <ellipse cx="104" cy="26" rx="9" ry="3.4" /><ellipse cx="130" cy="26" rx="9" ry="3.4" />
      </g>
      <rect x="30" y="30" width="120" height="82" rx="6" fill="#3a3f47" />
      <rect x="40" y="40" width="100" height="62" rx="3" fill="url(#lc-scr)" />
      <rect x="48" y="50" width="56" height="5" rx="2.5" fill="#fff" opacity="0.85" />
      <rect x="48" y="60" width="38" height="5" rx="2.5" fill="#fff" opacity="0.6" />
      <rect x="48" y="70" width="66" height="5" rx="2.5" fill="#fff" opacity="0.45" />
      <rect x="48" y="80" width="30" height="5" rx="2.5" fill="#ffd21f" opacity="0.9" />
    </svg>
  );
}
```

- [ ] **Step 4: `LegoPhone.tsx`**

```tsx
export function LegoPhone({ width = 90 }: { width?: number }) {
  return (
    <svg viewBox="0 0 70 110" width={width} aria-hidden="true" focusable="false">
      <rect x="12" y="6" width="46" height="98" rx="9" fill="#2f9e44" />
      <ellipse cx="27" cy="8" rx="6" ry="3" fill="#54bf69" />
      <ellipse cx="43" cy="8" rx="6" ry="3" fill="#54bf69" />
      <rect x="18" y="14" width="34" height="74" rx="3" fill="#eaf4ff" />
      <rect x="24" y="22" width="22" height="5" rx="2.5" fill="#cfe0f5" />
      <rect x="24" y="31" width="16" height="5" rx="2.5" fill="#cfe0f5" />
      <rect x="27" y="46" width="16" height="16" rx="4" fill="#d01012" />
    </svg>
  );
}
```

- [ ] **Step 5: `BrickLogo.tsx`** (brick-mosaic heart from a 5×5 grid)

```tsx
const HEART = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];
export function BrickLogo({ size = 100, color = "#d01012" }: { size?: number; color?: string }) {
  const cell = size / 5;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} aria-hidden="true" focusable="false">
      {HEART.flatMap((row, r) =>
        row.map((on, c) =>
          on ? (
            <g key={`${r}-${c}`}>
              <rect x={c * cell + 2} y={r * cell + 2} width={cell - 4} height={cell - 4} rx={3} fill={color} />
              <ellipse cx={c * cell + cell / 2} cy={r * cell + 6} rx={cell / 5} ry={cell / 12} fill="#fff" opacity={0.3} />
            </g>
          ) : null
        )
      )}
    </svg>
  );
}
```

- [ ] **Step 6: `BrickStack.tsx`** (fallback — a small pile reusing `Brick`)

```tsx
import { Brick } from "../Brick";
export function BrickStack({ width = 90 }: { width?: number }) {
  return (
    <div style={{ width }} aria-hidden="true">
      <div style={{ transform: "rotate(-3deg)" }}><Brick color="#006cb7" studs={3} width={width} /></div>
      <div style={{ transform: "rotate(2deg)", marginTop: -4, marginLeft: 8 }}><Brick color="#d01012" studs={2} width={width * 0.7} /></div>
      <div style={{ transform: "rotate(-1deg)", marginTop: -4 }}><Brick color="#f6a700" studs={3} width={width * 0.85} /></div>
    </div>
  );
}
```

- [ ] **Step 7: `registry.ts`**

```tsx
import type { BuildKey } from "@/content/types";
import { LegoComputer } from "./builds/LegoComputer";
import { LegoPhone } from "./builds/LegoPhone";
import { BrickLogo } from "./builds/BrickLogo";
import { BrickStack } from "./builds/BrickStack";

type BuildComponent = React.ComponentType<Record<string, never>>;

const REGISTRY: Record<BuildKey, BuildComponent> = {
  computer: LegoComputer as BuildComponent,
  phone: LegoPhone as BuildComponent,
  brickLogo: BrickLogo as BuildComponent,
  stack: BrickStack as BuildComponent,
};

export function getBuild(key: BuildKey): BuildComponent {
  return REGISTRY[key] ?? BrickStack;
}
```

- [ ] **Step 8: Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(lego): build components and registry with fallback"
```

---

### Task 8: DecorationLayer

**Goal:** A decorative layer that scatters bricks/minifigures around section content in the Lego theme only, hidden in Default, density-aware and accessibility-safe.

**Files:**
- Create: `src/components/DecorationLayer.tsx`, `src/components/DecorationLayer.test.tsx`

**Acceptance Criteria:**
- [ ] Renders `null` when theme is `default`.
- [ ] Renders SVG decoration when theme is `lego`.
- [ ] Root element is `aria-hidden="true"` and `pointer-events: none`.

**Verify:** `npm run test src/components/DecorationLayer.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/components/DecorationLayer.test.tsx`**

```tsx
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/theme/useTheme";
import { DecorationLayer } from "./DecorationLayer";

test("renders nothing in default theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "default");
  const { container } = render(<ThemeProvider><DecorationLayer /></ThemeProvider>);
  expect(container.querySelector("svg")).toBeNull();
});

test("renders decoration in lego theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "lego");
  const { container } = render(<ThemeProvider><DecorationLayer /></ThemeProvider>);
  expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  expect(container.querySelector("svg")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/components/DecorationLayer.tsx`**

```tsx
import { useTheme } from "@/theme/useTheme";
import { Brick } from "@/lego/Brick";
import { Minifigure } from "@/lego/Minifigure";

type Piece = { node: React.ReactNode; style: React.CSSProperties };

const PIECES: Piece[] = [
  { node: <Brick color="#006cb7" studs={3} width={70} />, style: { left: 12, bottom: 10, transform: "rotate(-5deg)" } },
  { node: <Brick color="#d01012" studs={2} width={48} />, style: { left: 90, bottom: 10, transform: "rotate(4deg)" } },
  { node: <Brick color="#2f9e44" studs={2} width={54} />, style: { right: 80, bottom: 12, transform: "rotate(5deg)" } },
  { node: <Brick color="#f6a700" studs={3} width={74} />, style: { right: 14, bottom: 10, transform: "rotate(-4deg)" } },
  { node: <Brick color="#7048b0" studs={2} width={40} />, style: { left: 20, top: 14, transform: "rotate(9deg)" } },
  { node: <Minifigure width={54} />, style: { right: 18, bottom: 8 } },
];

export function DecorationLayer({ density = 1 }: { density?: number }) {
  const { theme } = useTheme();
  if (theme !== "lego") return null;
  const pieces = PIECES.slice(0, Math.max(2, Math.round(PIECES.length * density)));
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <div key={i} className="absolute hidden sm:block" style={p.style}>
          {p.node}
        </div>
      ))}
    </div>
  );
}
```
(The `hidden sm:block` class drops decoration on the smallest screens so mobile content stays clean.)

- [ ] **Step 4: Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(lego): DecorationLayer for lego-theme whitespace"
```

---

### Task 9: App shell — Nav, Section, smooth scroll

**Goal:** A sticky nav with anchor links and the theme toggle, and a reusable `Section` wrapper with an id anchor and optional decoration.

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Section.tsx`, `src/components/Section.test.tsx`
- Modify: `src/App.tsx`, `src/index.css` (smooth scroll)

**Acceptance Criteria:**
- [ ] `Nav` renders links to `#about`, `#projects`, `#experience`, `#skills`, `#contact` plus the `ThemeToggle`.
- [ ] `Section` renders a `<section>` with the given `id` and its children.
- [ ] `Section` includes a `DecorationLayer` and is `position: relative`.

**Verify:** `npm run test src/components/Section.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/components/Section.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Section } from "./Section";

test("renders a section with id and children", () => {
  render(<ThemeProvider><Section id="about"><p>hi</p></Section></ThemeProvider>);
  const el = document.getElementById("about");
  expect(el?.tagName).toBe("SECTION");
  expect(screen.getByText("hi")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: `src/components/Section.tsx`**

```tsx
import { DecorationLayer } from "./DecorationLayer";

export function Section({
  id,
  className = "",
  decorate = true,
  children,
}: {
  id: string;
  className?: string;
  decorate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-6 py-20 ${className}`}>
      {decorate && <DecorationLayer />}
      <div className="relative z-10 mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: `src/components/Nav.tsx`**

```tsx
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
```

- [ ] **Step 5: Smooth scroll in `src/index.css`** (respecting reduced motion)

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

- [ ] **Step 6: Update `src/App.tsx` to compose the shell** (sections added in later tasks)

```tsx
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Nav } from "@/components/Nav";

export default function App() {
  return (
    <ThemeProvider>
      <a id="top" />
      <Nav />
      <main>{/* sections added in Tasks 10–15 */}</main>
    </ThemeProvider>
  );
}
```
Update `src/App.test.tsx` to assert the nav brand renders: `expect(screen.getByText("David Gonzalez")).toBeInTheDocument();` (wrap render — App already includes ThemeProvider).

- [ ] **Step 7: Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(layout): Nav, Section wrapper, smooth scroll shell"
```

---

### Task 10: Hero section

**Goal:** The hero — name, role label, tagline, and two CTAs — rendered from `profile`, with theme-aware decoration already provided by `Section`.

**Files:**
- Create: `src/sections/Hero.tsx`, `src/sections/Hero.test.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Renders `profile.name`, `profile.role`, `profile.tagline`.
- [ ] Renders "View work" (→ `#projects`) and "Contact" (→ `#contact`) links.

**Verify:** `npm run test src/sections/Hero.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/sections/Hero.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Hero } from "./Hero";
import { profile } from "@/content/profile";

test("renders identity and CTAs", () => {
  render(<ThemeProvider><Hero /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: profile.name })).toBeInTheDocument();
  expect(screen.getByText(profile.tagline)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /view work/i })).toHaveAttribute("href", "#projects");
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/sections/Hero.tsx`**

```tsx
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function Hero() {
  return (
    <Section id="hero" className="min-h-[80vh] flex items-center">
      <div className="text-center mx-auto">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{profile.role}</p>
        <h1 className="font-display mt-3 text-5xl font-bold tracking-tight text-fg">{profile.name}</h1>
        <p className="mt-4 text-lg text-muted">{profile.tagline}</p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="#projects" className="rounded-[var(--radius-brand)] bg-accent px-5 py-2.5 font-medium text-white">View work</a>
          <a href="#contact" className="rounded-[var(--radius-brand)] border border-current/30 px-5 py-2.5 font-medium text-fg">Contact</a>
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Add `<Hero/>` to `<main>` in `App.tsx`. Run → PASS. Commit**

```bash
git add -A && git commit -m "feat(sections): hero"
```

---

### Task 11: About section

**Goal:** Render the bio from `profile`.

**Files:**
- Create: `src/sections/About.tsx`, `src/sections/About.test.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Renders an "About" heading and `profile.bio`.

**Verify:** `npm run test src/sections/About.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { About } from "./About";
import { profile } from "@/content/profile";

test("renders bio", () => {
  render(<ThemeProvider><About /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: /about/i })).toBeInTheDocument();
  expect(screen.getByText(profile.bio)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL. Step 3: Implement `src/sections/About.tsx`**

```tsx
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function About() {
  return (
    <Section id="about">
      <h2 className="font-display text-3xl font-bold text-fg">About</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{profile.bio}</p>
    </Section>
  );
}
```

- [ ] **Step 4: Add `<About/>` to `App.tsx`. Run → PASS. Commit** `git commit -am "feat(sections): about"`.

---

### Task 12: Projects section & ProjectCard

**Goal:** Render projects from data; each card shows its Lego build (resolved via the registry), blurb, tech tags, and links.

**Files:**
- Create: `src/components/ProjectCard.tsx`, `src/sections/Projects.tsx`, `src/components/ProjectCard.test.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] `ProjectCard` renders the project name, blurb, each tech tag, and a repo/demo link when present.
- [ ] `ProjectCard` renders the SVG build for the project's `legoBuild`.
- [ ] `Projects` renders one card per entry in `projects`.

**Verify:** `npm run test src/components/ProjectCard.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/components/ProjectCard.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/content/types";

const p: Project = {
  id: "x", name: "DevDash", blurb: "A dashboard.", description: "...",
  tech: ["React", "Node"], links: { repo: "https://example.com" }, legoBuild: "computer",
};

test("renders project details, tags, link and an svg build", () => {
  const { container } = render(<ProjectCard project={p} />);
  expect(screen.getByRole("heading", { name: "DevDash" })).toBeInTheDocument();
  expect(screen.getByText("React")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /repo/i })).toHaveAttribute("href", "https://example.com");
  expect(container.querySelector("svg")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `src/components/ProjectCard.tsx`**

```tsx
import type { Project } from "@/content/types";
import { getBuild } from "@/lego/registry";

export function ProjectCard({ project }: { project: Project }) {
  const Build = getBuild(project.legoBuild);
  return (
    <article className="rounded-[var(--radius-brand)] bg-surface p-6 shadow-sm">
      <div className="flex h-28 items-center justify-center"><Build /></div>
      <h3 className="font-display mt-4 text-xl font-bold text-fg">{project.name}</h3>
      <p className="mt-1 text-sm text-muted">{project.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <li key={t} className="rounded bg-accent/10 px-2 py-1 text-xs font-medium text-accent">{t}</li>
        ))}
      </ul>
      <div className="mt-4 flex gap-4 text-sm">
        {project.links.demo && <a className="text-accent hover:underline" href={project.links.demo}>Demo</a>}
        {project.links.repo && <a className="text-accent hover:underline" href={project.links.repo}>Repo</a>}
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Implement `src/sections/Projects.tsx`**

```tsx
import { Section } from "@/components/Section";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";

export function Projects() {
  return (
    <Section id="projects">
      <h2 className="font-display text-3xl font-bold text-fg">Projects</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Add `<Projects/>` to `App.tsx`. Run → PASS. Commit** `git commit -am "feat(sections): projects with lego builds"`.

---

### Task 13: Experience section & RoleCard (with resume)

**Goal:** Render roles from data with their Lego treatment, plus a downloadable resume link.

**Files:**
- Create: `src/components/RoleCard.tsx`, `src/sections/Experience.tsx`, `src/sections/Experience.test.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] `Experience` renders one `RoleCard` per role with company, title, period, summary.
- [ ] A "Download résumé" link points to `profile.resumeUrl` (`/resume.pdf`).
- [ ] Each role with a `legoBuild` renders the matching SVG; roles without one render the fallback.

**Verify:** `npm run test src/sections/Experience.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test `src/sections/Experience.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Experience } from "./Experience";
import { profile } from "@/content/profile";

test("renders roles and a resume link", () => {
  render(<ThemeProvider><Experience /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: /experience/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /résumé|resume/i })).toHaveAttribute("href", profile.resumeUrl);
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: `src/components/RoleCard.tsx`**

```tsx
import type { Role } from "@/content/types";
import { getBuild } from "@/lego/registry";

export function RoleCard({ role }: { role: Role }) {
  const Build = getBuild(role.legoBuild ?? "stack");
  return (
    <article className="flex gap-4 rounded-[var(--radius-brand)] bg-surface p-5">
      <div className="hidden w-20 shrink-0 items-center justify-center sm:flex"><Build /></div>
      <div>
        <h3 className="font-display text-lg font-bold text-fg">{role.title} · {role.company}</h3>
        <p className="text-xs uppercase tracking-wide text-muted">{role.period}</p>
        <p className="mt-2 text-sm text-muted">{role.summary}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: `src/sections/Experience.tsx`**

```tsx
import { Section } from "@/components/Section";
import { RoleCard } from "@/components/RoleCard";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";

export function Experience() {
  return (
    <Section id="experience">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold text-fg">Experience</h2>
        <a href={profile.resumeUrl} className="text-sm text-accent hover:underline" download>
          Download résumé
        </a>
      </div>
      <div className="mt-8 space-y-4">
        {experience.map((r) => <RoleCard key={r.id} role={r} />)}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Add `<Experience/>` to `App.tsx`. Run → PASS. Commit** `git commit -am "feat(sections): experience with resume download"`.

---

### Task 14: Skills section

**Goal:** Render skills grouped by category.

**Files:**
- Create: `src/sections/Skills.tsx`, `src/sections/Skills.test.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Renders a "Skills" heading and every skill label.
- [ ] Skills are grouped under their category headings.

**Verify:** `npm run test src/sections/Skills.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Skills } from "./Skills";
import { skills } from "@/content/skills";

test("renders all skill labels", () => {
  render(<ThemeProvider><Skills /></ThemeProvider>);
  for (const s of skills) expect(screen.getByText(s.label)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run → FAIL. Step 3: Implement `src/sections/Skills.tsx`**

```tsx
import { Section } from "@/components/Section";
import { skills } from "@/content/skills";

export function Skills() {
  const byCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s.label);
    return acc;
  }, {});
  return (
    <Section id="skills">
      <h2 className="font-display text-3xl font-bold text-fg">Skills</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(byCategory).map(([cat, labels]) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{cat}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {labels.map((l) => (
                <li key={l} className="rounded-[var(--radius-brand)] bg-surface px-3 py-1.5 text-sm text-fg">{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Add `<Skills/>` to `App.tsx`. Run → PASS. Commit** `git commit -am "feat(sections): skills"`.

---

### Task 15: Contact section

**Goal:** Render contact email and social links from `profile.socials`.

**Files:**
- Create: `src/sections/Contact.tsx`, `src/sections/Contact.test.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Renders a mailto link to `profile.socials.email`.
- [ ] Renders GitHub and LinkedIn links when present.

**Verify:** `npm run test src/sections/Contact.test.tsx` → pass.

**Steps:**

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Contact } from "./Contact";
import { profile } from "@/content/profile";

test("renders a mailto link", () => {
  render(<ThemeProvider><Contact /></ThemeProvider>);
  expect(screen.getByRole("link", { name: /email|contact/i }))
    .toHaveAttribute("href", `mailto:${profile.socials.email}`);
});
```

- [ ] **Step 2: Run → FAIL. Step 3: Implement `src/sections/Contact.tsx`**

```tsx
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function Contact() {
  const { email, github, linkedin } = profile.socials;
  return (
    <Section id="contact">
      <h2 className="font-display text-3xl font-bold text-fg">Contact</h2>
      <p className="mt-4 text-muted">Open to new opportunities — let's talk.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <a href={`mailto:${email}`} className="text-accent hover:underline" aria-label="Email">Email</a>
        {github && <a href={github} className="text-accent hover:underline">GitHub</a>}
        {linkedin && <a href={linkedin} className="text-accent hover:underline">LinkedIn</a>}
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Add `<Contact/>` to `App.tsx`. Run → PASS. Commit** `git commit -am "feat(sections): contact"`.

---

### Task 16: Accessibility, responsiveness & integration polish

**Goal:** Final pass — verify both themes render the whole page, AA contrast holds, reduced-motion is respected, and an axe smoke test passes.

**Files:**
- Create: `src/App.integration.test.tsx`
- Modify: any component needing contrast/aria fixes found during the pass
- Add dep: `vitest-axe`

**Acceptance Criteria:**
- [ ] Full-page render in both `default` and `lego` themes shows all six section headings.
- [ ] An axe accessibility check on the rendered app reports no violations.
- [ ] Manual check: Lego theme text on yellow meets AA; decoration never overlaps body text; mobile (`<640px`) hides decoration and stacks to one column.

**Verify:** `npm run test src/App.integration.test.tsx` → pass; `npm run build` → succeeds.

**Steps:**

- [ ] **Step 1: Add axe matcher** — `npm install -D vitest-axe`. In `src/test/setup.ts` append:

```ts
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
expect.extend(matchers);
```

- [ ] **Step 2: Integration test `src/App.integration.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { THEME_STORAGE_KEY } from "@/theme/useTheme";
import App from "./App";

test.each(["default", "lego"])("renders all sections in %s theme", (theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  render(<App />);
  for (const name of [/about/i, /projects/i, /experience/i, /skills/i, /contact/i]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  }
});

test("has no axe violations", async () => {
  const { container } = render(<App />);
  expect(await axe(container)).toHaveNoViolations();
});
```

- [ ] **Step 3: Run → fix any reported aria/contrast issues** (e.g. add `aria-label`s, adjust `--color-muted` for the Lego theme if contrast fails). Re-run until green.

- [ ] **Step 4: Manual cross-theme check** — `npm run dev`, toggle themes, resize to mobile width; confirm decoration hidden on small screens, single-column layout, no text overlap.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test: full-page integration + axe a11y pass across both themes"
```

---

## Notes for the implementer

- **Real content** (bio, GitHub/LinkedIn URLs, actual projects & roles, and the right `legoBuild` per item) is supplied by the user — the data files ship with David's name/email/resume plus clearly-marked sample entries to replace. This does not block any task.
- **Interactivity** (hover/drag/snap on bricks) is intentionally out of scope; `DecorationLayer` and the SVG primitives are structured so it can be added later without restructuring.
- Run the whole suite with `npm run test` after each task; keep commits per task.
