import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helpText?: string;
  error?: string;          // mensaje de validación del campo
  className?: string;
  children: React.ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  required,
  helpText,
  error,
  className,
  children,
}: Props) {
  const hasError = Boolean(error);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium",
          hasError ? "text-red-600" : "text-foreground"
        )}
      >
        {label} {required && <span className="text-red-600">*</span>}
      </Label>

      {children}

      {hasError ? (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      ) : helpText ? (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      ) : null}
    </div>
  );
}
