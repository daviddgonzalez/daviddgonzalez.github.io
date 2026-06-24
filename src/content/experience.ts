import type { Role } from "./types";

export const experience: Role[] = [
  {
    id: "avonrisk",
    company: "AvonRisk",
    title: "Software Engineering Intern",
    period: "May 2026 – Present",
    summary:
      "Built an empirical compatibility harness from scratch to evaluate AI-agent skills, pairing deterministic outcomes with an LLM judge. Raised test coverage by up to 106% with regression tests for QA-found bugs, and lazy-loaded 93% of ESM modules while cutting redundant git subprocess calls to accelerate command execution by up to 85%.",
    legoBuild: "computer",
  },
  {
    id: "mil",
    company: "Machine Intelligence Laboratory, University of Florida",
    title: "Undergraduate Software Researcher",
    period: "May 2026 – Present",
    summary:
      "Authored and tested ROS XML mission plans directing an autonomous submarine's robotic gripper to align with, grasp, and manipulate objects. Designed software consuming camera, hydrophone, and onboard-sensor data from ROS subscriber nodes to orient the sub throughout each mission.",
    legoBuild: "stack",
  },
  {
    id: "ta-discrete",
    company: "University of Florida",
    title: "Teaching Assistant — Discrete Structures",
    period: "Jan 2026 – Present",
    summary:
      "Mentored 55+ students through weekly discussion sections; section students scored 5% higher than the course average on exams. Lesson-planned and authored over 33% of exam materials.",
    legoBuild: "brickLogo",
  },
  {
    id: "acm-design",
    company: "ACM at University of Florida",
    title: "Design Team",
    period: "Apr 2026 – Present",
    summary:
      "Built data-visualization components surfacing engagement trends from historical attendance records for chapter leadership, and a secure location-based check-in system that automates real-time attendance — launching in fall to 300+ members across partnered clubs.",
    legoBuild: "phone",
  },
];
