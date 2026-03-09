import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]",
                secondary:
                    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]",
                ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)]",
                destructive:
                    "bg-[var(--color-danger)] text-white hover:bg-[color-mix(in_srgb,var(--color-danger)_88%,black)]",
                outline:
                    "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
