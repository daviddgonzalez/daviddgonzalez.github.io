import { Section } from "@/components/Section";
import { profile } from "@/content/profile";

export function Contact() {
  const { email, github, linkedin } = profile.socials;
  return (
    <Section id="contact">
      <h2 className="font-display text-3xl font-bold text-fg">Contact</h2>
      <p className="mt-4 text-muted">Open to new opportunities — let's talk.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <a href={`mailto:${email}`} className="text-accent hover:underline" aria-label="Email">Email</a>
        {github && <a href={github} className="text-accent hover:underline">GitHub</a>}
        {linkedin && <a href={linkedin} className="text-accent hover:underline">LinkedIn</a>}
      </div>
    </Section>
  );
}
