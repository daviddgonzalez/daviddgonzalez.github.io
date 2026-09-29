# Résumé → Site Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the portfolio's Projects section and `public/resume.pdf` in step with the Overleaf résumé automatically, with brand-new projects held behind a Lego-build CI gate that emails the owner.

**Architecture:** The résumé declares its project IDs in PDF metadata (`\hypersetup{pdfkeywords={projects=…}}`). A Windows Scheduled Task notices new PDFs in Downloads and runs a TypeScript sync CLI inside a dedicated git worktree (`~/projects/portfolio-sync`). All decision logic lives in small pure modules under `scripts/resume/`, tested with Vitest; the CLI, git helpers and PowerShell are thin shells around them. Safe changes push to `main` (which deploys); new projects go to a `resume-sync/<id>` branch + PR where `lego-gate.yml` fails and sends a Gmail notification.

**Tech Stack:** Vite + React 19 + TypeScript 6, Vitest 4 (jsdom by default; `// @vitest-environment node` for PDF/git tests), `tsx` (runs the CLI), `pdfjs-dist` (reads PDF keywords and text), `pdf-lib` (generates test PDFs only), GitHub Actions + `dawidd6/action-send-mail@v22`, Windows PowerShell 5.1 + Task Scheduler.

**Spec:** `docs/superpowers/specs/2026-09-28-resume-sync-design.md`

---

## Where to work

- Repo: `~/projects/portfolio` (GitHub `daviddgonzalez/daviddgonzalez.github.io`; a push to `main` deploys to GitHub Pages).
- Implement in the existing worktree `~/projects/portfolio/.claude/worktrees/resume-sync-spec` on branch `docs/resume-sync-spec` (it already holds the spec and this plan). All paths below are relative to that worktree. Do **not** commit to `main`; Tasks 1–12 land via one PR, and Task 13 runs after it merges.
- Run all npm commands from the worktree root. `node_modules` is not shared between worktrees: run `npm ci` once before Task 1.

## Facts verified while writing this plan

- The résumé PDF is produced by `pdfTeX-1.40.26` / `LaTeX with hyperref`; its Info dictionary has an empty `/Keywords ()`.
- **`pdf-lib` cannot read this PDF's Info dictionary** (even `getProducer()` is `undefined`, because pdfTeX writes an xref stream). **`pdfjs-dist` reads it** (`getMetadata().info.Keywords`), including a same-length-patched copy with `/Keywords (projects=mypose,ledgr)`. So `pdfjs-dist` reads keywords and text; `pdf-lib` is only used to generate fixture PDFs in tests (pdfjs reads keywords set by `pdf-lib`'s `setKeywords`).
- `pdfjs-dist` 6.x requires Node ≥ 22.13 (local Node is v22.22.3 via nvm). It runs under Vitest's node environment (verified).
- `pdfjs-dist` text of the real 2028 résumé's Projects section is exactly the fixture in Task 5. Projects is currently the last section.
- Git uses `credential.helper=store`; `gh` is logged in as `daviddgonzalez` with `repo` scope; WSL distro is `Ubuntu-24.04`; nvm is **not** loaded in non-interactive shells (source `~/.nvm/nvm.sh`).
- No existing test hard-codes `"Expected May 2028"`.

## File map

| File | Responsibility |
|---|---|
| `src/content/types.ts` (modify) | `LegoBuildRef`, `Project.pinned` |
| `src/lego/registry.ts` (modify) | `"pending"` renders nothing |
| `src/content/legoGate.ts` + `lego-gate.test.ts` (new) | Gate: no project may be `"pending"` |
| `src/content/resume-projects.json` (new) | Sync-owned list of résumé project IDs |
| `src/content/siteProjects.ts` + test (new) | Display order: résumé projects, then pinned |
| `src/content/projects.ts` (modify) | TraceAndPace `pinned: true` |
| `src/sections/Projects.tsx` (modify) + `Projects.test.tsx` (new) | Render `siteProjects(...)` |
| `src/content/education.ts` (modify) | `"2025 – Present"` |
| `src/content/content.test.ts` (modify) | Consistency + education pin |
| `tsconfig.scripts.json` (new), `tsconfig.json`, `tsconfig.app.json`, `package.json` (modify) | Script tooling |
| `scripts/resume/keywords.ts` | Keywords string → IDs |
| `scripts/resume/projectBlocks.ts` | Résumé text → project blocks; `slugify` |
| `scripts/resume/draft.ts` | Block → drafted `Project` |
| `scripts/resume/projectsSource.ts` | Append a drafted entry to `projects.ts` source |
| `scripts/resume/plan.ts` | Decide what a sync does |
| `scripts/resume/pdf.ts` | PDF bytes → keywords / text; `sha256` |
| `scripts/resume/findResume.ts` | Newest contract PDF in a directory |
| `scripts/resume/git.ts` | git/gh wrappers |
| `scripts/sync-resume.ts` | CLI orchestration |
| `.github/workflows/lego-gate.yml` | CI gate + Gmail |
| `scripts/windows/resume-watch.ps1`, `register-resume-task.ps1` | Windows trigger |
| `README.md` (modify) | How résumé sync works + setup |

---

### Task 1: Pending Lego builds and the Lego gate test

**Goal:** Allow a project's `legoBuild` to be `"pending"` (renders no build) and add a test that fails while any project is pending.

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/lego/registry.ts`
- Modify: `src/lego/registry.test.tsx`
- Create: `src/content/legoGate.ts`
- Create: `src/content/lego-gate.test.ts`

**Acceptance Criteria:**
- [ ] `Project.legoBuild` has type `LegoBuildRef = BuildKey | "pending"`, and `Project` has optional `pinned?: boolean`.
- [ ] `getBuild("pending")` returns a component that renders no `<svg>`; unknown keys still fall back to `BrickStack`.
- [ ] `pendingLegoBuilds(projects)` returns the IDs whose `legoBuild` is `"pending"`.
- [ ] `src/content/lego-gate.test.ts` passes on current data and its message names pending IDs when it fails.
- [ ] `npm test` and `npm run build` pass.

**Verify:** `npx vitest run src/lego/registry.test.tsx src/content/lego-gate.test.ts` → all tests pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

Append to `src/lego/registry.test.tsx`:

```tsx
test("renders nothing for a pending build", () => {
  const Build = getBuild("pending");
  const { container } = render(<Build />);
  expect(container.querySelector("svg")).toBeNull();
});
```

Create `src/content/lego-gate.test.ts`:

```ts
import { expect, test } from "vitest";
import { projects } from "./projects";
import { pendingLegoBuilds } from "./legoGate";

test("pendingLegoBuilds lists the ids whose Lego build is pending", () => {
  const base = projects[0];
  expect(
    pendingLegoBuilds([
      { ...base, id: "a", legoBuild: "pending" },
      { ...base, id: "b", legoBuild: "tree" },
    ]),
  ).toEqual(["a"]);
});

// The gate. lego-gate.yml runs exactly this file on every PR to main.
test("LEGO GATE: every project has a real Lego build", () => {
  const pending = pendingLegoBuilds(projects);
  expect(pending, `Projects waiting on a Lego build: ${pending.join(", ")}`).toEqual([]);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/lego/registry.test.tsx src/content/lego-gate.test.ts`
Expected: FAIL — `lego-gate.test.ts` cannot resolve `./legoGate`; the registry test fails because `"pending"` falls back to `BrickStack` (an `<svg>` is rendered).

- [ ] **Step 3: Implement**

In `src/content/types.ts`, add `LegoBuildRef` after `BuildKey` and change `Project`:

```ts
export type BuildKey = "submarine" | "receipt" | "pose" | "tree" | "judge" | "chalkboard" | "meeting" | "stack";
/** "pending" only ever exists on a resume-sync/* branch; the Lego gate keeps it off main. */
export type LegoBuildRef = BuildKey | "pending";
```

```ts
export interface Project {
  id: string; name: string; blurb: string; description: string;
  tech: string[]; links: { demo?: string; repo?: string }; legoBuild: LegoBuildRef;
  /** Show on the site even when the résumé doesn't list it. */
  pinned?: boolean;
}
```

In `src/lego/registry.ts`, change the import and `getBuild`:

```ts
import type { BuildKey, LegoBuildRef } from "@/content/types";
```

```ts
const NoBuild: BuildComponent = () => null;

export function getBuild(key: LegoBuildRef): BuildComponent {
  if (key === "pending") return NoBuild;
  return REGISTRY[key] ?? BrickStack;
}
```

Create `src/content/legoGate.ts`:

```ts
import type { Project } from "./types";

/** IDs of projects that still need a Lego build before they can go live. */
export function pendingLegoBuilds(projects: Project[]): string[] {
  return projects.filter((p) => p.legoBuild === "pending").map((p) => p.id);
}
```

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run src/lego/registry.test.tsx src/content/lego-gate.test.ts && npm test && npm run build`
Expected: all tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/content/types.ts src/lego/registry.ts src/lego/registry.test.tsx src/content/legoGate.ts src/content/lego-gate.test.ts
git commit -m "feat(content): pending Lego builds and the Lego gate test"
```

---

### Task 2: Show résumé projects in résumé order, then pinned ones

**Goal:** The Projects section renders the projects listed in `resume-projects.json` in that order, followed by pinned site-only projects, with consistency tests guarding the list.

**Files:**
- Create: `src/content/resume-projects.json`
- Create: `src/content/siteProjects.ts`
- Create: `src/content/siteProjects.test.ts`
- Create: `src/sections/Projects.test.tsx`
- Modify: `src/content/projects.ts` (TraceAndPace)
- Modify: `src/sections/Projects.tsx`
- Modify: `src/content/content.test.ts`
- Modify: `tsconfig.app.json` (`resolveJsonModule`)

**Acceptance Criteria:**
- [ ] `resume-projects.json` is `["mypose", "ledgr"]` formatted as `JSON.stringify(list, null, 2) + "\n"`.
- [ ] `siteProjects` returns résumé projects in list order, then pinned projects not already shown in `projects.ts` order, and drops unknown IDs.
- [ ] TraceAndPace has `pinned: true`; the page shows MyPose, Ledgr, TraceAndPace in that order.
- [ ] A content test fails if `resume-projects.json` is empty, has duplicates, or names an ID missing from `projects.ts`.
- [ ] Tests derive expectations from the data (no hard-coded live project names), so a future sync that changes the list doesn't break them.

**Verify:** `npx vitest run src/content src/sections/Projects.test.tsx && npm run build` → all pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

Create `src/content/siteProjects.test.ts`:

```ts
import { expect, test } from "vitest";
import type { Project } from "./types";
import { siteProjects } from "./siteProjects";

const mk = (id: string, pinned = false): Project => ({
  id, name: id, blurb: "", description: "", tech: [], links: {}, legoBuild: "stack",
  ...(pinned ? { pinned: true } : {}),
});

const all = [mk("a"), mk("b"), mk("c", true), mk("d", true), mk("e")];
const ids = (ps: Project[]) => ps.map((p) => p.id);

test("résumé projects come first, in résumé order", () => {
  expect(ids(siteProjects(all, ["e", "a"]))).toEqual(["e", "a", "c", "d"]);
});

test("pinned projects follow in projects.ts order", () => {
  expect(ids(siteProjects(all, []))).toEqual(["c", "d"]);
});

test("a pinned project on the résumé appears once, in its résumé position", () => {
  expect(ids(siteProjects(all, ["d", "a"]))).toEqual(["d", "a", "c"]);
});

test("unknown résumé ids are dropped", () => {
  expect(ids(siteProjects(all, ["zzz", "b"]))).toEqual(["b", "c", "d"]);
});
```

Create `src/sections/Projects.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Projects } from "./Projects";
import { projects } from "@/content/projects";
import resumeProjects from "@/content/resume-projects.json";
import { siteProjects } from "@/content/siteProjects";

test("renders the site's projects in display order", () => {
  render(<ThemeProvider><Projects /></ThemeProvider>);
  const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
  expect(names).toEqual(siteProjects(projects, resumeProjects).map((p) => p.name));
});
```

Append to the `describe("content", ...)` block in `src/content/content.test.ts` (and add the import at the top):

```ts
import resumeProjects from "./resume-projects.json";
```

```ts
  test("résumé project list is non-empty, unique, and every id exists", () => {
    expect(resumeProjects.length).toBeGreaterThan(0);
    expect(new Set(resumeProjects).size).toBe(resumeProjects.length);
    const known = projects.map((p) => p.id);
    for (const id of resumeProjects) expect(known, `résumé lists unknown project "${id}"`).toContain(id);
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/content src/sections/Projects.test.tsx`
Expected: FAIL — cannot resolve `./siteProjects` and `./resume-projects.json`.

- [ ] **Step 3: Implement**

Create `src/content/resume-projects.json` (owned by the sync — do not hand-edit):

```json
[
  "mypose",
  "ledgr"
]
```

Create `src/content/siteProjects.ts`:

```ts
import type { Project } from "./types";

/** Résumé projects in résumé order, then pinned site-only projects in projects.ts order. */
export function siteProjects(projects: Project[], resumeIds: string[]): Project[] {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const fromResume = resumeIds.flatMap((id) => {
    const p = byId.get(id);
    return p ? [p] : [];
  });
  const shown = new Set(fromResume.map((p) => p.id));
  return [...fromResume, ...projects.filter((p) => p.pinned && !shown.has(p.id))];
}
```

In `src/content/projects.ts`, add `pinned: true` to the TraceAndPace entry, after `legoBuild: "tree",`:

```ts
    legoBuild: "tree",
    pinned: true,
  },
```

Replace `src/sections/Projects.tsx` with:

```tsx
import { Section } from "@/components/Section";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";
import resumeProjects from "@/content/resume-projects.json";
import { siteProjects } from "@/content/siteProjects";

export function Projects() {
  return (
    <Section id="projects" density="sparse">
      <h2 className="font-display text-3xl font-bold text-fg">Projects</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {siteProjects(projects, resumeProjects).map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </Section>
  );
}
```

In `tsconfig.app.json`, add under `/* Bundler mode */`:

```json
    "resolveJsonModule": true,
```

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run src/content src/sections/Projects.test.tsx && npm test && npm run build`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/content/resume-projects.json src/content/siteProjects.ts src/content/siteProjects.test.ts src/content/projects.ts src/content/content.test.ts src/sections/Projects.tsx src/sections/Projects.test.tsx tsconfig.app.json
git commit -m "feat(projects): show résumé projects in résumé order, then pinned ones"
```

---

### Task 3: Pin the education dates to "2025 – Present"

**Goal:** The education entry permanently shows `2025 – Present` instead of the graduation date, locked by a test.

**Files:**
- Modify: `src/content/education.ts:8`
- Modify: `src/content/content.test.ts`

**Acceptance Criteria:**
- [ ] `education[0].period` is exactly `"2025 – Present"` (en dash U+2013, as in `experience.ts`).
- [ ] A content test fails if it changes.

**Verify:** `npx vitest run src/content/content.test.ts` → passes

**Steps:**

- [ ] **Step 1: Write the failing test**

In `src/content/content.test.ts`, add the import and a test inside `describe("content", ...)`:

```ts
import { education } from "./education";
```

```ts
  test("education dates are pinned to 2025 – Present, never the graduation date", () => {
    expect(education[0].period).toBe("2025 – Present");
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/content/content.test.ts`
Expected: FAIL — `expected 'Expected May 2028' to be '2025 – Present'`.

- [ ] **Step 3: Implement**

In `src/content/education.ts`, replace `period: "Expected May 2028",` with:

```ts
    period: "2025 – Present",
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/content/content.test.ts && npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/content/education.ts src/content/content.test.ts
git commit -m "content: show education as 2025 – Present, independent of the résumé"
```

---

### Task 4: Script tooling and the keywords parser

**Goal:** Add the TypeScript script toolchain and parse the résumé's `pdfkeywords` contract into project IDs.

**Files:**
- Modify: `package.json` (devDependencies, `sync:resume` script)
- Create: `tsconfig.scripts.json`
- Modify: `tsconfig.json` (reference)
- Create: `scripts/resume/keywords.ts`
- Create: `scripts/resume/keywords.test.ts`

**Acceptance Criteria:**
- [ ] `tsx`, `pdfjs-dist`, `pdf-lib` are devDependencies; `npm run sync:resume` maps to `tsx scripts/sync-resume.ts`.
- [ ] `npm run build` (`tsc -b`) typechecks `scripts/`.
- [ ] `parseKeywords` returns `null` for non-contract keywords, `{ ok: true, ids }` in order for valid ones, and `{ ok: false, error }` for empty lists, invalid IDs, and duplicates.

**Verify:** `npx vitest run scripts/resume/keywords.test.ts && npm run build` → passes

**Steps:**

- [ ] **Step 1: Install tooling**

```bash
npm i -D tsx pdfjs-dist pdf-lib
```

In `package.json` `"scripts"`, add:

```json
    "sync:resume": "tsx scripts/sync-resume.ts",
```

Create `tsconfig.scripts.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.scripts.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["node", "vitest/globals"],
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["scripts"]
}
```

In `tsconfig.json`, add the reference:

```json
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.scripts.json" }
  ]
```

- [ ] **Step 2: Write the failing test**

Create `scripts/resume/keywords.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { parseKeywords } from "./keywords.ts";

describe("parseKeywords", () => {
  test("is not a résumé when keywords are missing or have no projects=", () => {
    expect(parseKeywords(undefined)).toBeNull();
    expect(parseKeywords("")).toBeNull();
    expect(parseKeywords("resume; draft")).toBeNull();
  });

  test("reads ids in résumé order, ignoring whitespace and unknown keys", () => {
    expect(parseKeywords("projects=mypose,ledgr")).toEqual({ ok: true, ids: ["mypose", "ledgr"] });
    expect(parseKeywords(" owner=david ;  projects = mypose , ledgr ; ")).toEqual({ ok: true, ids: ["mypose", "ledgr"] });
  });

  test("rejects an empty list", () => {
    expect(parseKeywords("projects=")).toEqual({ ok: false, error: "projects= is empty" });
  });

  test("rejects ids that are not lowercase letters, digits, or dashes", () => {
    expect(parseKeywords("projects=MyPose,ledgr")).toEqual({ ok: false, error: "invalid project id(s): MyPose" });
  });

  test("rejects duplicates", () => {
    expect(parseKeywords("projects=ledgr,mypose,ledgr")).toEqual({ ok: false, error: "duplicate project id(s): ledgr" });
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run scripts/resume/keywords.test.ts`
Expected: FAIL — cannot resolve `./keywords.ts`.

- [ ] **Step 4: Implement**

Create `scripts/resume/keywords.ts`:

```ts
export type KeywordsResult = { ok: true; ids: string[] } | { ok: false; error: string };

const PROJECTS = /^projects\s*=/;
const ID = /^[a-z0-9-]+$/;

/**
 * Parse the résumé contract from PDF keywords: `;`-separated `key=value` pairs, of which only
 * `projects=id1,id2,…` matters. Returns null when the PDF isn't a résumé (no `projects=`).
 */
export function parseKeywords(keywords: string | undefined): KeywordsResult | null {
  const entry = (keywords ?? "").split(";").map((s) => s.trim()).find((s) => PROJECTS.test(s));
  if (entry === undefined) return null;

  const ids = entry.replace(PROJECTS, "").split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return { ok: false, error: "projects= is empty" };

  const invalid = ids.filter((id) => !ID.test(id));
  if (invalid.length > 0) return { ok: false, error: `invalid project id(s): ${invalid.join(", ")}` };

  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dupes.length > 0) return { ok: false, error: `duplicate project id(s): ${dupes.join(", ")}` };

  return { ok: true, ids };
}
```

- [ ] **Step 5: Run tests and build**

Run: `npx vitest run scripts/resume/keywords.test.ts && npm run build`
Expected: 5 tests pass; build succeeds (now also typechecking `scripts/`).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.scripts.json scripts/resume/keywords.ts scripts/resume/keywords.test.ts
git commit -m "feat(sync): script tooling and the résumé keywords parser"
```

---

### Task 5: Résumé text parser

**Goal:** Turn `pdfjs-dist` text of the résumé into project blocks (`name`, optional `note`, `tech`, `bullets`) and provide `slugify`.

**Files:**
- Create: `scripts/resume/fixtures/resume-2028.txt`
- Create: `scripts/resume/projectBlocks.ts`
- Create: `scripts/resume/projectBlocks.test.ts`

**Acceptance Criteria:**
- [ ] On the fixture, parses exactly `MyPose` (6 tech, 3 bullets, no note) and `Ledgr` (note `Bank of America Code-a-thon Finalist`, 5 tech, 2 bullets), with wrapped bullet lines joined by a single space and trailing dates removed from tech.
- [ ] Lines before the `Projects` heading are ignored; parsing stops at the next known section heading.
- [ ] Returns `[]` when there is no `Projects` line.
- [ ] `slugify("TraceAndPace") === "traceandpace"`.

**Verify:** `npx vitest run scripts/resume/projectBlocks.test.ts` → passes

**Steps:**

- [ ] **Step 1: Create the fixture**

Create `scripts/resume/fixtures/resume-2028.txt`. The `Projects` section is the verbatim `pdfjs-dist` output of the real 2028 résumé; the three lines before it are a synthetic Experience excerpt that proves earlier sections are ignored.

```text
Experience
Software Engineering Intern | AvonRisk May 2026 – Present
• Built a compatibility harness for AI-agent skills.
Projects
MyPose | PyTorch, OpenCV, C++, FastAPI, Supabase, React March 2026 – May 2026
• Machine Learning Model Development: Architected a user-calibrated Siamese network on a PyTorch ST-GCN base,
applying transfer learning to map individual kinematic manifolds for personalized biomechanical evaluation.
• Real-Time API Integration: Engineered an asynchronous FastAPI and MediaPipe computer-vision pipeline, encoding
33-landmark pose sequences as ST-GCN embeddings in Postgres/pgvector for low-latency retrieval.
• Data Analysis: Built a C++ module with pybind11 and Dynamic Time Warping to temporally align sequences,
computing joint-angle cosine similarities to isolate precise biomechanical deviations.
Ledgr (Bank of America Code-a-thon Finalist) | FastAPI, LiteLLM, Svelte 5, React Native, Bun April 2026
• Asynchronous Vision-LLM Pipeline: Engineered a FastAPI backend utilizing LiteLLM to prompt Gemma-3 for
structured JSON extraction of receipt data, implementing an EasyOCR and custom regex-based parser fallback.
• Cross-Platform Monorepo Architecture: Built a unified Bun and Turborepo workspace managing a SvelteKit web
dashboard, a React Native mobile client, and a PostgreSQL database, deploying via Docker and Railway.
```

- [ ] **Step 2: Write the failing test**

Create `scripts/resume/projectBlocks.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { parseProjectBlocks, slugify } from "./projectBlocks.ts";

const text = readFileSync(fileURLToPath(new URL("./fixtures/resume-2028.txt", import.meta.url)), "utf8");

test("parses each project block from the real résumé text", () => {
  const blocks = parseProjectBlocks(text);
  expect(blocks.map((b) => b.name)).toEqual(["MyPose", "Ledgr"]);
  expect(blocks[0]).toEqual({
    name: "MyPose",
    tech: ["PyTorch", "OpenCV", "C++", "FastAPI", "Supabase", "React"],
    bullets: [
      "Machine Learning Model Development: Architected a user-calibrated Siamese network on a PyTorch ST-GCN base, applying transfer learning to map individual kinematic manifolds for personalized biomechanical evaluation.",
      "Real-Time API Integration: Engineered an asynchronous FastAPI and MediaPipe computer-vision pipeline, encoding 33-landmark pose sequences as ST-GCN embeddings in Postgres/pgvector for low-latency retrieval.",
      "Data Analysis: Built a C++ module with pybind11 and Dynamic Time Warping to temporally align sequences, computing joint-angle cosine similarities to isolate precise biomechanical deviations.",
    ],
  });
  expect(blocks[1].note).toBe("Bank of America Code-a-thon Finalist");
  expect(blocks[1].tech).toEqual(["FastAPI", "LiteLLM", "Svelte 5", "React Native", "Bun"]);
  expect(blocks[1].bullets).toHaveLength(2);
});

test("stops at the next section heading", () => {
  const withMore = text + "Leadership\nACM | Design Team April 2026 – Present\n• Built charts.\n";
  expect(parseProjectBlocks(withMore).map((b) => b.name)).toEqual(["MyPose", "Ledgr"]);
});

test("returns nothing when there is no Projects section", () => {
  expect(parseProjectBlocks("Experience\nIntern | AvonRisk May 2026\n")).toEqual([]);
});

test("slugify lowercases and drops everything but letters and digits", () => {
  expect(slugify("TraceAndPace")).toBe("traceandpace");
  expect(slugify("My Pose 2")).toBe("mypose2");
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run scripts/resume/projectBlocks.test.ts`
Expected: FAIL — cannot resolve `./projectBlocks.ts`.

- [ ] **Step 4: Implement**

Create `scripts/resume/projectBlocks.ts`:

```ts
export interface ProjectBlock {
  name: string;
  note?: string;
  tech: string[];
  bullets: string[];
}

/** Section headings that end the Projects section (Projects is currently last, so this is a safeguard). */
const SECTION_HEADINGS = new Set([
  "Education", "Technical Skills", "Skills", "Experience", "Projects",
  "Leadership", "Awards", "Certifications", "Activities",
]);

const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?";
/** Trailing "March 2026 – May 2026", "April 2026", or "May 2026 – Present" on a heading line. */
const DATE_TAIL = new RegExp(`\\s+${MONTH}\\s+\\d{4}(?:\\s*[–-]\\s*(?:${MONTH}\\s+\\d{4}|Present))?\\s*$`);
/** "Name (optional note) | tech, list Date" */
const HEADING = /^(?<name>[^|(]+?)\s*(?:\((?<note>[^)]*)\))?\s*\|\s*(?<rest>.+)$/;

/** Parse the Projects section of the résumé's extracted text into one block per project. */
export function parseProjectBlocks(text: string): ProjectBlock[] {
  const lines = text.split("\n").map((l) => l.trim());
  const start = lines.indexOf("Projects");
  if (start === -1) return [];

  const blocks: ProjectBlock[] = [];
  for (const line of lines.slice(start + 1)) {
    if (SECTION_HEADINGS.has(line)) break;
    if (!line) continue;

    if (line.startsWith("•")) {
      blocks.at(-1)?.bullets.push(line.replace(/^•\s*/, ""));
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading?.groups) {
      const { name, note, rest } = heading.groups;
      const tech = rest.replace(DATE_TAIL, "").split(",").map((t) => t.trim()).filter(Boolean);
      blocks.push({ name: name.trim(), ...(note ? { note: note.trim() } : {}), tech, bullets: [] });
      continue;
    }
    // A wrapped continuation of the previous bullet.
    const bullets = blocks.at(-1)?.bullets;
    if (bullets && bullets.length > 0) bullets[bullets.length - 1] += ` ${line}`;
  }
  return blocks;
}

/** Project IDs are the lowercase alphanumeric slug of the résumé heading name. */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
```

- [ ] **Step 5: Run tests and build**

Run: `npx vitest run scripts/resume/projectBlocks.test.ts && npm run build`
Expected: 4 tests pass; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add scripts/resume/fixtures/resume-2028.txt scripts/resume/projectBlocks.ts scripts/resume/projectBlocks.test.ts
git commit -m "feat(sync): parse project blocks from the résumé text"
```

---

### Task 6: Draft builder and projects.ts appender

**Goal:** Build a drafted `Project` from a résumé block and append it to the source text of `projects.ts`.

**Files:**
- Create: `scripts/resume/draft.ts`
- Create: `scripts/resume/draft.test.ts`
- Create: `scripts/resume/projectsSource.ts`
- Create: `scripts/resume/projectsSource.test.ts`

**Acceptance Criteria:**
- [ ] `draftProject(id, block)` sets `name`, `blurb` (note, else first sentence of the first bullet), `tech`, `description` (bullets with a leading `Title:` stripped, joined by spaces), `links: {}`, `legoBuild: "pending"`.
- [ ] `draftProject(id, undefined)` returns empty text fields with `legoBuild: "pending"`.
- [ ] `stripHeading` removes only a leading capitalised heading with no `.` before the colon.
- [ ] `appendProjectEntry` inserts a formatted entry before the final `];` and throws a clear error when there is none.

**Verify:** `npx vitest run scripts/resume/draft.test.ts scripts/resume/projectsSource.test.ts` → passes

**Steps:**

- [ ] **Step 1: Write the failing tests**

Create `scripts/resume/draft.test.ts`:

```ts
import { expect, test } from "vitest";
import { draftProject, stripHeading } from "./draft.ts";
import type { ProjectBlock } from "./projectBlocks.ts";

const ledgr: ProjectBlock = {
  name: "Ledgr",
  note: "Bank of America Code-a-thon Finalist",
  tech: ["FastAPI", "Bun"],
  bullets: [
    "Asynchronous Vision-LLM Pipeline: Engineered a FastAPI backend. It falls back to EasyOCR.",
    "Cross-Platform Monorepo Architecture: Built a unified Bun workspace.",
  ],
};

test("drafts name, note-as-blurb, tech, and a heading-stripped description", () => {
  expect(draftProject("ledgr", ledgr)).toEqual({
    id: "ledgr",
    name: "Ledgr",
    blurb: "Bank of America Code-a-thon Finalist",
    description: "Engineered a FastAPI backend. It falls back to EasyOCR. Built a unified Bun workspace.",
    tech: ["FastAPI", "Bun"],
    links: {},
    legoBuild: "pending",
  });
});

test("without a note, the blurb is the first sentence of the first bullet", () => {
  expect(draftProject("ledgr", { ...ledgr, note: undefined }).blurb).toBe("Engineered a FastAPI backend.");
});

test("an empty draft when no résumé block matched", () => {
  expect(draftProject("gravi", undefined)).toEqual({
    id: "gravi", name: "", blurb: "", description: "", tech: [], links: {}, legoBuild: "pending",
  });
});

test("stripHeading only strips a leading Title: prefix", () => {
  expect(stripHeading("Data Analysis: Built a module")).toBe("Built a module");
  expect(stripHeading("Built X. Then: more")).toBe("Built X. Then: more");
  expect(stripHeading("no heading here")).toBe("no heading here");
});
```

Create `scripts/resume/projectsSource.test.ts`:

```ts
import { expect, test } from "vitest";
import type { Project } from "../../src/content/types.ts";
import { appendProjectEntry } from "./projectsSource.ts";

const source = `import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "a",
  },
];
`;

const gravi: Project = {
  id: "gravi", name: "Gravi", blurb: 'A "physics" game.', description: "One verb.",
  tech: ["Python", "pygame"], links: {}, legoBuild: "pending",
};

test("appends a formatted entry before the closing ];", () => {
  expect(appendProjectEntry(source, gravi)).toBe(`import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "a",
  },
  {
    id: "gravi",
    name: "Gravi",
    blurb: "A \\"physics\\" game.",
    description:
      "One verb.",
    tech: ["Python", "pygame"],
    links: {},
    legoBuild: "pending", // lego-gate: needs a Lego build before this can merge
  },
];
`);
});

test("throws when the end of the projects array cannot be found", () => {
  expect(() => appendProjectEntry("export const projects = {}", gravi)).toThrow(/closing \];/);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run scripts/resume/draft.test.ts scripts/resume/projectsSource.test.ts`
Expected: FAIL — cannot resolve `./draft.ts` and `./projectsSource.ts`.

- [ ] **Step 3: Implement**

Create `scripts/resume/draft.ts`:

```ts
import type { Project } from "../../src/content/types.ts";
import type { ProjectBlock } from "./projectBlocks.ts";

/** "Data Analysis: Built a module" → "Built a module". Only a leading capitalised heading with no "." before the colon. */
export function stripHeading(bullet: string): string {
  return bullet.replace(/^[A-Z][^:.]{0,59}:\s+/, "");
}

function firstSentence(text: string): string {
  const match = /^.*?[.!?](?=\s|$)/.exec(text);
  return (match ? match[0] : text).trim();
}

/** Draft a site project from its résumé block. The copy is a starting point; it's polished alongside the Lego build. */
export function draftProject(id: string, block: ProjectBlock | undefined): Project {
  if (!block) return { id, name: "", blurb: "", description: "", tech: [], links: {}, legoBuild: "pending" };
  const sentences = block.bullets.map(stripHeading);
  return {
    id,
    name: block.name,
    blurb: block.note ?? firstSentence(sentences[0] ?? ""),
    description: sentences.join(" "),
    tech: block.tech,
    links: {},
    legoBuild: "pending",
  };
}
```

Create `scripts/resume/projectsSource.ts`:

```ts
import type { Project } from "../../src/content/types.ts";

function formatEntry(p: Project): string {
  const q = (s: string) => JSON.stringify(s);
  return [
    "  {",
    `    id: ${q(p.id)},`,
    `    name: ${q(p.name)},`,
    `    blurb: ${q(p.blurb)},`,
    "    description:",
    `      ${q(p.description)},`,
    `    tech: [${p.tech.map(q).join(", ")}],`,
    "    links: {},",
    `    legoBuild: "pending", // lego-gate: needs a Lego build before this can merge`,
    "  },",
    "",
  ].join("\n");
}

/** Insert a drafted project at the end of the `projects` array in projects.ts source. */
export function appendProjectEntry(source: string, project: Project): string {
  const end = source.lastIndexOf("];");
  if (end === -1) throw new Error("projects.ts: could not find the closing ]; of the projects array");
  const before = source.slice(0, end).replace(/\s*$/, "\n");
  return `${before}${formatEntry(project)}${source.slice(end)}`;
}
```

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run scripts/resume/draft.test.ts scripts/resume/projectsSource.test.ts && npm run build`
Expected: 6 tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add scripts/resume/draft.ts scripts/resume/draft.test.ts scripts/resume/projectsSource.ts scripts/resume/projectsSource.test.ts
git commit -m "feat(sync): draft new projects from the résumé and append them to projects.ts"
```

---

### Task 7: Sync planner

**Goal:** A pure function that decides what a sync run does: PDF refresh, list update, drafted new projects, and warnings.

**Files:**
- Create: `scripts/resume/plan.ts`
- Create: `scripts/resume/plan.test.ts`

**Acceptance Criteria:**
- [ ] `list` is the résumé IDs that exist in `projects.ts`, in résumé order; new IDs are excluded.
- [ ] `pdfChanged` is true when the hashes differ or the site PDF is missing; `listChanged` when `list` differs from the current list (order-sensitive).
- [ ] Each new ID yields a draft from the block whose `slugify(name)` equals it; if none, an empty draft plus warning `No résumé heading matches new project "<id>"; its draft is empty`.
- [ ] Each résumé heading whose slug isn't in the keywords yields warning `"<Name>" is on the résumé but not in its pdfkeywords projects= list`.

**Verify:** `npx vitest run scripts/resume/plan.test.ts` → passes

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `scripts/resume/plan.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { planSync, type SyncInput } from "./plan.ts";
import type { ProjectBlock } from "./projectBlocks.ts";

const myPose: ProjectBlock = { name: "MyPose", tech: [], bullets: [] };
const ledgr: ProjectBlock = { name: "Ledgr", note: "Finalist", tech: ["Bun"], bullets: ["Pipeline: Built it."] };
const gravi: ProjectBlock = { name: "Gravi", tech: ["Python"], bullets: ["Game: A physics game."] };

const base: SyncInput = {
  resumeIds: ["mypose", "ledgr"],
  knownIds: ["ledgr", "mypose", "traceandpace"],
  currentList: ["mypose", "ledgr"],
  pdfHash: "h1",
  sitePdfHash: "h1",
  blocks: [myPose, ledgr],
};

describe("planSync", () => {
  test("nothing changed", () => {
    expect(planSync(base)).toEqual({
      pdfChanged: false, listChanged: false, list: ["mypose", "ledgr"], newProjects: [], warnings: [],
    });
  });

  test("only the PDF changed", () => {
    const plan = planSync({ ...base, sitePdfHash: "h0" });
    expect([plan.pdfChanged, plan.listChanged]).toEqual([true, false]);
  });

  test("a missing site PDF counts as changed", () => {
    expect(planSync({ ...base, sitePdfHash: null }).pdfChanged).toBe(true);
  });

  test("reordering, adding, and removing known projects change the list", () => {
    expect(planSync({ ...base, resumeIds: ["ledgr", "mypose"] })).toMatchObject({ listChanged: true, list: ["ledgr", "mypose"] });
    expect(planSync({ ...base, resumeIds: ["mypose", "ledgr", "traceandpace"] })).toMatchObject({ listChanged: true, list: ["mypose", "ledgr", "traceandpace"] });
    expect(planSync({ ...base, resumeIds: ["mypose"] })).toMatchObject({ listChanged: true, list: ["mypose"] });
  });

  test("a new project is drafted and kept out of the list", () => {
    const plan = planSync({ ...base, resumeIds: ["mypose", "ledgr", "gravi"], blocks: [myPose, ledgr, gravi] });
    expect(plan.list).toEqual(["mypose", "ledgr"]);
    expect(plan.listChanged).toBe(false);
    expect(plan.newProjects).toEqual([
      { id: "gravi", name: "Gravi", blurb: "A physics game.", description: "A physics game.", tech: ["Python"], links: {}, legoBuild: "pending" },
    ]);
    expect(plan.warnings).toEqual([]);
  });

  test("a new project with no matching heading gets an empty draft and a warning", () => {
    const plan = planSync({ ...base, resumeIds: ["mypose", "ledgr", "gravi"] });
    expect(plan.newProjects[0]).toMatchObject({ id: "gravi", name: "", legoBuild: "pending" });
    expect(plan.warnings).toEqual(['No résumé heading matches new project "gravi"; its draft is empty']);
  });

  test("warns about résumé headings missing from the keywords", () => {
    const plan = planSync({ ...base, blocks: [myPose, ledgr, gravi] });
    expect(plan.warnings).toEqual(['"Gravi" is on the résumé but not in its pdfkeywords projects= list']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run scripts/resume/plan.test.ts`
Expected: FAIL — cannot resolve `./plan.ts`.

- [ ] **Step 3: Implement**

Create `scripts/resume/plan.ts`:

```ts
import type { Project } from "../../src/content/types.ts";
import { draftProject } from "./draft.ts";
import { slugify, type ProjectBlock } from "./projectBlocks.ts";

export interface SyncInput {
  /** From the PDF keywords, in résumé order. */
  resumeIds: string[];
  /** IDs present in projects.ts. */
  knownIds: string[];
  /** Current contents of resume-projects.json. */
  currentList: string[];
  pdfHash: string;
  /** Hash of public/resume.pdf, or null if it doesn't exist. */
  sitePdfHash: string | null;
  /** Project blocks parsed from the résumé text. */
  blocks: ProjectBlock[];
}

export interface SyncPlan {
  pdfChanged: boolean;
  listChanged: boolean;
  /** Known résumé projects in résumé order: the next resume-projects.json. */
  list: string[];
  /** Drafts for résumé IDs the site doesn't have yet. */
  newProjects: Project[];
  warnings: string[];
}

export function planSync(input: SyncInput): SyncPlan {
  const known = new Set(input.knownIds);
  const list = input.resumeIds.filter((id) => known.has(id));
  const blockBySlug = new Map(input.blocks.map((b) => [slugify(b.name), b]));
  const warnings: string[] = [];

  const newProjects = input.resumeIds
    .filter((id) => !known.has(id))
    .map((id) => {
      const block = blockBySlug.get(id);
      if (!block) warnings.push(`No résumé heading matches new project "${id}"; its draft is empty`);
      return draftProject(id, block);
    });

  const listed = new Set(input.resumeIds);
  for (const block of input.blocks) {
    if (!listed.has(slugify(block.name))) {
      warnings.push(`"${block.name}" is on the résumé but not in its pdfkeywords projects= list`);
    }
  }

  return {
    pdfChanged: input.pdfHash !== input.sitePdfHash,
    listChanged: list.join(",") !== input.currentList.join(","),
    list,
    newProjects,
    warnings,
  };
}
```

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run scripts/resume/plan.test.ts && npm run build`
Expected: 7 tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add scripts/resume/plan.ts scripts/resume/plan.test.ts
git commit -m "feat(sync): plan what a résumé sync changes"
```

---

### Task 8: PDF reader and résumé finder

**Goal:** Read keywords and text from PDF bytes with `pdfjs-dist`, and find the newest PDF in a directory that carries the résumé contract.

**Files:**
- Create: `scripts/resume/pdf.ts`
- Create: `scripts/resume/findResume.ts`
- Create: `scripts/resume/pdf.test.ts`

**Acceptance Criteria:**
- [ ] `readKeywords` returns the PDF's Keywords string (or `undefined`); `readText` returns page text with `\n` at line ends; `sha256` returns hex.
- [ ] `findResume(dir)` returns `{ kind: "found", path, bytes, ids }` for the newest-by-mtime PDF whose keywords contain `projects=`, skipping non-contract PDFs, non-PDF files, and unreadable PDFs.
- [ ] Returns `{ kind: "none" }` when no PDF carries the contract, and `{ kind: "error", path, error }` (error prefixed with the filename) when the newest contract PDF's keywords are malformed.

**Verify:** `npx vitest run scripts/resume/pdf.test.ts` → passes

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `scripts/resume/pdf.test.ts`:

```ts
// @vitest-environment node
import { mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, test } from "vitest";
import { findResume } from "./findResume.ts";
import { readKeywords, readText, sha256 } from "./pdf.ts";

async function makePdf(lines: string[], keywords?: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  lines.forEach((line, i) => page.drawText(line, { x: 50, y: 740 - i * 16, size: 11, font }));
  if (keywords !== undefined) doc.setKeywords([keywords]);
  return doc.save();
}

function write(dir: string, name: string, bytes: Uint8Array | string, ageSeconds: number): string {
  const path = join(dir, name);
  writeFileSync(path, bytes);
  const t = Date.now() / 1000 - ageSeconds;
  utimesSync(path, t, t);
  return path;
}

describe("pdf", () => {
  test("reads keywords and text", async () => {
    const bytes = await makePdf(["Projects", "MyPose | React April 2026"], "projects=mypose");
    expect(await readKeywords(bytes)).toBe("projects=mypose");
    const text = await readText(bytes);
    expect(text).toContain("Projects");
    expect(text).toContain("MyPose | React April 2026");
  });

  test("keywords are undefined when the PDF has none", async () => {
    expect(await readKeywords(await makePdf(["hello"]))).toBeUndefined();
  });

  test("sha256 is a hex digest", () => {
    expect(sha256(new TextEncoder().encode("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("findResume", () => {
  test("picks the newest PDF that carries the contract", async () => {
    const dir = mkdtempSync(join(tmpdir(), "resume-"));
    write(dir, "old.pdf", await makePdf(["old"], "projects=mypose"), 300);
    const newer = write(dir, "David Gonzalez Resume 2028.pdf", await makePdf(["new"], "projects=mypose,ledgr"), 200);
    write(dir, "lab-template.pdf", await makePdf(["not a résumé"]), 100);
    write(dir, "broken.pdf", "this is not a pdf", 50);
    write(dir, "notes.txt", "projects=nope", 10);

    const found = await findResume(dir);
    expect(found).toMatchObject({ kind: "found", path: newer, ids: ["mypose", "ledgr"] });
  });

  test("none when no PDF carries the contract", async () => {
    const dir = mkdtempSync(join(tmpdir(), "resume-"));
    write(dir, "lab-template.pdf", await makePdf(["x"]), 10);
    expect(await findResume(dir)).toEqual({ kind: "none" });
  });

  test("an error naming the file when its keywords are malformed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "resume-"));
    const bad = write(dir, "resume.pdf", await makePdf(["x"], "projects=MyPose"), 10);
    expect(await findResume(dir)).toEqual({ kind: "error", path: bad, error: "resume.pdf: invalid project id(s): MyPose" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run scripts/resume/pdf.test.ts`
Expected: FAIL — cannot resolve `./findResume.ts` / `./pdf.ts`.

- [ ] **Step 3: Implement**

Create `scripts/resume/pdf.ts`:

```ts
import { createHash } from "node:crypto";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// pdfjs, not pdf-lib: pdf-lib can't read the Info dictionary of pdfTeX's xref-stream PDFs.
function open(bytes: Uint8Array) {
  // pdfjs takes ownership of (detaches) the buffer it's given, so hand it a copy.
  return getDocument({ data: bytes.slice(), verbosity: 0 }).promise;
}

export async function readKeywords(bytes: Uint8Array): Promise<string | undefined> {
  const doc = await open(bytes);
  try {
    const { info } = await doc.getMetadata();
    const keywords = (info as { Keywords?: unknown }).Keywords;
    return typeof keywords === "string" && keywords !== "" ? keywords : undefined;
  } finally {
    await doc.destroy();
  }
}

export async function readText(bytes: Uint8Array): Promise<string> {
  const doc = await open(bytes);
  try {
    let text = "";
    for (let n = 1; n <= doc.numPages; n++) {
      const { items } = await (await doc.getPage(n)).getTextContent();
      for (const item of items) if ("str" in item) text += item.str + (item.hasEOL ? "\n" : "");
      text += "\n";
    }
    return text;
  } finally {
    await doc.destroy();
  }
}

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
```

Create `scripts/resume/findResume.ts`:

```ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { parseKeywords } from "./keywords.ts";
import { readKeywords } from "./pdf.ts";

export type FoundResume =
  | { kind: "found"; path: string; bytes: Uint8Array; ids: string[] }
  | { kind: "none" }
  | { kind: "error"; path: string; error: string };

/** The newest PDF in `dir` whose keywords carry `projects=`. Filenames are ignored. */
export async function findResume(dir: string): Promise<FoundResume> {
  const pdfs = readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .map((name) => join(dir, name))
    .map((path) => ({ path, mtime: statSync(path).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const { path } of pdfs) {
    const bytes = new Uint8Array(readFileSync(path));
    let keywords: string | undefined;
    try {
      keywords = await readKeywords(bytes);
    } catch {
      continue; // not a readable PDF
    }
    const parsed = parseKeywords(keywords);
    if (!parsed) continue;
    if (!parsed.ok) return { kind: "error", path, error: `${basename(path)}: ${parsed.error}` };
    return { kind: "found", path, bytes, ids: parsed.ids };
  }
  return { kind: "none" };
}
```

- [ ] **Step 4: Run tests and build**

Run: `npx vitest run scripts/resume/pdf.test.ts && npm run build`
Expected: 6 tests pass; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add scripts/resume/pdf.ts scripts/resume/findResume.ts scripts/resume/pdf.test.ts
git commit -m "feat(sync): read résumé PDFs and find the newest one in Downloads"
```

---

### Task 9: Git helpers and the sync CLI

**Goal:** `npm run sync:resume` finds the résumé, plans, and applies the safe path (commit + push to `main`) and the new-project path (branch + PR), printing a JSON result for the watcher.

**Files:**
- Create: `scripts/resume/git.ts`
- Create: `scripts/resume/git.test.ts`
- Create: `scripts/sync-resume.ts`

**Acceptance Criteria:**
- [ ] `makeGit(cwd)` provides `refreshToOriginMain`, `commitAll`, `pushMain`, `remoteBranchExists`, `startBranch`, `pushBranch`, `openPr`, `backToMain`; failures throw errors that include git's stderr.
- [ ] A non-dry run refuses to run unless the repo directory is named `portfolio-sync` (so it can never `git reset --hard` a working copy).
- [ ] A non-dry run first resets to `origin/main`, runs `npm ci` only when `package-lock.json` changed since the last install, then re-executes itself so the run uses `origin/main`'s code and content.
- [ ] Safe path: copies the PDF to `public/resume.pdf`, writes `resume-projects.json`, runs `npm test` and `npm run build`, commits `content: sync résumé (<n> projects)`, pushes `HEAD:main`.
- [ ] New-project path: skips IDs whose `resume-sync/<id>` branch exists on the remote; otherwise branches from `origin/main`, appends the draft, commits, pushes, and opens a PR.
- [ ] `--json` prints exactly one JSON line `{ status, actions, warnings, error? }`; exit code 0 for `ok`, 1 for `error`.
- [ ] `--dry-run` writes nothing, runs no git commands, and works from any checkout.

**Verify:** `npx vitest run scripts/resume/git.test.ts && npm run build && npm run --silent sync:resume -- --dry-run` → tests pass; build succeeds; dry run prints the résumé path and plan (or `no résumé PDF …` if the keywords line isn't in Overleaf yet)

**Steps:**

- [ ] **Step 1: Write the failing git test**

Create `scripts/resume/git.test.ts`:

```ts
// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { makeGit } from "./git.ts";

function sh(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function setup(): { origin: string; work: string } {
  const origin = mkdtempSync(join(tmpdir(), "origin-"));
  sh(origin, "init", "-q", "--bare", "-b", "main");
  const work = mkdtempSync(join(tmpdir(), "work-"));
  sh(work, "init", "-q", "-b", "main");
  sh(work, "config", "user.email", "test@example.com");
  sh(work, "config", "user.name", "Test");
  writeFileSync(join(work, "a.txt"), "one\n");
  sh(work, "add", "-A");
  sh(work, "commit", "-q", "-m", "init");
  sh(work, "remote", "add", "origin", origin);
  sh(work, "push", "-q", "origin", "main");
  return { origin, work };
}

test("safe path: refresh, commit, push to main", () => {
  const { origin, work } = setup();
  const git = makeGit(work);
  git.refreshToOriginMain();
  writeFileSync(join(work, "b.txt"), "two\n");
  git.commitAll("content: sync résumé (2 projects)");
  git.pushMain();
  expect(sh(origin, "log", "-1", "--format=%s", "main")).toBe("content: sync résumé (2 projects)");
});

test("new-project path: branch from origin/main, push, detect on remote", () => {
  const { work } = setup();
  const git = makeGit(work);
  git.refreshToOriginMain();
  expect(git.remoteBranchExists("resume-sync/gravi")).toBe(false);
  git.startBranch("resume-sync/gravi");
  writeFileSync(join(work, "c.txt"), "three\n");
  git.commitAll("content: draft new project gravi from résumé");
  git.pushBranch("resume-sync/gravi");
  expect(git.remoteBranchExists("resume-sync/gravi")).toBe(true);
  git.backToMain();
  expect(sh(work, "rev-parse", "HEAD")).toBe(sh(work, "rev-parse", "origin/main"));
});

test("failures carry git's stderr", () => {
  const { work } = setup();
  expect(() => makeGit(work).pushBranch("no-such-branch")).toThrow(/git push -q -u origin no-such-branch failed: .*no-such-branch/s);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run scripts/resume/git.test.ts`
Expected: FAIL — cannot resolve `./git.ts`.

- [ ] **Step 3: Implement the git helpers**

Create `scripts/resume/git.ts`:

```ts
import { spawnSync } from "node:child_process";

function run(cwd: string, cmd: string, args: string[]): string {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed: ${(r.stderr || r.stdout).trim()}`);
  return r.stdout.trim();
}

export function makeGit(cwd: string) {
  const git = (...args: string[]) => run(cwd, "git", args);
  return {
    /** Discard everything and sit on a detached origin/main. Only ever run in the sync worktree. */
    refreshToOriginMain() {
      git("fetch", "-q", "origin");
      git("checkout", "-q", "--detach", "origin/main");
      git("reset", "-q", "--hard", "origin/main");
      git("clean", "-fdq");
    },
    commitAll(message: string) {
      git("add", "-A");
      git("commit", "-q", "-m", message);
    },
    pushMain() {
      git("push", "-q", "origin", "HEAD:main");
    },
    remoteBranchExists(branch: string): boolean {
      return git("ls-remote", "--heads", "origin", branch) !== "";
    },
    startBranch(branch: string) {
      git("checkout", "-q", "-B", branch, "origin/main");
    },
    pushBranch(branch: string) {
      git("push", "-q", "-u", "origin", branch);
    },
    /** Returns the PR URL. Uses the owner's gh login, so the PR triggers workflows. */
    openPr(branch: string, title: string, body: string): string {
      return run(cwd, "gh", ["pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body]);
    },
    backToMain() {
      git("checkout", "-q", "--detach", "origin/main");
    },
  };
}
```

- [ ] **Step 4: Run the git test**

Run: `npx vitest run scripts/resume/git.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Implement the CLI**

Create `scripts/sync-resume.ts`:

```ts
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import type { Project } from "../src/content/types.ts";
import { projects } from "../src/content/projects.ts";
import { findResume } from "./resume/findResume.ts";
import { makeGit } from "./resume/git.ts";
import { readText, sha256 } from "./resume/pdf.ts";
import { planSync, type SyncPlan } from "./resume/plan.ts";
import { parseProjectBlocks } from "./resume/projectBlocks.ts";
import { appendProjectEntry } from "./resume/projectsSource.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SYNC_WORKTREE = "portfolio-sync";
const SITE_PDF = join(ROOT, "public/resume.pdf");
const LIST_JSON = join(ROOT, "src/content/resume-projects.json");
const PROJECTS_TS = join(ROOT, "src/content/projects.ts");
const LOCK_STAMP = join(ROOT, "node_modules/.sync-lock-hash");

interface Result {
  status: "ok" | "error";
  actions: string[];
  warnings: string[];
  error?: string;
}

const { values: opts } = parseArgs({
  options: {
    downloads: { type: "string", default: "/mnt/c/Users/ddgg0/Downloads" },
    json: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "no-refresh": { type: "boolean", default: false },
  },
});

function runQuiet(cmd: string, args: string[]): void {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8" });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    const tail = `${r.stdout}${r.stderr}`.trim().split("\n").slice(-20).join("\n");
    throw new Error(`${cmd} ${args.join(" ")} failed:\n${tail}`);
  }
}

/** Reset the sync worktree to origin/main, reinstall if needed, then run the fresh copy of this script. */
function refreshAndReexec(): never {
  if (basename(ROOT) !== SYNC_WORKTREE) {
    throw new Error(`refusing to reset ${ROOT}: a real sync only runs in ~/projects/${SYNC_WORKTREE} (use --dry-run elsewhere)`);
  }
  makeGit(ROOT).refreshToOriginMain();
  const lockHash = sha256(readFileSync(join(ROOT, "package-lock.json")));
  if (!existsSync(LOCK_STAMP) || readFileSync(LOCK_STAMP, "utf8") !== lockHash) {
    runQuiet("npm", ["ci", "--no-audit", "--no-fund"]);
    writeFileSync(LOCK_STAMP, lockHash);
  }
  const child = spawnSync(
    process.execPath,
    ["--import", "tsx", join(ROOT, "scripts/sync-resume.ts"), ...process.argv.slice(2), "--no-refresh"],
    { cwd: ROOT, stdio: "inherit" },
  );
  process.exit(child.status ?? 1);
}

function describePlan(path: string, plan: SyncPlan): string[] {
  return [
    `résumé: ${path}`,
    `projects on the résumé the site knows: ${plan.list.join(", ") || "(none)"}`,
    plan.pdfChanged ? "would refresh public/resume.pdf" : "résumé PDF unchanged",
    plan.listChanged ? "would update resume-projects.json" : "project list unchanged",
    ...plan.newProjects.map((p) => `would open a PR for new project ${p.id}: ${JSON.stringify(p)}`),
  ];
}

function prBody(p: Project): string {
  return [
    `The résumé lists **${p.id}**, which the site doesn't have yet.`,
    "",
    "This branch adds a draft entry built from the résumé text. Before merging:",
    "1. Add a Lego build for it and set `legoBuild`.",
    "2. Rewrite the draft copy in the site's first-person voice.",
    "3. After merging, run `npm run sync:resume` in `~/projects/portfolio-sync` so it joins `resume-projects.json`.",
    "",
    "Drafted entry:",
    "```json",
    JSON.stringify(p, null, 2),
    "```",
  ].join("\n");
}

async function sync(): Promise<Result> {
  const found = await findResume(opts.downloads);
  if (found.kind === "none") {
    return { status: "ok", actions: [`no résumé PDF (pdfkeywords with projects=) in ${opts.downloads}`], warnings: [] };
  }
  if (found.kind === "error") return { status: "error", actions: [], warnings: [], error: found.error };

  const plan = planSync({
    resumeIds: found.ids,
    knownIds: projects.map((p) => p.id),
    currentList: JSON.parse(readFileSync(LIST_JSON, "utf8")) as string[],
    pdfHash: sha256(found.bytes),
    sitePdfHash: existsSync(SITE_PDF) ? sha256(readFileSync(SITE_PDF)) : null,
    blocks: parseProjectBlocks(await readText(found.bytes)),
  });
  if (opts["dry-run"]) return { status: "ok", actions: describePlan(found.path, plan), warnings: plan.warnings };

  const git = makeGit(ROOT);
  const actions: string[] = [];

  if (plan.pdfChanged || plan.listChanged) {
    copyFileSync(found.path, SITE_PDF);
    writeFileSync(LIST_JSON, `${JSON.stringify(plan.list, null, 2)}\n`);
    runQuiet("npm", ["test"]);
    runQuiet("npm", ["run", "build"]);
    git.commitAll(`content: sync résumé (${plan.list.length} projects)`);
    git.pushMain();
    const what = [plan.pdfChanged ? "refreshed résumé PDF" : "", plan.listChanged ? `projects now ${plan.list.join(", ")}` : ""];
    actions.push(`pushed to main: ${what.filter(Boolean).join("; ")}`);
  }

  for (const project of plan.newProjects) {
    const branch = `resume-sync/${project.id}`;
    if (git.remoteBranchExists(branch)) {
      actions.push(`awaiting Lego build: ${branch}`);
      continue;
    }
    git.startBranch(branch);
    writeFileSync(PROJECTS_TS, appendProjectEntry(readFileSync(PROJECTS_TS, "utf8"), project));
    git.commitAll(`content: draft new project ${project.id} from résumé`);
    git.pushBranch(branch);
    const url = git.openPr(branch, `New project: ${project.name || project.id} (needs a Lego build)`, prBody(project));
    git.backToMain();
    actions.push(`opened ${url} for new project ${project.id}`);
  }

  if (actions.length === 0) actions.push("no changes");
  return { status: "ok", actions, warnings: plan.warnings };
}

async function main(): Promise<void> {
  let result: Result;
  try {
    if (!opts["dry-run"] && !opts["no-refresh"]) refreshAndReexec();
    result = await sync();
  } catch (err) {
    result = { status: "error", actions: [], warnings: [], error: err instanceof Error ? err.message : String(err) };
  }
  if (opts.json) {
    console.log(JSON.stringify(result));
  } else {
    for (const a of result.actions) console.log(`• ${a}`);
    for (const w of result.warnings) console.log(`⚠ ${w}`);
    if (result.error) console.error(`✖ ${result.error}`);
  }
  process.exit(result.status === "ok" ? 0 : 1);
}

await main();
```

- [ ] **Step 6: Build, then dry-run against the real Downloads folder**

Run: `npm run build && npm run --silent sync:resume -- --dry-run`
Expected: build succeeds. If the owner has already added the keywords line and exported, output starts with `• résumé: /mnt/c/Users/ddgg0/Downloads/<file>.pdf` and `• projects on the résumé the site knows: mypose, ledgr`. Otherwise: `• no résumé PDF (pdfkeywords with projects=) in /mnt/c/Users/ddgg0/Downloads`. Either is a pass; nothing in the repo changes (`git status --short` is empty).

- [ ] **Step 7: Confirm the working-copy guard**

Run: `npm run --silent sync:resume -- --json; echo "exit=$?"`
Expected: one JSON line with `"status":"error"` and an error starting `refusing to reset`, then `exit=1`. `git status --short` is still empty.

- [ ] **Step 8: Run the full suite and commit**

Run: `npm test && npm run build`
Expected: all pass.

```bash
git add scripts/resume/git.ts scripts/resume/git.test.ts scripts/sync-resume.ts
git commit -m "feat(sync): the sync-resume CLI with git and PR automation"
```

---

### Task 10: Lego gate workflow with Gmail notification

**Goal:** On every PR to `main`, run the Lego gate; when it fails on a `resume-sync/*` branch, email `ddgonzalez.cs@gmail.com`.

**Files:**
- Create: `.github/workflows/lego-gate.yml`

**Acceptance Criteria:**
- [ ] Runs on `pull_request` to `main`, guarded by `github.repository == 'daviddgonzalez/daviddgonzalez.github.io'`.
- [ ] Runs `npx vitest run src/content/lego-gate.test.ts` as step `gate` on Node 22.
- [ ] The email step runs only if `steps.gate.outcome == 'failure'` and the head ref starts with `resume-sync/`; it uses `dawidd6/action-send-mail@v22` with `smtp.gmail.com:465`, secrets `GMAIL_USER`/`GMAIL_APP_PASSWORD`, subject `New project '<id>' needs a Lego build`, and the PR link and body in the message.
- [ ] The file parses as YAML.

**Verify:** `python3 -c "import yaml; w = yaml.safe_load(open('.github/workflows/lego-gate.yml')); print(list(w['jobs']))"` → `['lego-gate']`

**Steps:**

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/lego-gate.yml`:

```yaml
name: Lego gate

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  lego-gate:
    # Only on the user-site repo, not the mirror (same guard as deploy.yml).
    if: github.repository == 'daviddgonzalez/daviddgonzalez.github.io'
    runs-on: ubuntu-latest
    steps:
      - id: project
        run: echo "id=${GITHUB_HEAD_REF#resume-sync/}" >> "$GITHUB_OUTPUT"
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - id: gate
        name: Every project has a Lego build
        run: npx vitest run src/content/lego-gate.test.ts
      - name: Email that a new project needs a Lego build
        if: failure() && steps.gate.outcome == 'failure' && startsWith(github.head_ref, 'resume-sync/')
        uses: dawidd6/action-send-mail@v22
        with:
          server_address: smtp.gmail.com
          server_port: 465
          secure: true
          username: ${{ secrets.GMAIL_USER }}
          password: ${{ secrets.GMAIL_APP_PASSWORD }}
          from: Portfolio resume sync <${{ secrets.GMAIL_USER }}>
          to: ddgonzalez.cs@gmail.com
          subject: "New project '${{ steps.project.outputs.id }}' needs a Lego build"
          body: |
            Your résumé lists "${{ steps.project.outputs.id }}", which the site doesn't have yet, so it's waiting on a Lego build.

            Pull request: ${{ github.event.pull_request.html_url }}
            Branch: ${{ github.head_ref }}

            Ask Claude to make the Lego build on that branch.

            ${{ github.event.pull_request.body }}
```

- [ ] **Step 2: Validate the YAML**

Run: `python3 -c "import yaml; w = yaml.safe_load(open('.github/workflows/lego-gate.yml')); print(list(w['jobs']))"`
Expected: `['lego-gate']`

- [ ] **Step 3: Confirm the gate command passes locally**

Run: `npx vitest run src/content/lego-gate.test.ts`
Expected: 2 tests pass.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/lego-gate.yml
git commit -m "ci: Lego gate on PRs, with a Gmail alert for new résumé projects"
```

---

### Task 11: Windows watcher and task registration

**Goal:** PowerShell scripts that register a per-user Scheduled Task and, on each run, invoke the sync in WSL only when a PDF in Downloads changed, logging every run and toasting errors and warnings.

**Files:**
- Create: `scripts/windows/resume-watch.ps1`
- Create: `scripts/windows/register-resume-task.ps1`

**Acceptance Criteria:**
- [ ] Both scripts parse with zero errors under Windows PowerShell 5.1 and contain only ASCII characters (5.1 reads BOM-less files as ANSI).
- [ ] `resume-watch.ps1` exits without starting WSL when no `*.pdf` in Downloads is newer than `lastScan`; otherwise runs the sync with `--json`, advances `lastScan` only on `status: "ok"`, appends a log line (keeps the last 1000), and toasts on error or warnings.
- [ ] `resume-watch.ps1 -ToastTest` shows a test toast and exits.
- [ ] `register-resume-task.ps1 [-IntervalMinutes n]` (default 60) copies the watcher to `%LOCALAPPDATA%\resume-sync\` and registers/replaces task `PortfolioResumeSync`: at log on, repeating every n minutes indefinitely, start when available, ignore new instances, restart on failure, launched hidden via `conhost.exe --headless`.

**Verify:** the parse check in Step 3 prints `0` for both files, and `-ToastTest` shows a notification

**Steps:**

- [ ] **Step 1: Create the watcher**

Create `scripts/windows/resume-watch.ps1`:

```powershell
# Runs from the PortfolioResumeSync scheduled task. Cheap check first: only wake WSL when a PDF
# in Downloads changed since the last successful scan. ASCII only (PowerShell 5.1 reads this as ANSI).
param([switch]$ToastTest)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$dir = Join-Path $env:LOCALAPPDATA "resume-sync"
$statePath = Join-Path $dir "state.json"
$logPath = Join-Path $dir "log.txt"
$downloads = Join-Path $env:USERPROFILE "Downloads"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

function Write-Log([string]$line) {
  Add-Content -Path $logPath -Value ("{0} {1}" -f (Get-Date).ToString("s"), $line) -Encoding UTF8
  $lines = @(Get-Content -Path $logPath -Encoding UTF8)
  if ($lines.Count -gt 1000) { $lines[-1000..-1] | Set-Content -Path $logPath -Encoding UTF8 }
}

function Show-Toast([string]$title, [string]$message) {
  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
  $t = [System.Security.SecurityElement]::Escape($title)
  $m = [System.Security.SecurityElement]::Escape($message)
  $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
  $xml.LoadXml("<toast><visual><binding template=`"ToastGeneric`"><text>$t</text><text>$m</text></binding></visual></toast>")
  $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show(
    [Windows.UI.Notifications.ToastNotification]::new($xml))
}

if ($ToastTest) { Show-Toast "Resume sync" "Test notification - the watcher can reach you."; exit 0 }

try {
  $scanStart = Get-Date
  $lastScan = [datetime]::MinValue
  if (Test-Path $statePath) { $lastScan = [datetime](Get-Content $statePath -Raw | ConvertFrom-Json).lastScan }

  $changed = @(Get-ChildItem -Path $downloads -Filter *.pdf -File | Where-Object { $_.LastWriteTime -gt $lastScan })
  if ($changed.Count -eq 0) { exit 0 }

  $cmd = 'source ~/.nvm/nvm.sh && cd ~/projects/portfolio-sync && npm run --silent sync:resume -- --json'
  $ErrorActionPreference = "Continue"  # PowerShell 5.1 turns native stderr into terminating errors under Stop
  # -e runs bash directly with $cmd as one argument; "wsl.exe --" would re-join the words through a shell.
  $out = & wsl.exe -d Ubuntu-24.04 -e bash -c $cmd 2>&1 | Out-String
  $ErrorActionPreference = "Stop"

  $jsonLine = $out -split "`r?`n" | Where-Object { $_.Trim().StartsWith("{") } | Select-Object -Last 1
  if ($jsonLine) {
    $result = $jsonLine | ConvertFrom-Json
  } else {
    $result = [pscustomobject]@{ status = "error"; actions = @(); warnings = @(); error = "sync produced no result: $($out.Trim())" }
  }

  if ($result.status -eq "ok") {
    @{ lastScan = $scanStart.ToString("o") } | ConvertTo-Json | Set-Content -Path $statePath -Encoding UTF8
  }
  Write-Log ("{0} actions=[{1}] warnings=[{2}] error={3}" -f $result.status, ($result.actions -join "; "), ($result.warnings -join "; "), $result.error)

  if ($result.status -ne "ok") { Show-Toast "Resume sync failed" ([string]$result.error) }
  foreach ($w in @($result.warnings)) { if ($w) { Show-Toast "Resume sync warning" ([string]$w) } }
} catch {
  Write-Log "error watcher: $($_.Exception.Message)"
  Show-Toast "Resume sync failed" $_.Exception.Message
  exit 1
}
```

- [ ] **Step 2: Create the registration script**

Create `scripts/windows/register-resume-task.ps1`:

```powershell
# Registers (or replaces) the PortfolioResumeSync scheduled task for the current user.
#   register-resume-task.ps1 -IntervalMinutes 1   # while testing
#   register-resume-task.ps1                      # production: hourly
# ASCII only (PowerShell 5.1 reads this as ANSI).
param([int]$IntervalMinutes = 60)

$ErrorActionPreference = "Stop"

$dir = Join-Path $env:LOCALAPPDATA "resume-sync"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$watcher = Join-Path $dir "resume-watch.ps1"
Copy-Item -Force -Path (Join-Path $PSScriptRoot "resume-watch.ps1") -Destination $watcher

# conhost --headless keeps a console window from flashing up on every run.
$action = New-ScheduledTaskAction -Execute "conhost.exe" `
  -Argument "--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$watcher`""

$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
# A log-on trigger can't take -RepetitionInterval directly; borrow the repetition from a one-time trigger.
# Omitting -RepetitionDuration repeats indefinitely.
$trigger.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) `
  -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)).Repetition

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew `
  -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "PortfolioResumeSync" -Action $action -Trigger $trigger `
  -Settings $settings -Force | Out-Null

Write-Output "Registered PortfolioResumeSync: at log on, then every $IntervalMinutes minute(s)."
Write-Output "Watcher: $watcher"
Write-Output "Log:     $(Join-Path $dir 'log.txt')"
```

- [ ] **Step 3: Check both scripts parse and are ASCII**

Run:

```bash
for f in scripts/windows/resume-watch.ps1 scripts/windows/register-resume-task.ps1; do
  LC_ALL=C grep -nP '[^\x00-\x7F]' "$f" && echo "NON-ASCII in $f"
  p=$(wslpath -w "$f")
  powershell.exe -NoProfile -Command "\$e=\$null; [void][System.Management.Automation.Language.Parser]::ParseFile('$p',[ref]\$null,[ref]\$e); \$e.Count" | tr -d '\r'
done
```

Expected: `0` printed twice and no `NON-ASCII` lines.

- [ ] **Step 4: Toast smoke test**

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w scripts/windows/resume-watch.ps1)" -ToastTest`
Expected: a Windows notification titled "Resume sync" appears (bottom-right, and in the notification centre, Win + N).

- [ ] **Step 5: Commit**

```bash
git add scripts/windows/resume-watch.ps1 scripts/windows/register-resume-task.ps1
git commit -m "feat(sync): Windows watcher and scheduled-task registration"
```

Registration itself happens in Task 13: registering now would run the sync against a `portfolio-sync` worktree that doesn't exist yet.

---

### Task 12: Document résumé sync in the README

**Goal:** The README explains how the site follows the résumé, how to add a new project, and the one-time setup.

**Files:**
- Modify: `README.md`

**Acceptance Criteria:**
- [ ] README's "Editing content" section says the Projects section and `resume.pdf` follow the résumé and that `resume-projects.json` is sync-owned.
- [ ] A new "Résumé sync" section covers the keywords line, the daemon, the new-project flow, `--dry-run`, and one-time setup (keywords line, Gmail secrets, sync worktree, task registration) with exact commands.

**Verify:** `grep -c "sync:resume" README.md` → at least `2`

**Steps:**

- [ ] **Step 1: Update "Editing content"**

In `README.md`, replace the bullets for `projects.ts` and the résumé PDF line:

```markdown
- `projects.ts` — every project's copy, tech, links and Lego build. Which ones appear, and in what order, follows the résumé (see **Résumé sync**); add `pinned: true` to show a project that isn't on the résumé.
```

```markdown
The résumé PDF is served from `public/resume.pdf`, and `src/content/resume-projects.json` lists the résumé's projects. Both are written by the résumé sync; don't edit them by hand.
```

- [ ] **Step 2: Add a "Résumé sync" section before "Accessibility"**

```markdown
## Résumé sync

The Projects section and `public/resume.pdf` follow the résumé exported from Overleaf.

**The contract.** The résumé's preamble names its projects, in order, using the IDs from `projects.ts`:

    \hypersetup{pdfkeywords={projects=mypose,ledgr}}

Any PDF in Downloads whose keywords contain `projects=` is treated as the résumé, whatever it's called; the newest one wins.

**How it runs.** A Windows scheduled task (`PortfolioResumeSync`) runs at log on and then on an interval. When a PDF in Downloads has changed, it runs `npm run sync:resume` in `~/projects/portfolio-sync`, a dedicated worktree that is reset to `origin/main` on every run. Log: `%LOCALAPPDATA%\resume-sync\log.txt`. Failures and warnings show as Windows notifications.

- **Known projects** (added, removed, reordered) and PDF changes are tested, built, committed and pushed to `main`, which deploys.
- **A new project** goes to a `resume-sync/<id>` branch with a draft entry (`legoBuild: "pending"`) and a PR. The Lego gate fails on that PR and emails ddgonzalez.cs@gmail.com. Add the Lego build and polish the copy on that branch, merge, then run `npm run sync:resume` in `~/projects/portfolio-sync` so the project joins `resume-projects.json`.

**Preview without changing anything** (works in any checkout):

    npm run sync:resume -- --dry-run

**One-time setup**

1. Add the `\hypersetup{pdfkeywords={projects=…}}` line to the résumé in Overleaf and export it to Downloads.
2. Turn on 2-Step Verification for ddgonzalez.cs@gmail.com, create an app password, then:

        gh secret set GMAIL_USER --body ddgonzalez.cs@gmail.com
        gh secret set GMAIL_APP_PASSWORD

3. Create the sync worktree:

        git -C ~/projects/portfolio worktree add ~/projects/portfolio-sync --detach origin/main
        cd ~/projects/portfolio-sync && npm ci

4. Register the task (from WSL; add `-IntervalMinutes 1` while testing):

        powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w ~/projects/portfolio-sync/scripts/windows/register-resume-task.ps1)"
```

- [ ] **Step 3: Verify and commit**

Run: `grep -c "sync:resume" README.md`
Expected: `3` (at least 2).

```bash
git add README.md
git commit -m "docs: explain résumé sync and its one-time setup"
```

---

### Task 13: End-to-end check on the real machine

**Goal:** After the implementation PR merges, prove on the owner's machine that a résumé export reaches `main` within about a minute, that a new project opens a PR and emails ddgonzalez.cs@gmail.com, then switch the task to hourly.

> **USER-ORDERED GATE — NON-SKIPPABLE.** This task was requested by the user in the current conversation. It MUST NOT be closed by walking around it, by declaring it "verified inline", or by substituting a cheaper check. Close only after every item in `acceptanceCriteria` has been re-validated independently, with output captured.

**Files:**
- None in the repo. Creates `~/projects/portfolio-sync`, `%LOCALAPPDATA%\resume-sync\`, the `PortfolioResumeSync` task, and two repo secrets.

**Acceptance Criteria:**
- [ ] The implementation PR (Tasks 1–12) is merged to `main` and the site deploys, showing MyPose, Ledgr, TraceAndPace and "2025 – Present".
- [ ] `npm run --silent sync:resume -- --dry-run` in `~/projects/portfolio-sync` prints the Downloads résumé path and `projects on the résumé the site knows: mypose, ledgr`.
- [ ] With the task registered at `-IntervalMinutes 1`, a `content: sync résumé (2 projects)` commit appears on `origin/main` within ~2 minutes of exporting the résumé, and `log.txt` shows an `ok` line with `pushed to main`.
- [ ] A test résumé naming a new project `e2etest` opens a `resume-sync/e2etest` PR, the Lego gate check fails on it, and an email with subject `New project 'e2etest' needs a Lego build` arrives at ddgonzalez.cs@gmail.com.
- [ ] After cleanup, `origin/main`'s `public/resume.pdf` matches the real export again (same SHA-256) and the `e2etest` PR is closed with its branch deleted.
- [ ] The task is re-registered hourly: `Get-ScheduledTask PortfolioResumeSync` shows a repetition interval of `PT1H`.

**Verify:** capture the output of each check in the steps below

**Steps:**

- [ ] **Step 1: Merge the implementation**

Push the branch and open a PR (the Lego gate runs on it and must pass):

```bash
git push -u origin docs/resume-sync-spec
gh pr create --base main --head docs/resume-sync-spec --title "Résumé → site sync" --body "Implements docs/superpowers/specs/2026-09-28-resume-sync-design.md"
```

Owner merges. Confirm the deploy run succeeds (`gh run list --workflow deploy.yml --limit 1`) and the live site shows MyPose, Ledgr, TraceAndPace and "2025 – Present".

- [ ] **Step 2: Owner adds the keywords line in Overleaf**

In the 2028 résumé's preamble, after `\usepackage{hyperref}` (or its existing `\hypersetup`), add:

```latex
\hypersetup{pdfkeywords={projects=mypose,ledgr}}
```

Recompile and download the PDF to Downloads (any filename).

- [ ] **Step 3: Create the sync worktree and dry-run**

```bash
git -C ~/projects/portfolio fetch origin
git -C ~/projects/portfolio worktree add ~/projects/portfolio-sync --detach origin/main
cd ~/projects/portfolio-sync && npm ci && npm run --silent sync:resume -- --dry-run
```

Expected: `• résumé: /mnt/c/Users/ddgg0/Downloads/<file>.pdf`, `• projects on the résumé the site knows: mypose, ledgr`, and `would refresh public/resume.pdf` (the committed PDF is the June one).

- [ ] **Step 4: Owner adds the Gmail secrets**

Owner enables 2-Step Verification on ddgonzalez.cs@gmail.com, creates an app password (Google Account → Security → App passwords), then runs:

```bash
gh secret set GMAIL_USER --body ddgonzalez.cs@gmail.com
gh secret set GMAIL_APP_PASSWORD   # paste the app password when prompted
gh secret list
```

Expected: both secrets listed.

- [ ] **Step 5: Register the task at 1 minute and watch the safe path**

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w ~/projects/portfolio-sync/scripts/windows/register-resume-task.ps1)" -IntervalMinutes 1
```

If it fails with "Access is denied", run the same `register-resume-task.ps1` from an elevated Windows PowerShell once.

Wait up to 2 minutes, then:

```bash
git -C ~/projects/portfolio fetch origin && git -C ~/projects/portfolio log -1 --format=%s origin/main
tail -3 "$(wslpath "$(powershell.exe -NoProfile -Command '$env:LOCALAPPDATA' | tr -d '\r')")/resume-sync/log.txt"
```

Expected: `content: sync résumé (2 projects)` and a log line starting with the timestamp then `ok actions=[pushed to main: refreshed résumé PDF]`.

- [ ] **Step 6: Exercise the new-project path with a metadata-only test copy**

Make a copy of the real export whose keywords add `e2etest`, keeping the file byte-for-byte the same length so its PDF index stays valid (its visible content is identical to the real résumé, so the brief PDF refresh on `main` is harmless):

```bash
python3 - "/mnt/c/Users/ddgg0/Downloads/<real export>.pdf" "/mnt/c/Users/ddgg0/Downloads/e2e-resume-test.pdf" <<'EOF'
import sys
src = open(sys.argv[1], "rb").read()
old = b"/Keywords (projects=mypose,ledgr)"
new = b"/Keywords (projects=mypose,ledgr,e2etest)"
i = src.find(b"/Author ()"); j = src.find(b">>", i)
seg = src[i:j]
patched = seg.replace(b"/Author () ", b"").replace(b"/Subject () ", b"").replace(b"/Title () ", b"").replace(old, new)
assert old in seg and len(patched) <= len(seg), "Info dict layout differs; adjust the replacements"
out = src[:i] + patched + b" " * (len(seg) - len(patched)) + src[j:]
assert len(out) == len(src)
open(sys.argv[2], "wb").write(out)
print("wrote", sys.argv[2])
EOF
```

Wait up to 2 minutes, then:

```bash
gh pr list --head resume-sync/e2etest
gh pr checks "$(gh pr list --head resume-sync/e2etest --json number --jq '.[0].number')"
```

Expected: one open PR titled `New project: e2etest (needs a Lego build)`; the `lego-gate` check fails; a Windows warning toast said `No résumé heading matches new project "e2etest"; its draft is empty`; and the email `New project 'e2etest' needs a Lego build` is in ddgonzalez.cs@gmail.com (check spam the first time).

- [ ] **Step 7: Clean up and restore the real résumé**

```bash
gh pr close "$(gh pr list --head resume-sync/e2etest --json number --jq '.[0].number')" --delete-branch
rm "/mnt/c/Users/ddgg0/Downloads/e2e-resume-test.pdf"
touch "/mnt/c/Users/ddgg0/Downloads/<real export>.pdf"
```

Wait up to 2 minutes, then compare hashes:

```bash
git -C ~/projects/portfolio fetch origin
git -C ~/projects/portfolio show origin/main:public/resume.pdf | sha256sum
sha256sum "/mnt/c/Users/ddgg0/Downloads/<real export>.pdf"
```

Expected: identical hashes.

- [ ] **Step 8: Switch to hourly**

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w ~/projects/portfolio-sync/scripts/windows/register-resume-task.ps1)"
powershell.exe -NoProfile -Command "(Get-ScheduledTask PortfolioResumeSync).Triggers[0].Repetition.Interval" | tr -d '\r'
```

Expected: `PT1H`.
