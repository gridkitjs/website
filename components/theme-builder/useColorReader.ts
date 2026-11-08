import { useSyncExternalStore } from "react";
import { parseOklch, type Oklch } from "@/lib/theme-builder/color";
import type { ColorReader } from "@/lib/theme-builder/contrast";

const readColors = new Map<string, Oklch | undefined>();

/**
 * Any colour the browser understands, as oklch. Mixing a colour with itself
 * in oklch has the browser write its computed value as `oklch()`. A value
 * that still reads a custom property would depend on where it's read, so
 * it isn't read.
 */
function readBrowserColor(value: string): Oklch | undefined {
  const written = parseOklch(value);
  if (written !== undefined || value.includes("var(")) {
    return written;
  }
  if (!readColors.has(value)) {
    const probe = document.createElement("span");
    probe.hidden = true;
    probe.style.color = `color-mix(in oklch, ${value}, ${value})`;
    let color: Oklch | undefined;
    if (probe.style.color !== "") {
      document.body.append(probe);
      color = parseOklch(getComputedStyle(probe).color);
      probe.remove();
    }
    readColors.set(value, color);
  }
  return readColors.get(value);
}

function subscribe() {
  return () => {};
}

/**
 * How this render reads a colour value: only `oklch()` on the server and
 * while hydrating, so the markup matches the server's, and anything the
 * browser reads once hydrated.
 */
export function useColorReader(): ColorReader {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return hydrated ? readBrowserColor : parseOklch;
}
