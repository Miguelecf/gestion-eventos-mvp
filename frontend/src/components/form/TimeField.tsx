import * as React from "react";
import { cn } from "@/lib/utils";

export type TimeFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string;                    // "HH:mm"
  onChange: (value: string) => void;
  stepSec?: number;                 // tamaño de salto en segundos (default 60)
  ariaInvalid?: boolean;
};

const TimeField = React.forwardRef<HTMLInputElement, TimeFieldProps>(
  ({ className, value, onChange, stepSec = 60, ariaInvalid, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        type="time"
        value={value}
        step={stepSec}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={ariaInvalid ? true : undefined}
        className={cn(
          "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none",
          "focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          ariaInvalid ? "border-red-500" : "border-input",
          className
        )}
        {...rest}
      />
    );
  }
);

TimeField.displayName = "TimeField";
export default TimeField;