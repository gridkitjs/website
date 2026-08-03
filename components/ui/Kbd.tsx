import { cn } from "./cn";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "border-site-line text-site-ink-muted bg-site-surface pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center rounded-sm border px-1 font-mono text-xs font-medium select-none",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
