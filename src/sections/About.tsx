import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function About() {
  return (
    <Section id="about">
      <h2 className="font-display text-3xl font-bold text-fg">About</h2>
      <div className="mt-8 grid items-start gap-8 sm:grid-cols-[auto_1fr]">
        {profile.photoUrl && (
          <img
            src={profile.photoUrl}
            alt={`Portrait of ${profile.name}`}
            className="w-40 rounded-[var(--radius-brand)] object-cover object-top shadow-md ring-1 ring-current/10 aspect-[3/4]"
          />
        )}
        <p className="max-w-2xl text-lg leading-relaxed text-muted">{profile.bio}</p>
      </div>
    </Section>
  );
}
