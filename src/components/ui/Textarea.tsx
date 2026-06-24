"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--ink)] mb-1"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full min-h-[120px] px-3 py-2 text-base rounded-[var(--r-md)]",
            "border bg-[var(--card)] text-[var(--ink)] placeholder:text-[var(--muted)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]",
            "transition-colors resize-y",
            error
              ? "border-red-500 focus-visible:outline-red-500"
              : "border-[var(--border)]",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
