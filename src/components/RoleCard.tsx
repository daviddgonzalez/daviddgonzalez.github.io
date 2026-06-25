import type { Role } from "@/content/types";
import { getBuild } from "@/lego/registry";

export function RoleCard({ role }: { role: Role }) {
  const Build = getBuild(role.legoBuild ?? "stack");
  return (
    <article className="lego-card brick-card flex gap-4 rounded-[var(--radius-brand)] bg-surface p-5">
      <div className="hidden w-24 shrink-0 items-center justify-center sm:flex"><Build className="max-h-24 w-auto" /></div>
      <div>
        <h3 className="font-display text-lg font-bold text-fg">{role.title} · {role.company}</h3>
        <p className="text-xs uppercase tracking-wide text-muted">{role.period}</p>
        <p className="mt-2 text-sm text-muted">{role.summary}</p>
      </div>
    </article>
  );
}
