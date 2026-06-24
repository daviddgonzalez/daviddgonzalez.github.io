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
