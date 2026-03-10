import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "flex min-h-[140px] w-full rounded-[18px] border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_94%,var(--color-page))] px-4 py-3 text-sm text-[var(--color-text)] shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-[var(--color-text-soft)] hover:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_24%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page)] disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
