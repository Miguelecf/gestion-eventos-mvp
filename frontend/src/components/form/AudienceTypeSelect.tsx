import * as React from "react";
import { cn } from "@/lib/utils";

const AUDIENCE_TYPES = [
  { value: 'ESTUDIANTES', label: 'Estudiantes' },
  { value: 'COMUNIDAD', label: 'Comunidad' },
  { value: 'MIXTO', label: 'Mixto' },
  { value: 'DOCENTES', label: 'Docentes' },
  { value: 'AUTORIDADES', label: 'Autoridades' }
] as const;

export type AudienceType = typeof AUDIENCE_TYPES[number]['value'];

export interface AudienceTypeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  value?: AudienceType;
  onChange: (value?: AudienceType) => void;
  ariaInvalid?: boolean;
  allowEmpty?: boolean;
}

const AudienceTypeSelect = React.forwardRef<HTMLSelectElement, AudienceTypeSelectProps>(
  ({ value, onChange, disabled, className, ariaInvalid, allowEmpty = false, ...rest }, ref) => {
    return (
      <select
        ref={ref}
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? e.target.value as AudienceType : undefined)}
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
        {allowEmpty && <option value="">Seleccione tipo de audiencia...</option>}
        {AUDIENCE_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
);

AudienceTypeSelect.displayName = "AudienceTypeSelect";
export default AudienceTypeSelect;
