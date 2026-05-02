import * as React from "react";
import TimePicker, { type TimePickerProps } from "./TimePicker";

export type TimeFieldProps = TimePickerProps & {
  stepSec?: number;
};

const TimeField = React.forwardRef<HTMLButtonElement, TimeFieldProps>(
  ({ stepSec, stepMinutes, ...props }, ref) => {
    const resolvedStepMinutes =
      stepMinutes ?? (stepSec ? Math.max(1, Math.round(stepSec / 60)) : undefined);

    return <TimePicker ref={ref} stepMinutes={resolvedStepMinutes} {...props} />;
  }
);

TimeField.displayName = "TimeField";
export default TimeField;
