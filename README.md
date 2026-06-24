# Portfolio

A single-page personal portfolio for a software engineer, built around a switchable **two-theme system**:

- **Default** — a professional, restrained dark theme with a subtle dot-grid background.
- **Lego** — a playful "play-table" theme: a warm yellow background, brick and minifigure decoration in the margins, and per-project / per-role illustrations built in Lego (hand-authored SVG).

Switch themes with the toggle in the nav; the choice persists across visits.

## Tech stack

- [Vite](https://vite.dev/) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-variable theming via `@theme`)
- [shadcn/ui](https://ui.shadcn.com/) foundation
- [Vitest](https://vitest.dev/) + React Testing Library + `vitest-axe`

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run test     # run the test suite
npm run build    # type-check and build for production
npm run lint     # lint with oxlint
```

## Project structure

```
src/
  theme/        Theme system — ThemeProvider, useTheme, ThemeToggle, theme tokens
  content/      Typed content data (profile, projects, experience, skills)
  lego/         Hand-authored Lego SVG primitives, per-project builds, and registry
  components/   Nav, Section wrapper, DecorationLayer, Project/Role cards
  sections/     Hero, About, Projects, Experience, Skills, Contact
```

## Editing content

All content lives in typed data files under `src/content/` — edit those rather than the components:

- `profile.ts` — name, role, tagline, bio, social links, résumé URL
- `projects.ts` — featured projects (each maps to a Lego build via `legoBuild`)
- `experience.ts` — work history
- `skills.ts` — skills grouped by category

The résumé PDF is served from `public/resume.pdf`.

## Accessibility

Both themes meet WCAG AA text contrast. Decorative Lego SVGs are `aria-hidden`, and all motion (theme transitions, smooth scroll) is gated behind `prefers-reduced-motion`.
