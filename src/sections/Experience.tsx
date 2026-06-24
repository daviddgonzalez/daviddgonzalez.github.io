import { Section } from "@/components/Section";
import { RoleCard } from "@/components/RoleCard";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";

export function Experience() {
  return (
    <Section id="experience" density="sparse">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold text-fg">Experience</h2>
        <a href={profile.resumeUrl} className="text-sm text-accent hover:underline" download>
          Download résumé
        </a>
      </div>
      <div className="mt-8 space-y-4">
        {experience.map((r) => <RoleCard key={r.id} role={r} />)}
      </div>
    </Section>
  );
}
