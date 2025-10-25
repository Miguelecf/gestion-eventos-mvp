import * as React from "react";
import { cn } from "@/lib/utils";

export type DateFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string;                    // "yyyy-MM-dd"
  onChange: (value: string) => void;
  ariaInvalid?: boolean;
};

const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  ({ className, value, onChange, ariaInvalid, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={ariaInvalid ? true : undefined}
        className={cn(
          // estilo “input” compatible con TailAdmin/shadcn
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

DateField.displayName = "DateField";
export default DateField;
