import { type InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function FormField({ label, className = "", ...props }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-muted">
      {label}
      <input
        className={`rounded-xl bg-surface border border-border px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-accent-from focus:ring-1 focus:ring-accent-from transition ${className}`}
        {...props}
      />
    </label>
  );
}
