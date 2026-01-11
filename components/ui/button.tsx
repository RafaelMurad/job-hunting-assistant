import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-900",
  {
    variants: {
      variant: {
        default:
          "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500 dark:bg-cyan-400 dark:text-slate-900 dark:hover:bg-cyan-300 dark:shadow-lg dark:shadow-cyan-400/30 dark:focus-visible:ring-cyan-400",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400 dark:shadow-lg dark:shadow-red-500/30",
        outline:
          "border-2 border-sky-600 bg-transparent text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-500 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-400/10",
        secondary:
          "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 dark:bg-emerald-400 dark:text-slate-900 dark:hover:bg-emerald-300 dark:shadow-lg dark:shadow-emerald-400/30",
        ghost:
          "hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800",
        link: "text-sky-600 underline-offset-4 hover:underline hover:text-sky-700 dark:text-cyan-400 dark:hover:text-cyan-300",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-13 px-8 py-4 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
