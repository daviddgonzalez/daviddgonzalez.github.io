import type { Project } from "@/content/types";
import { getBuild } from "@/lego/registry";

export function ProjectCard({ project }: { project: Project }) {
  const Build = getBuild(project.legoBuild);
  return (
    <article className="rounded-[var(--radius-brand)] bg-surface p-6 shadow-sm">
      <div className="flex h-28 items-center justify-center"><Build /></div>
      <h3 className="font-display mt-4 text-xl font-bold text-fg">{project.name}</h3>
      <p className="mt-1 text-sm text-muted">{project.blurb}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <li key={t} className="rounded bg-accent/10 px-2 py-1 text-xs font-medium text-accent">{t}</li>
        ))}
      </ul>
      <div className="mt-4 flex gap-4 text-sm">
        {project.links.demo && <a className="text-accent hover:underline" href={project.links.demo}>Demo</a>}
        {project.links.repo && <a className="text-accent hover:underline" href={project.links.repo}>Repo</a>}
      </div>
    </article>
  );
}
