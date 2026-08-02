import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "./cn";

const variantClasses = {
  primary: "bg-site-accent text-white hover:opacity-90",
  secondary: "border border-site-line text-site-ink hover:bg-site-surface",
  "secondary-inverted":
    "border border-site-line-inverted text-site-ink-inverted hover:bg-white/5",
} as const;

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variantClasses;
  external?: boolean;
  className?: string;
}

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  className,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors",
    variantClasses[variant],
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
