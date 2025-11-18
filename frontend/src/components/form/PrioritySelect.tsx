import * as React from "react";
import { cn } from "@/lib/utils";

const PRIORITIES = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' }
] as const;

export type Priority = typeof PRIORITIES[number]['value'];

export interface PrioritySelectProps {
  value?: Priority;
  onChange: (value: Priority) => void;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
}

const PrioritySelect = React.forwardRef<HTMLSelectElement, PrioritySelectProps>(
  ({ value = 'MEDIUM', onChange, disabled, className, ariaInvalid, ...rest }, ref) => {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value as Priority)}
        disabled={disabled}
        aria-invalid={ariaInvalid ? true : undefined}
        className={cn(
          "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none",
          "focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          ariaInvalid ? "border-red-500" : "border-input",
          className
        )}
        {...rest}
      >
        {PRIORITIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
);

PrioritySelect.displayName = "PrioritySelect";
export default PrioritySelect;