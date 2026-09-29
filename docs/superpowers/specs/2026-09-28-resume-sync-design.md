# Résumé → Site Sync — Design Spec

**Date:** 2026-09-28
**Status:** Approved design, pending spec review
**Owner:** David Gonzalez

## 1. Overview

The site's Projects section and downloadable résumé should follow the résumé automatically. Today they are two sources of truth: the résumé is edited in Overleaf and exported as a PDF, then `public/resume.pdf` and `src/content/projects.ts` are updated by hand, and the two drift.

This design adds a small local pipeline:

- The résumé **declares its own project list** in its PDF metadata (one line in the Overleaf preamble).
- A **Windows Scheduled Task** notices when a new résumé PDF lands in Downloads and hands off to a **Node sync script** inside the repo.
- The sync script refreshes `public/resume.pdf` and the site's project list, runs the test suite, and **pushes straight to `main`** (which deploys) when everything is consistent.
- A project that is **new to the site** cannot go live automatically, because it needs a hand-made Lego build. It goes to a branch and PR instead, where a **CI gate** fails and **emails a Gmail notification** saying a Lego build is needed.

## 2. Goals & Non-Goals

### Goals
- Exporting a new résumé from Overleaf is the only manual step for routine updates (PDF changes, projects added/removed/reordered among ones the site already knows).
- The Projects section can never silently drift from the résumé: consistency is enforced by tests, not by discipline.
- A brand-new project never goes live half-finished; it waits on a PR until its Lego build exists, and the owner is notified by email.
- Everything else on the site (bio, experience, skills, education) is untouched by automation.

### Non-Goals (YAGNI)
- **One résumé only.** No SWE/AI tracks, no track toggle. (Considered and dropped: the owner is targeting SWE roles this cycle.)
- No syncing of experience, skills, bio, or education from the résumé.
- No overwriting of existing project copy. The site's first-person copy is deliberately different from the résumé's bullets.
- No LLM in the pipeline. Parsing is deterministic.
- No cloud watcher. Free Overleaf has no git sync or webhook, and GitHub cannot see local Downloads, so the trigger is necessarily local.

## 3. Fixed Content Decision: Education Dates

The education entry's period is changed permanently from `"Expected May 2028"` to **`"2025 – Present"`**, regardless of what any résumé says. The sync never reads or writes `education.ts`, and a content test pins the value (§10) so it cannot regress by hand either.

The downloadable PDF is the real résumé and still shows whatever graduation date it contains; the site cannot change the PDF's contents.

## 4. The Résumé Contract

The current résumé's Overleaf project (`David Gonzalez Resume 2028`) adds one line after `\usepackage{hyperref}` (hyperref is already loaded; the current PDF reports `Creator: LaTeX with hyperref`):

```latex
\hypersetup{pdfkeywords={projects=mypose,ledgr}}
```

Rules:
- The value is `;`-separated `key=value` pairs. Only `projects` is recognised; unknown keys are ignored.
- `projects` is a comma-separated list of project IDs matching `id` in `projects.ts` (`[a-z0-9-]+`), in the order they appear on the résumé. Surrounding whitespace is ignored. The list must be non-empty and contain no duplicates.
- **A PDF is "the résumé" if and only if its keywords contain `projects=`.** Filenames are ignored entirely; exports are observed to be renamed freely (`David Gonzalez Resume 2028.pdf`, `David_Gonzalez_Resume 2029.pdf`).
- If several PDFs in Downloads carry the contract, the one with the newest modification time wins. The `2029` variant should not carry the line.

A project ID for a new project is the lowercase alphanumeric slug of its résumé heading name (`TraceAndPace` → `traceandpace`), which is how the existing IDs already relate to their names. This convention lets the sync find the heading to draft from (§7.3).

## 5. Content Model Changes

### 5.1 `src/content/resume-projects.json` (new, owned by the sync)
The parsed `projects` list, verbatim, in résumé order:

```json
["mypose", "ledgr"]
```

This is the **only** content file the sync writes on the safe path. Humans do not edit it.

### 5.2 `src/content/types.ts`
```ts
export type LegoBuildRef = BuildKey | "pending";

export interface Project {
  /* …existing fields… */
  legoBuild: LegoBuildRef;   // was BuildKey; "pending" only ever exists on a resume-sync/* branch
  pinned?: boolean;          // NEW: show on the site even when not on the résumé
}
```

`Profile.resumeUrl` is unchanged (`/resume.pdf`).

### 5.3 `src/content/projects.ts` (still owned by the human)
- Unchanged structure. TraceAndPace gets `pinned: true`.
- The sync only ever **appends** a drafted entry to this file, and only on a `resume-sync/*` branch (§7.3).

### 5.4 Display order — `src/content/siteProjects.ts` (new, pure function)
```ts
siteProjects(projects: Project[], resumeIds: string[]): Project[]
```
1. Résumé projects, in `resumeIds` order.
2. Then pinned projects not already included, in `projects.ts` order.

IDs in `resumeIds` with no matching project are dropped defensively; the consistency tests (§10) make that unreachable on `main`. With today's data the site shows **MyPose, Ledgr, TraceAndPace**.

`src/sections/Projects.tsx` renders `siteProjects(projects, resumeProjects)` instead of `projects`. No visual change to cards; pinned projects are not visually distinguished.

The Lego registry treats `"pending"` as "no build" (renders nothing) so a pending entry typechecks and builds; the gate (§8) guarantees it never reaches `main`.

## 6. Architecture

```
Overleaf ──export──▶ C:\Users\ddgg0\Downloads\*.pdf
                              │
            Windows Scheduled Task (at log on, repeats every N min)
            %LOCALAPPDATA%\resume-sync\resume-watch.ps1
              • any *.pdf newer than lastScan?  no → exit
              • yes → wsl.exe -d Ubuntu-24.04 … npm run sync:resume -- --json
              • read JSON result → toast on error/warning; advance lastScan on success
                              │
            WSL: ~/projects/portfolio-sync  (dedicated git worktree)
            scripts/sync-resume.ts
              • reset to origin/main
              • find the résumé by keywords, parse, diff, apply
              ├─ safe changes ──▶ npm test && npm run build ──▶ push main ──▶ deploy.yml
              └─ new project  ──▶ branch resume-sync/<id> + PR ──▶ lego-gate.yml ──▶ Gmail
```

Units:

| Unit | Location | Responsibility | Depends on |
|---|---|---|---|
| Keyword parser | `scripts/resume/keywords.ts` | Keywords string → `string[]` of IDs, or a typed error | nothing |
| Résumé text parser | `scripts/resume/projectBlocks.ts` | Extracted PDF text → `{ name, note?, tech[], bullets[] }[]` | nothing |
| Draft builder | `scripts/resume/draft.ts` | Parsed block → `Project` draft with `legoBuild: "pending"` | types |
| Planner | `scripts/resume/plan.ts` | (résumé IDs, known projects, current list, PDF hashes) → a `SyncPlan` (§7.1) | nothing |
| PDF reader | `scripts/resume/pdf.ts` | Bytes → keywords and text (`pdfjs-dist`) | pdfjs-dist |
| Sync CLI | `scripts/sync-resume.ts` | Orchestration: scan, git, apply plan, run tests, push, open PR, report | all of the above, git, gh |
| Watcher | `scripts/windows/resume-watch.ps1` | Cheap change check, invoke WSL, toast | PowerShell 5.1 |
| Task registration | `scripts/windows/register-resume-task.ps1` | Install/replace the Scheduled Task | PowerShell 5.1 |
| Lego gate | `src/content/lego-gate.test.ts` + `.github/workflows/lego-gate.yml` | Fail while any project is `"pending"`; email on failure | Vitest, Gmail SMTP |

Parsers, draft builder, and planner are pure and hold all the decision logic; the CLI and PowerShell are thin shells around them.

Scripts are TypeScript run with `tsx` (new devDependency) so they can import `src/content/*.ts` directly. `npm run sync:resume` = `tsx scripts/sync-resume.ts`.

`pdfjs-dist` reads both keywords and text. `pdf-lib` was the first choice for keywords but cannot read the Info dictionary of pdfTeX's xref-stream PDFs (verified on the real résumé); it is kept only as a devDependency for generating test PDFs, whose keywords `pdfjs-dist` reads correctly.

## 7. The Sync (Node side)

### 7.1 Planning
Given the newest contract-bearing PDF:

1. Parse keywords → `resumeIds`.
2. Partition `resumeIds` into **known** (exists in `projects.ts`) and **new** (does not).
3. Build the plan:
   - `pdfChanged`: SHA-256 of the PDF ≠ SHA-256 of `public/resume.pdf`.
   - `listChanged`: `known` (in résumé order) ≠ `resume-projects.json`.
   - `newProjects`: each new ID, with its drafted entry (§7.3).
   - `warnings`: headings parsed from the résumé text whose slug is not in `resumeIds` ("on the page but missing from keywords", i.e. the keywords line was probably not updated). Heuristic: warns, never blocks.

### 7.2 Safe path → `main`
If `pdfChanged || listChanged`:
1. Copy the PDF to `public/resume.pdf`; write `known` to `resume-projects.json`.
2. `npm test && npm run build`. On failure: push nothing, report error.
3. Commit (`content: sync résumé (<n> projects)`) and `git push origin HEAD:main`. `deploy.yml` deploys as today.

New IDs are **excluded** from the list on the safe path, so the site stays current for everything else while a new project waits on its Lego build. The PDF itself (which already shows the new project) is still updated.

If nothing changed: exit successfully without committing.

### 7.3 New-project path → branch + PR
For each new ID with **no existing `resume-sync/<id>` branch on the remote**:
1. Start from `origin/main`, create branch `resume-sync/<id>`.
2. Draft the entry from the résumé text block whose heading slug equals the ID:
   - `name`: heading text before `|`, minus any parenthetical.
   - `blurb`: the parenthetical note if present (e.g. "Bank of America Code-a-thon Finalist"), else the first sentence of the first bullet.
   - `tech`: the comma-separated list after `|`, with the trailing date removed.
   - `description`: the bullets, each with its `Heading:` prefix stripped, joined into one paragraph.
   - `links: {}`, `legoBuild: "pending"`.
   - If no matching block is found, all text fields are empty strings (the PR and email say the draft failed).
3. Append the entry to the `projects` array in `projects.ts` (inserted before the file's final `];`).
4. Commit, push the branch, and `gh pr create` against `main` with the drafted entry in the body.

If `resume-sync/<id>` already exists, the sync leaves it untouched and reports "awaiting Lego build (PR #n)". It never force-pushes or rebuilds that branch, because the Lego build is committed there by hand.

The branch does **not** touch `resume-projects.json`. After the PR merges, the next sync run (or a manual `npm run sync:resume`) finds the ID is now known and adds it to the list via the safe path. This avoids merge conflicts on the list.

### 7.4 Working copy isolation
The sync runs only in `~/projects/portfolio-sync`, a dedicated git worktree of the portfolio repo, never in `~/projects/portfolio`. A non-dry run refuses to start unless the repo directory is named `portfolio-sync`, so it can never reset a working copy. After resetting, it re-executes itself so the run uses `origin/main`'s code and content, not the previous checkout's. Each run starts with `git fetch origin && git checkout --detach origin/main && git reset --hard && git clean -fd -e node_modules`, then `npm ci` if `package-lock.json` changed since the last install.

### 7.5 CLI flags
- `--downloads <dir>`: directory to scan (default `/mnt/c/Users/ddgg0/Downloads`).
- `--json`: print a single JSON result `{ status: "ok" | "error", actions: string[], warnings: string[], error?: string }` for the watcher.
- `--dry-run`: compute and print the plan; write no files and run no git commands. Safe to run from any checkout.

Exit code `0` on `ok` (including "nothing changed"), `1` on `error`.

## 8. The Lego Gate & Gmail Notification

- `src/content/lego-gate.test.ts`: fails, naming each offending ID, if any project in `projects.ts` has `legoBuild: "pending"`. It is part of the normal suite, so a pending entry can never pass the safe path or merge to `main` with green checks.
- `.github/workflows/lego-gate.yml`: runs on `pull_request` targeting `main`, guarded by `if: github.repository == 'daviddgonzalez/daviddgonzalez.github.io'` (same guard as `deploy.yml`). Steps: checkout, `npm ci`, `npx vitest run src/content/lego-gate.test.ts`.
- On failure, and only when `github.head_ref` starts with `resume-sync/`, a step sends mail via Gmail SMTP (`smtp.gmail.com:465`, `dawidd6/action-send-mail`):
  - **To:** `ddgonzalez.cs@gmail.com`
  - **Subject:** `New project '<id>' needs a Lego build`
  - **Body:** link to the PR and the drafted entry.
- Secrets: `GMAIL_USER`, `GMAIL_APP_PASSWORD` (a Google app password; requires 2-Step Verification on that account). One-time manual setup by the owner.
- Resolution flow: the owner asks Claude to make the Lego build; Claude commits the SVG build (adding a `BuildKey`) and polishes the drafted copy into the site's first-person voice on the same branch; the gate passes; Claude merges; then runs `npm run sync:resume` so the ID joins `resume-projects.json`.

PRs are opened with the owner's `gh` credentials (not `GITHUB_TOKEN`), so they trigger workflows normally.

## 9. The Watcher (Windows side)

### 9.1 Registration
`scripts/windows/register-resume-task.ps1 [-IntervalMinutes <n>]` (default `60`; use `1` while testing):
- Copies `resume-watch.ps1` to `%LOCALAPPDATA%\resume-sync\`, so the task never depends on reading from the WSL filesystem.
- Registers (or replaces) Scheduled Task `PortfolioResumeSync` for the current user: trigger **At log on**, repeating every `IntervalMinutes` indefinitely; settings: restart on failure, run as soon as possible after a missed start, do not start a new instance if one is running.
- Action: `powershell.exe -NoProfile -WindowStyle Hidden -File %LOCALAPPDATA%\resume-sync\resume-watch.ps1`.
- Re-running with a different interval replaces the task. Can be invoked from WSL through interop.

### 9.2 Each run
1. Read `lastScan` from `%LOCALAPPDATA%\resume-sync\state.json` (missing → epoch).
2. If no `*.pdf` in `%USERPROFILE%\Downloads` has `LastWriteTime > lastScan`, exit. WSL is not started.
3. Otherwise run:
   `wsl.exe -d Ubuntu-24.04 -e bash -c "source ~/.nvm/nvm.sh && cd ~/projects/portfolio-sync && npm run --silent sync:resume -- --json"`
   (nvm is not loaded in non-interactive shells, so it is sourced explicitly. `-e` passes the command as one argument; `wsl.exe --` would re-join it through a shell.)
4. Parse the JSON result. On `status: "ok"`, set `lastScan` to the scan start time. On `error`, leave `lastScan` unchanged so the next run retries.
5. Show a Windows toast (WinRT notification API from PowerShell 5.1, no extra module) for any `error` or `warnings`. Successful runs are silent.
6. Append one line per run to `%LOCALAPPDATA%\resume-sync\log.txt` (timestamp, status, actions, error). Keep the last 1000 lines.

Unrelated PDFs (e.g. class templates) in Downloads cause an occasional no-op WSL run; the Node side ignores PDFs without the contract.

## 10. Error Handling & Edge Cases

| Situation | Behaviour |
|---|---|
| Offline / push rejected | Error result, toast, `lastScan` not advanced → retried next run. |
| `main` moved (owner pushed from `~/projects/portfolio`) | Every run resets the sync worktree to `origin/main` first. |
| No PDF carries the contract | `ok`, no actions (normal for unrelated downloads). |
| Keywords malformed (empty list, bad ID, duplicates) | Error naming the problem; site untouched. |
| Keywords not updated after editing the résumé | Warning toast listing headings missing from keywords; the sync proceeds with what the keywords say. |
| Tests or build fail on the safe path | Nothing pushed; error toast; details in `log.txt`. |
| New project's text block not found | Branch + PR still created with empty fields; PR body and email say so. |
| `resume-sync/<id>` already exists | Left untouched; reported as awaiting Lego build. |
| Gmail step fails in CI | Gate is still red on the PR. |
| WSL or Node unavailable | `wsl.exe` fails → watcher treats as error → toast, retry next run. |
| Two contract PDFs | Newest `LastWriteTime` wins. |

## 11. Testing

- **Unit (Vitest):**
  - `keywords`: valid list, whitespace, unknown keys, empty list, bad characters, duplicates.
  - `projectBlocks`: fixtures are text extracted **with `pdfjs-dist`** (the extractor the code uses) from the real 2028 résumé, covering a heading with a parenthetical note (Ledgr), multi-line bullets, and the section boundary.
  - `draft`: name/note/tech/date splitting, `Heading:` stripping, empty draft when no block matches.
  - `plan`: nothing changed; PDF-only change; known project added/removed/reordered; new project (excluded from list, drafted); warnings for headings missing from keywords.
  - `siteProjects`: résumé order, pinned appended, pinned-and-on-résumé shown once, unknown IDs dropped.
- **Fixture PDFs:** generated in tests with `pdf-lib` (keywords set programmatically); no LaTeX needed.
- **Content consistency (`content.test.ts`):** every ID in `resume-projects.json` exists in `projects.ts`; list non-empty and unique; education period is exactly `"2025 – Present"`.
- **Lego gate:** passes on `main` data; fails on an in-memory project with `"pending"`.
- **Components:** Projects section renders `siteProjects` order; existing `vitest-axe` checks still pass.
- **Dry run:** `npm run sync:resume -- --dry-run --downloads <dir>` against the real Downloads folder prints the expected plan.
- **End-to-end (manual, once):**
  1. Register with `-IntervalMinutes 1`.
  2. Export the résumé with the keywords line; confirm a `content: sync résumé` commit lands on `main` within ~1 minute and the site deploys.
  3. Add a fake project to the keywords and résumé; confirm the PR opens and the Gmail notification arrives; close the PR and delete the branch.
  4. Re-register with the default 60-minute interval.

## 12. One-Time Setup (owner)

1. Add the `\hypersetup{pdfkeywords={projects=mypose,ledgr}}` line to the 2028 résumé in Overleaf and export it to Downloads.
2. Enable 2-Step Verification on `ddgonzalez.cs@gmail.com`, create an app password, and add repo secrets `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
3. Create the sync worktree (`git -C ~/projects/portfolio worktree add ~/projects/portfolio-sync --detach origin/main`) and run `npm ci` in it.
4. Run `register-resume-task.ps1 -IntervalMinutes 1` for testing, then without the flag for production.

Already verified in this environment: git credentials are stored (`credential.helper=store`), `gh` is authenticated with `repo` scope, Windows interop and `schtasks.exe` are reachable from WSL, and PowerShell is 5.1.

## 13. Directory Sketch

```
scripts/
  sync-resume.ts
  resume/
    keywords.ts        keywords.test.ts
    projectBlocks.ts   projectBlocks.test.ts
    draft.ts           draft.test.ts
    plan.ts            plan.test.ts
    pdf.ts
    fixtures/          resume-2028.txt
  windows/
    resume-watch.ps1
    register-resume-task.ps1
src/content/
  resume-projects.json   (new, sync-owned)
  siteProjects.ts        (new)  siteProjects.test.ts
  lego-gate.test.ts      (new)
  projects.ts            (TraceAndPace pinned)
  education.ts           ("2025 – Present")
  types.ts               (LegoBuildRef, pinned)
src/sections/Projects.tsx
.github/workflows/lego-gate.yml
```
