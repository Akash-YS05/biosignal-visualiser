"use client";
import { useState } from "react";
import ChannelStrip from "./ChannelStrip";
import type { ChannelName } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

// Carefully chosen: distinct, readable, not clashing on dark bg
const CHANNEL_COLORS: Record<ChannelName, string> = {
  Fp1: "#22d3ee",  // cyan
  Fp2: "#4ade80",  // green
  Fz:  "#a78bfa",  // violet
  Cz:  "#f97316",  // orange
  Pz:  "#38bdf8",  // sky
  O1:  "#facc15",  // yellow
  O2:  "#f472b6",  // pink
  T3:  "#fb923c",  // amber-orange
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

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="panel fadein" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Panel header */}
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
                letterSpacing: "0.06em",
              }}
            >
              FROZEN
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>
          Click any row to toggle · scroll to view all
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
          { label: "#",        width: 36, align: "center" as const, pl: 12 },
          { label: "Channel",  width: 88, align: "left"   as const, pl: 21 },
          { label: "Waveform — past ←  live", width: undefined, align: "left" as const, pl: 16 },
          { label: "Sig. Quality", width: 72, align: "left" as const, pl: 14 },
        ].map(({ label, width, align, pl }) => (
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
              textAlign: align,
              flexShrink: width ? 0 : undefined,
              borderRight: label === "Channel" ? "1px solid var(--border-lo)" : undefined,
              borderLeft: label === "Sig. Quality" ? "1px solid var(--border-lo)" : undefined,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Scrollable rows */}
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
            quality={BASE_QUALITY[ch]}
            enabled={enabled[ch]}
            paused={paused}
            onToggle={() => toggle(ch)}
          />
        ))}
      </div>

      {/* Footer */}
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
          { dot: "var(--green)", label: "Good signal  >75%" },
          { dot: "var(--amber)", label: "Fair  45–75%" },
          { dot: "var(--red)",   label: "Poor  <45%" },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0 }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--t3)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}