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
