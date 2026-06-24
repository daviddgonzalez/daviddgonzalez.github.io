# Portfolio — Design Spec

**Date:** 2026-06-23
**Status:** Approved design, pending spec review
**Owner:** David Gonzalez

## 1. Overview

A single-page personal portfolio for a **software engineer**, optimized for **recruiters and hiring managers**. The site must read fast and prove the ability to ship, while standing out through a distinctive, switchable theming system.

The signature feature is a **theme switcher** with two fully-realized themes:

- **Default** — a professional, restrained dark theme with a subtle dot-grid background.
- **Lego** — a playful "play-table" theme: warm yellow background, piles of bricks and minifigures in the margins, and per-project / per-role illustrations built in Lego, rendered as hand-authored SVG.

The theme switcher is itself a demonstration of front-end skill — it shows craft to a recruiter rather than just claiming it.

## 2. Goals & Non-Goals

### Goals
- Communicate skills, experience, and shipped work to a recruiter in one scroll.
- Be memorable and distinctive without sacrificing professionalism or readability.
- Demonstrate front-end capability through the theming system and custom SVG illustration.
- Stay fast, accessible, and responsive.

### Non-Goals (YAGNI)
- No CMS, blog, or backend. Content is static, defined in code.
- No multi-page routing or per-project case-study pages (single-page scroll only).
- No more than two themes at launch (the system is extensible, but we ship Default + Lego).
- No photoreal 3D Lego renders at launch (hand-authored SVG only; see §7).
- Brick/minifigure interactivity (drag, snap, physics) is **deferred** — the architecture allows it, but launch ships static or lightly-animated decoration.

## 3. Audience & Success Criteria

**Primary audience:** recruiters / hiring managers skimming quickly.

**Success looks like:**
- A visitor understands "who, what, proof, how to contact" within one scroll.
- The Default theme is clean and credible enough to send to any employer as-is.
- The Lego theme delights without obscuring content or hurting readability.
- Switching themes is instant, persists across visits, and never breaks layout.

## 4. Site Structure

Single-page vertical scroll with a fixed/sticky nav containing smooth-scroll anchors and the theme toggle.

Sections, in order:
1. **Hero** — name, role, one-line value statement, primary CTAs (View work, Contact). Theme-specific decoration (dot grid vs. dense brick piles).
2. **About** — short bio / background.
3. **Projects** — featured projects, each with a custom Lego SVG build (in Lego theme) and a clean card (in Default theme), description, tech tags, and links (live demo + repo).
4. **Experience** — roles / work history, each with a Lego treatment (e.g., brick-built company logo or a per-role build). Includes a downloadable resume PDF (provided: `David_Gonzalez_28.pdf`, to be served from `public/resume.pdf`).
5. **Skills** — tech stack / tools.
6. **Contact** — email and social links (GitHub, LinkedIn).

## 5. Theme System (core architecture)

The theme system is the backbone. It must change four dimensions at once, instantly, with persistence:

| Dimension | Default | Lego |
|-----------|---------|------|
| Background | Dark, subtle dot grid | Warm yellow play-table, brick/minifig decoration in whitespace |
| Color palette | Restrained, professional accent | Lego primaries (red, blue, green, yellow, purple) |
| Typography | Refined sans (display + body) | Chunky, rounded, playful |
| Component styling | Flat, minimal | Brick-style: studs, pressed-in shadows on buttons/tags |

### Mechanism
- A `data-theme="default" | "lego"` attribute on the document root.
- All themeable values expressed as **CSS custom properties** (colors, fonts, radii, shadows, background treatment), defined per theme and consumed by Tailwind v4's `@theme` and by shadcn/ui's CSS-variable token system. Switching the attribute swaps the whole token set.
- A `ThemeProvider` (React context) owns current theme, exposes `theme` + `setTheme`/`toggle`, and writes to the DOM attribute.
- **Persistence:** chosen theme stored in `localStorage`.
- **FOUC prevention:** a tiny inline script in the HTML `<head>` reads `localStorage` and sets `data-theme` before first paint, so there is no flash of the wrong theme.

### Units (each independently understandable/testable)
- **`ThemeProvider`** — owns theme state, persistence, DOM attribute. Depends on: `localStorage`. Interface: `useTheme()` → `{ theme, setTheme, toggle }`.
- **`ThemeToggle`** — UI control in the nav. Depends on: `useTheme`. Pure presentational + one action.
- **Token definitions** — CSS files / `@theme` blocks mapping each theme to variable values. No JS dependency.

## 6. Lego Decoration Layer

A presentational layer that fills section whitespace with bricks and minifigures **only in the Lego theme**.

- **`DecorationLayer`** — absolutely-positioned, `aria-hidden`, pointer-events-none by default, renders a configurable arrangement of `Brick` and `Minifigure` SVG components around a section's content. Hidden entirely in Default theme.
- Density is a prop and **reduces on smaller breakpoints** so mobile content stays clean.
- Built so interactivity (hover/drag) can be layered on later without restructuring (deferred — see Non-Goals).

## 7. Lego Asset System (SVG)

All Lego illustrations are **hand-authored SVG React components** sharing one visual language.

- **Primitive components:** `Brick` (configurable color/size/studs), `Minifigure`, `Stud`.
- **Build components:** one per illustration concept — e.g. `LegoComputer`, `LegoPhone`, `BrickLogo` (brick-mosaic), and company-logo builds for Experience.
- **Theming:** SVGs use `currentColor` / CSS variables so they recolor with the theme and could support color variants.
- **Per-item mapping:** each project and each role declares which build it uses (see §8). A **fallback build** (generic brick stack) renders if a item has no specific build assigned, so content never breaks.
- **Upgrade path:** any single build can later be swapped for an AI/Studio-rendered raster image without touching the rest of the system.

Rationale for SVG over AI raster: in-repo, lightweight, crisp at any size, recolorable per theme, and animatable for future interactivity. Photoreal renders (BrickLink Studio, image generators) remain an option for individual showpiece assets later.

## 8. Content Data Model

Content is static, defined in typed data files — not hardcoded in JSX — so it's easy to edit and so sections render from data.

```
Project  { id, name, blurb, description, tech: string[], links: { demo?, repo? }, legoBuild: BuildKey }
Role     { id, company, title, period, summary, legoBuild?: BuildKey }
Skill    { label, category }
Profile  { name, role, tagline, bio, socials: { github, linkedin, email }, resumeUrl? }
```

`BuildKey` is a union of available build component keys; a registry maps key → component, with a fallback.

## 9. Component Breakdown

- `App` — composes ThemeProvider + layout + sections.
- `ThemeProvider`, `ThemeToggle` — §5.
- `Nav` — sticky, smooth-scroll anchors, holds ThemeToggle.
- `Section` — shared wrapper (id anchor, spacing, optional DecorationLayer).
- `Hero`, `About`, `Projects`, `Experience`, `Skills`, `Contact` — section components, render from data.
- `ProjectCard`, `RoleCard` — render an item + its Lego build.
- `DecorationLayer` — §6.
- Lego asset components — §7.
- `content/*` — typed data (§8).

## 10. Tech Stack

- **Build:** Vite + React + TypeScript.
- **Styling:** Tailwind CSS v4 (`@theme` token architecture), CSS custom properties for theming.
- **Components:** shadcn/ui (themed via CSS variables, consistent with the theme system).
- **Assets:** hand-authored inline SVG React components.
- **Hosting (later):** static host (e.g. Vercel/Netlify/GitHub Pages) — out of scope for this spec.

Relevant Claude Code skills available during build: official **frontend-design** (drives the design plan/critique), **shadcn/ui** skill (correct component usage), optionally **ui-ux-pro-max** as a reference library. Order of operations: design direction first, then implementation.

## 11. Accessibility & Responsiveness

- Semantic HTML and landmark regions; nav anchors keyboard-navigable.
- **Contrast:** both themes meet WCAG AA for text. The Lego yellow theme uses dark text and keeps decoration out of the content area to preserve contrast.
- Decorative SVG is `aria-hidden`; meaningful illustrations get accessible labels where they convey info.
- **`prefers-reduced-motion`** respected — any theme transition or future brick animation is disabled/reduced.
- Brick/minifig density scales down at small breakpoints; layout reflows to single-column on mobile.

## 12. Error Handling & Edge Cases

- **Theme FOUC:** prevented via pre-paint inline script (§5).
- **Invalid/missing stored theme:** fall back to Default.
- **Missing Lego build for an item:** render the fallback build (§7), never crash.
- **Reduced-motion / no-JS:** site renders readable in Default theme without animation; theme toggle requires JS but content does not.

## 13. Testing Approach

- Component tests for `ThemeProvider` (persistence, attribute, fallback) and `ThemeToggle`.
- Render tests that each section renders from data and that `ProjectCard` resolves the correct/fallback Lego build.
- Visual/manual check of both themes across breakpoints; contrast check on the Lego theme.
- Accessibility smoke test (axe) and reduced-motion behavior.

## 14. Deferred / Open Questions

1. **Brick interactivity** — drag/snap/float physics. Deferred; architecture allows it.
2. **Real content** — actual projects, roles, bio, resume, and which Lego build represents each. Needed before/at build time.
3. **Exact palettes & type** — final Default accent color and the display/body/utility typefaces for each theme (the frontend-design skill will produce a token plan during implementation).
4. **Additional themes** — system is extensible beyond two; none planned at launch.
5. **Hosting/deploy** — chosen later.

## 15. Directory Sketch

```
src/
  main.tsx, App.tsx
  theme/        ThemeProvider.tsx, ThemeToggle.tsx, themes.css
  components/   Nav, Section, ProjectCard, RoleCard, DecorationLayer
  sections/     Hero, About, Projects, Experience, Skills, Contact
  lego/         Brick, Stud, Minifigure, builds/ (LegoComputer, LegoPhone, BrickLogo, ...), registry.ts
  content/      profile.ts, projects.ts, experience.ts, skills.ts
  index.css
```
