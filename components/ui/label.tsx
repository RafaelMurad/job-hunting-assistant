import { cn } from "@/lib/utils";
import { forwardRef, type LabelHTMLAttributes } from "react";

// Shadcn pattern: Empty interface allows future prop customization
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-100",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
