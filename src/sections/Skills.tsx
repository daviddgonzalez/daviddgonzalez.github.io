import { Section } from "@/components/Section";
import { skills } from "@/content/skills";

export function Skills() {
  const byCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s.label);
    return acc;
  }, {});
  return (
    <Section id="skills" density="sparse">
      <h2 className="font-display text-3xl font-bold text-fg">Skills</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(byCategory).map(([cat, labels]) => (
          <div key={cat}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{cat}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {labels.map((l) => (
                <li key={l} className="rounded-[var(--radius-brand)] bg-surface px-3 py-1.5 text-sm text-fg">{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
