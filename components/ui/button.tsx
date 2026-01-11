import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-900",
  {
    variants: {
      variant: {
        default:
          "bg-fjord-600 text-white hover:bg-fjord-700 focus-visible:ring-fjord-500 dark:bg-fjord-500 dark:hover:bg-fjord-600",
        destructive:
          "bg-clay-600 text-white hover:bg-clay-700 focus-visible:ring-clay-500 dark:bg-clay-500 dark:hover:bg-clay-600",
        outline:
          "border-2 border-fjord-600 bg-transparent text-fjord-700 hover:bg-fjord-50 focus-visible:ring-fjord-500 dark:border-fjord-400 dark:text-fjord-300 dark:hover:bg-slate-800",
        secondary:
          "bg-forest-600 text-white hover:bg-forest-700 focus-visible:ring-forest-500 dark:bg-forest-500 dark:hover:bg-forest-600",
        ghost:
          "hover:bg-nordic-neutral-100 text-nordic-neutral-700 focus-visible:ring-nordic-neutral-400 dark:text-slate-300 dark:hover:bg-slate-800",
        link: "text-fjord-600 underline-offset-4 hover:underline hover:text-fjord-700 dark:text-fjord-400 dark:hover:text-fjord-300",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-13 px-8 py-4 text-base",
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
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          borderRadius: "var(--radius-md)",
          fontSize:
            size === "sm"
              ? "var(--text-small)"
              : size === "lg"
                ? "var(--text-body)"
                : "var(--text-body)",
        }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
