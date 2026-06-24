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
