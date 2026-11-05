import type { ComponentProps, ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/components/ui/cn";
import {
  BreakingIcon,
  InfoIcon,
  LightbulbIcon,
  WarningIcon,
} from "@/components/ui/icons";

type CalloutType = "note" | "tip" | "warning" | "breaking";

const CALLOUT_STYLES: Record<
  CalloutType,
  { Icon: ComponentType<SVGProps<SVGSVGElement>>; box: string; accent: string }
> = {
  note: {
    Icon: InfoIcon,
    box: "border-site-info bg-site-info-soft",
    accent: "text-site-info",
  },
  tip: {
    Icon: LightbulbIcon,
    box: "border-site-success bg-site-success-soft",
    accent: "text-site-success",
  },
  warning: {
    Icon: WarningIcon,
    box: "border-site-warning bg-site-warning-soft",
    accent: "text-site-warning",
  },
  breaking: {
    Icon: BreakingIcon,
    box: "border-site-danger bg-site-danger-soft",
    accent: "text-site-danger",
  },
};

function isCalloutType(type: string): type is CalloutType {
  return Object.hasOwn(CALLOUT_STYLES, type);
}

interface CalloutProps extends ComponentProps<"aside"> {
  /** `note`, `tip`, `warning` or `breaking`; anything else reads as a note. */
  type?: string;
  /** Replaces the type's own label ("Note", "Warning", …) as the heading. */
  title?: string;
}

/** A boxed aside in docs content: `<Callout type="warning">…</Callout>`. */
export async function Callout({
  type = "note",
  title,
  className,
  children,
  ...props
}: CalloutProps) {
  const t = await getTranslations("docs.content.callout");
  const kind = isCalloutType(type) ? type : "note";
  const { Icon, box, accent } = CALLOUT_STYLES[kind];

  return (
    <aside
      className={cn("rounded-site my-6 border-l-4 px-4 py-3", box, className)}
      {...props}
    >
      {/* A div, not a p: Prose colours every paragraph as body text. */}
      <div
        className={cn("flex items-center gap-2 text-sm font-semibold", accent)}
      >
        <Icon className="size-4 shrink-0" />
        {title ?? t(kind)}
      </div>
      <div className="mt-2 [&>:first-child]:mt-0">{children}</div>
    </aside>
  );
}
