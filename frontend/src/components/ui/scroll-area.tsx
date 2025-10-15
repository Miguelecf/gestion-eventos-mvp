import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ScrollAreaProps = HTMLAttributes<HTMLDivElement>;

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-full overflow-hidden", className)}
      {...props}
    >
      <div className="h-full w-full overflow-y-auto pr-2">{children}</div>
    </div>
  ),
);

ScrollArea.displayName = "ScrollArea";
