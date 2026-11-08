"use client";

import { useTranslations } from "next-intl";
import type { Oklch } from "@/lib/theme-builder/color";

type Channel = keyof Oklch;

/**
 * Each channel's range and how finely to show it. Chroma stops at 0.4,
 * past the most vivid colour a screen shows.
 */
const CHANNELS = {
  l: { max: 1, step: 0.005, digits: 3 },
  c: { max: 0.4, step: 0.005, digits: 3 },
  h: { max: 360, step: 1, digits: 0 },
  alpha: { max: 1, step: 0.01, digits: 2 },
} as const satisfies Record<Channel, object>;

const ALL_CHANNELS: readonly Channel[] = ["l", "c", "h", "alpha"];

interface OklchSlidersProps {
  color: Oklch;
  onChange: (color: Oklch) => void;
  /** The channels to offer, all four by default. */
  channels?: readonly Channel[];
}

/** A slider for each oklch channel of a colour, with its value beside it. */
export function OklchSliders({
  color,
  onChange,
  channels = ALL_CHANNELS,
}: OklchSlidersProps) {
  const t = useTranslations("themeBuilder.controls.fields");

  return (
    <div className="space-y-1.5">
      {channels.map((channel) => {
        const { max, step, digits } = CHANNELS[channel];
        return (
          <label
            key={channel}
            className="text-site-ink-muted grid grid-cols-[5rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs"
          >
            {t(`channel.${channel}`)}
            <input
              type="range"
              min={0}
              max={max}
              step={step}
              value={color[channel]}
              onChange={(event) => {
                onChange({ ...color, [channel]: Number(event.target.value) });
              }}
              className="accent-site-accent w-full"
            />
            <span
              aria-hidden="true"
              className="text-site-ink text-right font-mono tabular-nums"
            >
              {color[channel].toFixed(digits)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
