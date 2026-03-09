import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "flex min-h-[140px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] shadow-none transition-colors placeholder:text-[var(--color-text-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
