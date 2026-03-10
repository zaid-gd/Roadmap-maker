import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={cn(
                "flex h-10 w-full rounded-[14px] border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-page))] px-3 py-2 text-sm text-[var(--color-text)] shadow-none transition-[border-color,box-shadow,background-color] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-soft)] hover:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page)] disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
