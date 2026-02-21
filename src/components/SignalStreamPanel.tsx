/**
 * SignalStreamPanel
 *
 * Renders all 8 EEG channel strips, manages enabled/disabled state per channel.
 */
"use client";
import { useState, useMemo } from "react";
import ChannelStrip from "./ChannelStrip";
import type { ChannelName } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

// Distinct electric colors per channel
const CHANNEL_COLORS: Record<ChannelName, string> = {
  Fp1: "#00d4ff",
  Fp2: "#00ff88",
  Fz:  "#7b61ff",
  Cz:  "#ff6b35",
  Pz:  "#00e5cc",
  O1:  "#ffcc00",
  O2:  "#ff4488",
  T3:  "#88ff44",
};

// Simulate signal quality per channel (static for MVP, could be dynamic)
const BASE_QUALITY: Record<ChannelName, number> = {
  Fp1: 0.92, Fp2: 0.88, Fz: 0.95, Cz: 0.97,
  Pz: 0.85,  O1: 0.91,  O2: 0.78, T3: 0.62,
};

interface Props {
  buffers: Record<ChannelName, Float32Array>;
  writeHead: number;
}

export default function SignalStreamPanel({ buffers, writeHead }: Props) {
  const [enabled, setEnabled] = useState<Record<ChannelName, boolean>>(
    Object.fromEntries(CHANNELS.map((ch) => [ch, true])) as Record<ChannelName, boolean>
  );

  const toggle = (ch: ChannelName) =>
    setEnabled((prev) => ({ ...prev, [ch]: !prev[ch] }));

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted tracking-widest uppercase">Signal Stream</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded border border-border text-accent">
            {enabledCount}/8 ch
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted">256 Hz</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ backgroundColor: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 mb-1 px-0">
        <span className="w-20 font-mono text-xs text-muted text-center">CH / SQ</span>
        <span className="flex-1 font-mono text-xs text-muted pl-1">WAVEFORM</span>
        <span className="w-8 font-mono text-xs text-muted text-right">SQ</span>
      </div>

      {/* Channel strips */}
      <div className="flex flex-col gap-1.5">
        {CHANNELS.map((ch) => (
          <ChannelStrip
            key={ch}
            name={ch}
            buffer={buffers[ch]}
            writeHead={writeHead}
            color={CHANNEL_COLORS[ch]}
            quality={BASE_QUALITY[ch]}
            enabled={enabled[ch]}
            onToggle={() => toggle(ch)}
          />
        ))}
      </div>
    </div>
  );
}