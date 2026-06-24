import { clsx } from "clsx";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, children }: PageHeaderProps) {
  return (
    <header className={clsx("px-4 pt-6 pb-4 md:pt-8", className)}>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-base text-[var(--muted)]">{subtitle}</p>
      )}
      {children}
    </header>
  );
}
