import { DecorationLayer, type Density } from "./DecorationLayer";

export function Section({
  id,
  className = "",
  decorate = true,
  density = "normal",
  children,
}: {
  id: string;
  className?: string;
  decorate?: boolean;
  density?: Density;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-6 py-20 ${className}`}>
      {decorate && <DecorationLayer seed={id} density={density} />}
      <div className="relative z-10 mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
