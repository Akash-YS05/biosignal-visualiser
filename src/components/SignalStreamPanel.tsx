"use client";
import { useState } from "react";
import ChannelStrip from "./ChannelStrip";
import type { ChannelName } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

// Noticeably brighter channel colors
// Slightly lifted — present but not vivid
const CHANNEL_COLORS: Record<ChannelName, string> = {
    Fp1: "#5aafd4",  // steel blue
    Fp2: "#4abe8f",  // soft emerald
    Fz:  "#9080e0",  // muted violet
    Cz:  "#d4875a",  // terracotta
    Pz:  "#4abdb5",  // dusty teal
    O1:  "#c8a83a",  // warm gold
    O2:  "#c46888",  // rose
    T3:  "#7ab865",  // sage green
  };

const CHANNEL_LOCATIONS: Record<ChannelName, string> = {
  Fp1: "front-left",
  Fp2: "front-right",
  Fz:  "center-front",
  Cz:  "crown",
  Pz:  "center-back",
  O1:  "occipital-L",
  O2:  "occipital-R",
  T3:  "temporal-L",
};

const BASE_QUALITY: Record<ChannelName, number> = {
  Fp1: 0.92, Fp2: 0.88, Fz: 0.95, Cz: 0.97,
  Pz:  0.85, O1:  0.91, O2: 0.78, T3: 0.62,
};

interface Props {
  buffers: Record<ChannelName, Float32Array>;
  writeHead: number;
  paused: boolean;
}

export default function SignalStreamPanel({ buffers, writeHead, paused }: Props) {
  const [enabled, setEnabled] = useState<Record<ChannelName, boolean>>(
    Object.fromEntries(CHANNELS.map((ch) => [ch, true])) as Record<ChannelName, boolean>
  );

  const toggle = (ch: ChannelName) =>
    setEnabled((prev) => ({ ...prev, [ch]: !prev[ch] }));

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  return (
    /*
      KEY FIX: The outer div has a fixed height (h-full from parent) and
      overflow-hidden. The border and rounded corners are on THIS element,
      so scrolling happens INSIDE it — the border never breaks.
    */
    <div className="bg-panel border border-border rounded-xl flex flex-col h-full overflow-hidden">

      {/* Sticky header — never scrolls away */}
      <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-xs text-bright font-medium tracking-widest uppercase">
              Signal Stream
            </span>
            {/* Inter for description */}
            <p className="text-[11px] text-muted mt-1 leading-relaxed max-w-sm">
              Live voltage from 8 scalp electrodes. Waveforms scroll left — past on the left, present on the right.
              Click any channel name to toggle it.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5 shrink-0">
            <span className="text-[10px] text-muted">{enabledCount} / 8 active</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${paused ? "" : "breathe"}`}
              style={{ backgroundColor: paused ? "#6b8fa8" : "#34d399" }}
            />
          </div>
        </div>

        {/* Column guide */}
        <div className="flex items-center gap-3 mt-3">
          <span className="w-24 text-[9px] text-muted uppercase tracking-widest">electrode</span>
          <span className="flex-1 text-[9px] text-muted uppercase tracking-widest">waveform</span>
          <span className="w-10 text-[9px] text-muted uppercase tracking-widest text-right">sq</span>
        </div>
      </div>

      {/* Scrollable channel list — border stays outside */}
      <div className="flex-1 overflow-y-auto px-5 divide-y divide-border">
        {CHANNELS.map((ch) => (
          <ChannelStrip
            key={ch}
            name={ch}
            location={CHANNEL_LOCATIONS[ch]}
            buffer={buffers[ch]}
            writeHead={writeHead}
            color={CHANNEL_COLORS[ch]}
            quality={BASE_QUALITY[ch]}
            enabled={enabled[ch]}
            paused={paused}
            onToggle={() => toggle(ch)}
          />
        ))}
      </div>

      {/* Sticky footer note */}
      <div className="px-5 py-2.5 border-t border-border shrink-0">
        <p className="text-[10px] text-muted italic">
          SQ = Signal Quality · &gt;75% reliable · amber = check electrode contact · red = poor signal
        </p>
      </div>
    </div>
  );
}