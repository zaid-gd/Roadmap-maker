import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-[14px] text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_26%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page)] active:scale-[0.985]",
    {
        variants: {
            variant: {
                default:
                    "border border-[color:color-mix(in_srgb,var(--color-accent)_42%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface))] text-[var(--color-text)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_24%,var(--color-surface))]",
                secondary:
                    "border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-page))] text-[var(--color-text)] hover:border-[var(--color-border-strong)] hover:bg-[color:color-mix(in_srgb,var(--color-surface-subtle)_92%,var(--color-page))]",
                ghost: "text-[var(--color-text-muted)] hover:bg-[color:color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-[var(--color-text)]",
                destructive:
                    "border border-[color:color-mix(in_srgb,var(--color-accent)_42%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface))] text-[var(--color-text)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_24%,var(--color-surface))]",
                outline:
                    "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:border-[var(--color-border-strong)] hover:bg-[color:color-mix(in_srgb,var(--color-surface-subtle)_72%,transparent)]",
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
