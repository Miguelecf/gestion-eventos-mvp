import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "border-transparent bg-primary/10 text-primary ring-primary/30",
  success:
    "border-transparent bg-emerald-100 text-emerald-600 ring-emerald-300",
  outline: "border-slate-200 text-slate-600",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-transparent transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

