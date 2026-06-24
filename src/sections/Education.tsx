import { Section } from "@/components/Section";
import { education } from "@/content/education";

export function Education() {
  return (
    <Section id="education">
      <h2 className="font-display text-3xl font-bold text-fg">Education</h2>
      <div className="mt-8 space-y-6">
        {education.map((e) => (
          <article key={e.school} className="rounded-[var(--radius-brand)] bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-bold text-fg">{e.school}</h3>
              <p className="text-sm text-muted">{e.location} · {e.period}</p>
            </div>
            <p className="mt-1 text-fg">{e.degree}</p>
            {e.gpa && <p className="mt-1 text-sm text-accent">GPA {e.gpa}</p>}
            <ul className="mt-3 flex flex-wrap gap-2">
              {e.coursework.map((c) => (
                <li key={c} className="rounded-[var(--radius-brand)] bg-accent/10 px-2 py-1 text-xs font-medium text-accent">{c}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
