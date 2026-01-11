import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

// Shadcn pattern: Empty interface allows future prop customization (e.g., variant, size)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:ring-offset-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:ring-sky-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
