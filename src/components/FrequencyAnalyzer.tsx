"use client";
import type { BandPower } from "@/types";

interface Props { bandPower: BandPower; }

const BANDS = [
  { key: "delta", symbol: "δ", name: "Delta", range: "0.5–4 Hz",  color: "#a78bfa", note: "deep sleep"    },
  { key: "theta", symbol: "θ", name: "Theta", range: "4–8 Hz",    color: "#38bdf8", note: "drowsy / REM"  },
  { key: "alpha", symbol: "α", name: "Alpha", range: "8–13 Hz",   color: "#4ade80", note: "relaxed"       },
  { key: "beta",  symbol: "β", name: "Beta",  range: "13–30 Hz",  color: "#facc15", note: "focused"       },
  { key: "gamma", symbol: "γ", name: "Gamma", range: "30+ Hz",    color: "#f97316", note: "alert"         },
];

export default function FrequencyAnalyzer({ bandPower }: Props) {
  const values = BANDS.map((b) => ({ ...b, value: bandPower[b.key as keyof BandPower] }));
  const dominant = values.reduce((a, b) => a.value > b.value ? a : b);
  const max = Math.max(...values.map((v) => v.value));

  return (
    <div className="panel fadein">
      {/* Header */}
      <div className="panel-header">
        <span className="section-label">Frequency Bands</span>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>relative power %</span>
      </div>

      {/* Dominant state callout */}
      <div
        style={{
          margin: "12px 16px 0",
          padding: "10px 14px",
          background: "var(--bg)",
          border: `1px solid ${dominant.color}30`,
          borderLeft: `3px solid ${dominant.color}`,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              className="mono"
              style={{ fontSize: 18, fontWeight: 600, color: dominant.color }}
            >
              {dominant.symbol}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
              {dominant.name}
            </span>
            <span style={{ fontSize: 11, color: "var(--t2)" }}>dominant</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
            {dominant.range} · {dominant.note}
          </div>
        </div>
        <span
          className="mono"
          style={{ fontSize: 22, fontWeight: 600, color: dominant.color }}
        >
          {dominant.value.toFixed(1)}%
        </span>
      </div>

      {/* Lollipop rows */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {values.map((b) => {
          const isDom = b.key === dominant.key;
          const pct = (b.value / (max * 1.15)) * 100;
          return (
            <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Symbol */}
              <span
                className="mono"
                style={{
                  width: 16,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDom ? b.color : "var(--t3)",
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {b.symbol}
              </span>

              {/* Name */}
              <span
                style={{
                  width: 38,
                  fontSize: 11,
                  fontWeight: isDom ? 600 : 400,
                  color: isDom ? "var(--text-1)" : "var(--t2)",
                  flexShrink: 0,
                }}
              >
                {b.name}
              </span>

              {/* Track + fill + dot */}
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: "var(--border)",
                  position: "relative",
                  borderRadius: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${pct}%`,
                    background: isDom ? b.color : b.color + "80",
                    transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
                    borderRadius: 0,
                  }}
                />
                {/* Dot at end */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${pct}%`,
                    width: isDom ? 8 : 6,
                    height: isDom ? 8 : 6,
                    background: b.color,
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "left 0.4s cubic-bezier(0.16,1,0.3,1)",
                    opacity: isDom ? 1 : 0.7,
                  }}
                />
              </div>

              {/* Value */}
              <span
                className="mono"
                style={{
                  width: 38,
                  fontSize: 12,
                  fontWeight: isDom ? 600 : 400,
                  color: isDom ? b.color : "var(--t2)",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {b.value.toFixed(1)}%
              </span>

              {/* Range */}
              <span
                className="mono"
                style={{
                  width: 52,
                  fontSize: 9,
                  color: "var(--t4)",
                  textAlign: "right",
                  flexShrink: 0,
                  letterSpacing: "0.04em",
                }}
              >
                {b.range}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}