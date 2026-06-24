import { DecorationLayer } from "./DecorationLayer";

export function Section({
  id,
  className = "",
  decorate = true,
  children,
}: {
  id: string;
  className?: string;
  decorate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-6 py-20 ${className}`}>
      {decorate && <DecorationLayer />}
      <div className="relative z-10 mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
