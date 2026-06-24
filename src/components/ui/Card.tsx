import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Card({ children, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={clsx(
        "bg-[var(--card)] rounded-[var(--r-lg)] shadow-[var(--shadow)] border border-[var(--border)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("p-4 md:p-5", className)}>{children}</div>;
}
