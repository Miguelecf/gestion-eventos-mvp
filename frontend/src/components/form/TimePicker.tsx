import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  generateTimeOptions,
  normalizeTimeValue,
  parseTimeToMinutes,
} from "./time-picker-utils";

const CLEAR_TIME_VALUE = "__clear_time__";
const DEFAULT_MIN_TIME = "00:00";
const DEFAULT_MAX_TIME = "23:59";

export type TimePickerProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> & {
  value?: string | null;
  onChange: (value: string) => void;
  minTime?: string;
  maxTime?: string;
  stepMinutes?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
  allowClear?: boolean;
  clearLabel?: string;
};

function getOptionsWithCurrentValue(
  options: string[],
  value: string,
  minTime: string,
  maxTime: string
): string[] {
  if (!value || options.includes(value)) {
    return options;
  }

  const valueMinutes = parseTimeToMinutes(value);
  const minMinutes = parseTimeToMinutes(minTime) ?? 0;
  const maxMinutes = parseTimeToMinutes(maxTime) ?? 1439;

  if (valueMinutes === null || valueMinutes < minMinutes || valueMinutes > maxMinutes) {
    return options;
  }

  return [...options, value].sort();
}

const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      id,
      name,
      className,
      value,
      onChange,
      minTime = DEFAULT_MIN_TIME,
      maxTime = DEFAULT_MAX_TIME,
      stepMinutes = 15,
      placeholder = "--:--",
      disabled,
      ariaInvalid,
      allowClear = false,
      clearLabel = "Sin horario",
      ...rest
    },
    ref
  ) => {
    const { "aria-invalid": ariaInvalidAttribute, ...triggerProps } = rest;
    const selectedValue = normalizeTimeValue(value) ?? "";
    const invalid =
      Boolean(ariaInvalid) ||
      ariaInvalidAttribute === true ||
      ariaInvalidAttribute === "true" ||
      ariaInvalidAttribute === "grammar" ||
      ariaInvalidAttribute === "spelling";

    const options = React.useMemo(() => {
      const generatedOptions = generateTimeOptions({ minTime, maxTime, stepMinutes });
      return getOptionsWithCurrentValue(generatedOptions, selectedValue, minTime, maxTime);
    }, [maxTime, minTime, selectedValue, stepMinutes]);

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        onChange(nextValue === CLEAR_TIME_VALUE ? "" : nextValue);
      },
      [onChange]
    );

    return (
      <Select
        name={name}
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          ref={ref}
          disabled={disabled}
          aria-invalid={invalid ? true : undefined}
          aria-haspopup="listbox"
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none",
            "focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            invalid ? "border-red-500" : "border-input",
            className
          )}
          {...triggerProps}
        >
          <span className={cn("truncate", selectedValue ? "text-foreground" : "text-muted-foreground")}>
            {selectedValue || placeholder}
          </span>
        </SelectTrigger>

        <SelectContent align="start" className="max-h-64">
          {allowClear && selectedValue ? (
            <>
              <SelectItem value={CLEAR_TIME_VALUE}>{clearLabel}</SelectItem>
              <SelectSeparator />
            </>
          ) : null}

          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__no_time_options__" disabled>
              Sin horarios disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    );
  }
);

TimePicker.displayName = "TimePicker";
export default TimePicker;
