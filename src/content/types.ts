export type BuildKey = "submarine" | "receipt" | "pose" | "tree" | "judge" | "chalkboard" | "meeting" | "stack";

export interface Social { github?: string; linkedin?: string; email: string; }
export interface Profile {
  name: string; role: string; tagline: string; bio: string;
  socials: Social; resumeUrl: string; photoUrl?: string;
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
export interface Education {
  school: string; degree: string; location: string; period: string;
  gpa?: string; coursework: string[];
}

export const BUILD_KEYS: BuildKey[] = ["submarine", "receipt", "pose", "tree", "judge", "chalkboard", "meeting", "stack"];
