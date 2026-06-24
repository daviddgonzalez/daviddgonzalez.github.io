import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function Hero() {
  return (
    <Section id="hero" density="max" className="min-h-[80vh] flex items-center">
      <div className="text-center mx-auto">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{profile.role}</p>
        <h1 className="font-display mt-3 text-5xl font-bold tracking-tight text-fg">{profile.name}</h1>
        <p className="mt-4 text-lg text-muted">{profile.tagline}</p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="#projects" className="rounded-[var(--radius-brand)] bg-accent px-5 py-2.5 font-medium text-on-accent">View work</a>
          <a href="#contact" className="rounded-[var(--radius-brand)] border border-current/30 px-5 py-2.5 font-medium text-fg">Contact</a>
        </div>
      </div>
    </Section>
  );
}
