"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50 disabled:pointer-events-none min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] active:bg-[var(--primary-deep)]",
        secondary:
          "bg-[var(--primary-tint)] text-[var(--primary-deep)] hover:bg-[var(--sky-2)]",
        ghost:
          "bg-transparent text-[var(--primary)] hover:bg-[var(--primary-tint)]",
        give:
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)] active:bg-[var(--accent-deep)]",
        outline:
          "border border-[var(--border)] bg-[var(--card)] text-[var(--body)] hover:bg-[var(--surface)]",
        danger:
          "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "px-3 py-1.5 text-sm rounded-[var(--r-sm)]",
        md: "px-5 py-2.5 text-base rounded-[var(--r-md)]",
        lg: "px-6 py-3 text-lg rounded-[var(--r-lg)]",
        pill: "px-6 py-2.5 text-base rounded-[var(--r-pill)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
