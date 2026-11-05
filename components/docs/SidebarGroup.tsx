import type { ComponentProps, ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

interface DisclosureButtonProps extends ComponentProps<"button"> {
  open: boolean;
  /** The `id` of the list this button shows and hides. */
  controls: string;
}

/** A button that shows or hides a sidebar list, with a turning chevron. */
function DisclosureButton({
  open,
  controls,
  className,
  children,
  ...props
}: DisclosureButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      className={cn(
        "text-site-ink-muted hover:text-site-ink rounded-site-sm flex items-center transition-colors",
        className,
      )}
      {...props}
    >
      <ChevronRightIcon
        className={cn(
          "size-4 shrink-0 transition-transform",
          open && "rotate-90",
        )}
      />
      {children}
    </button>
  );
}

interface SidebarSectionProps {
  /** The section label, a link to the section root. */
  heading: ReactNode;
  /** Names the chevron button for assistive tech, e.g. "React pages". */
  toggleLabel: string;
  id: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** A package's part of the sidebar: its label link and collapsible pages. */
export function SidebarSection({
  heading,
  toggleLabel,
  id,
  open,
  onToggle,
  children,
}: SidebarSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {heading}
        <DisclosureButton
          open={open}
          controls={id}
          onClick={onToggle}
          aria-label={toggleLabel}
          className="p-1"
        />
      </div>
      <div id={id} hidden={!open} className="mt-3 space-y-1">
        {children}
      </div>
    </div>
  );
}

interface SidebarGroupProps {
  title: string;
  id: string;
  open: boolean;
  onToggle: () => void;
  /** The group's page links, each an `<li>`. */
  children: ReactNode;
}

/** A docs subfolder within a section, e.g. React's "Columns". */
export function SidebarGroup({
  title,
  id,
  open,
  onToggle,
  children,
}: SidebarGroupProps) {
  return (
    <div className="pt-2">
      <DisclosureButton
        open={open}
        controls={id}
        onClick={onToggle}
        className="w-full gap-1.5 px-2 py-1.5 text-left text-sm font-medium"
      >
        {title}
      </DisclosureButton>
      <ul
        id={id}
        hidden={!open}
        className="border-site-line mt-1 ml-4 space-y-1 border-l pl-2"
      >
        {children}
      </ul>
    </div>
  );
}
