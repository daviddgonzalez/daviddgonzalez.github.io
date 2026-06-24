import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function About() {
  return (
    <Section id="about">
      <h2 className="font-display text-3xl font-bold text-fg">About</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{profile.bio}</p>
    </Section>
  );
}
