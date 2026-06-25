import type { Role } from "./types";

export const experience: Role[] = [
  {
    id: "avonrisk",
    company: "AvonRisk",
    title: "Software Engineering Intern",
    period: "May 2026 – Present",
    summary:
      "I built a compatibility harness from scratch that checks whether AI-agent skills actually work, combining deterministic checks with an LLM judge for the fuzzier cases. I raised test coverage by up to 106%, mostly through regression tests for bugs we caught in QA. I also lazy-loaded 93% of the ESM modules and cleaned up redundant git subprocess calls, which made some commands run up to 85% faster.",
    legoBuild: "judge",
  },
  {
    id: "mil",
    company: "Machine Intelligence Laboratory, University of Florida",
    title: "Undergraduate Software Researcher",
    period: "May 2026 – Present",
    summary:
      "I write and test the ROS mission plans that tell an autonomous submarine's gripper how to line up with an object, grab it, and move it. I also work on the software that reads camera, hydrophone, and other sensor feeds from existing ROS nodes to keep the sub oriented during a run.",
    legoBuild: "submarine",
  },
  {
    id: "ta-discrete",
    company: "University of Florida",
    title: "Teaching Assistant, Discrete Structures",
    period: "Jan 2026 – May 2026",
    summary:
      "I run weekly discussion sections for 55+ students in Discrete Structures. My sections averaged 5% above the rest of the course on exams, and I write more than a third of the exam questions.",
    legoBuild: "chalkboard",
  },
  {
    id: "acm-design",
    company: "ACM at University of Florida",
    title: "Design Team",
    period: "Apr 2026 – Present",
    summary:
      "I built the data-visualization pieces that show chapter leadership how engagement has trended from past attendance, plus a secure location-based check-in that tracks attendance automatically. It launches this fall to 300+ members across partnered clubs.",
    legoBuild: "meeting",
  },
];
