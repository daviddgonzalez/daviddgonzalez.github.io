import { Section } from "@/components/Section";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";

export function Projects() {
  return (
    <Section id="projects" density="sparse">
      <h2 className="font-display text-3xl font-bold text-fg">Projects</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </Section>
  );
}
