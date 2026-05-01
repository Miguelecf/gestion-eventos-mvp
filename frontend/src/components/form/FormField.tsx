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
  const generatedId = React.useId();
  const baseId = htmlFor ?? generatedId;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
  const describedBy = hasError ? errorId : helpText ? helpId : undefined;
  const renderedChildren =
    React.isValidElement(children) && describedBy
      ? React.cloneElement(
          children as React.ReactElement<{ 'aria-describedby'?: string }>,
          {
            'aria-describedby': [
              (children.props as { 'aria-describedby'?: string })['aria-describedby'],
              describedBy,
            ]
              .filter(Boolean)
              .join(' '),
          }
        )
      : children;

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

      {renderedChildren}

      {hasError ? (
        <p id={errorId} className="text-xs text-red-600" role="alert">{error}</p>
      ) : helpText ? (
        <p id={helpId} className="text-xs text-muted-foreground">{helpText}</p>
      ) : null}
    </div>
  );
}
