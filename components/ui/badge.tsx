import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, type JSX } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  {
    variants: {
      variant: {
        default: "border-transparent bg-sky-600 text-white dark:bg-sky-500",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
        destructive: "border-transparent bg-red-500 text-white dark:bg-red-600",
        outline: "text-slate-900 border-slate-300 dark:text-slate-100 dark:border-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
