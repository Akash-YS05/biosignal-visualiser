"use client";
import { useState } from "react";
import ChannelStrip from "./ChannelStrip";
import type { ChannelName } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

const CHANNEL_COLORS: Record<ChannelName, string> = {
  Fp1: "#22d3ee",
  Fp2: "#4ade80",
  Fz:  "#a78bfa",
  Cz:  "#f97316",
  Pz:  "#38bdf8",
  O1:  "#facc15",
  O2:  "#f472b6",
  T3:  "#fb923c",
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

interface Props {
  buffers:        Record<ChannelName, Float32Array>;
  writeHead:      number;
  paused:         boolean;
  channelQuality: Record<ChannelName, number>; // ← now a prop
}

export default function SignalStreamPanel({
  buffers, writeHead, paused, channelQuality
}: Props) {
  const [enabled, setEnabled] = useState<Record<ChannelName, boolean>>(
    Object.fromEntries(CHANNELS.map((ch) => [ch, true])) as Record<ChannelName, boolean>
  );

  const toggle = (ch: ChannelName) =>
    setEnabled((prev) => ({ ...prev, [ch]: !prev[ch] }));

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="panel fadein" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      <div className="panel-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="section-label">Signal Stream</span>
          <span
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--t3)",
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              padding: "1px 7px",
              borderRadius: 2,
            }}
          >
            {activeCount} / 8 active
          </span>
          {paused && (
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--amber)",
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
                padding: "1px 7px",
                borderRadius: 2,
              }}
            >
              FROZEN
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>
          Click row to toggle · clears on state change
        </span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
          flexShrink: 0,
        }}
      >
        {[
          { label: "#",                         width: 36,        pl: 12 },
          { label: "Channel",                   width: 88,        pl: 21 },
          { label: "Waveform — past ←  live",   width: undefined, pl: 16 },
          { label: "Sig. Quality",              width: 72,        pl: 14 },
        ].map(({ label, width, pl }) => (
          <div
            key={label}
            className="mono"
            style={{
              width,
              flex: width ? undefined : 1,
              fontSize: 9,
              fontWeight: 500,
              color: "var(--t4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 0",
              paddingLeft: pl,
              flexShrink: width ? 0 : undefined,
              borderRight: label === "Channel" ? "1px solid var(--border-lo)" : undefined,
              borderLeft: label === "Sig. Quality" ? "1px solid var(--border-lo)" : undefined,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {CHANNELS.map((ch, i) => (
          <ChannelStrip
            key={ch}
            name={ch}
            location={CHANNEL_LOCATIONS[ch]}
            index={i}
            buffer={buffers[ch]}
            writeHead={writeHead}
            color={CHANNEL_COLORS[ch]}
            quality={channelQuality[ch]}  // live quality
            enabled={enabled[ch]}
            paused={paused}
            onToggle={() => toggle(ch)}
          />
        ))}
      </div>

      <div
        style={{
          padding: "7px 16px",
          borderTop: "1px solid var(--border-lo)",
          background: "var(--bg)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {[
          { dot: "var(--green)", label: "Good  >75%" },
          { dot: "var(--amber)", label: "Fair  45–75%" },
          { dot: "var(--red)",   label: "Poor  <45%" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--t3)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}