"use client";
import type { BrainState } from "@/types";

interface Props {
  currentState: BrainState;
  onStateChange: (s: BrainState) => void;
  onExportCSV: () => void;
}

const STATES: {
  name: BrainState;
  dominant: string;
  bands: string;
  detail: string;
  color: string;
}[] = [
  {
    name: "Relaxed",
    dominant: "α",
    bands: "Alpha-dominant",
    detail: "Idle, eyes closed. Alpha rises when the brain disengages from active processing.",
    color: "#4ade80",
  },
  {
    name: "Focused",
    dominant: "β",
    bands: "Beta-dominant",
    detail: "Active thinking, reading, coding. Beta reflects engaged analytical cognition.",
    color: "#38bdf8",
  },
  {
    name: "Alert",
    dominant: "γ",
    bands: "Gamma / Beta",
    detail: "High arousal, rapid sensory processing. Gamma associated with information binding.",
    color: "#facc15",
  },
  {
    name: "REM",
    dominant: "δθ",
    bands: "Delta / Theta",
    detail: "Deep sleep dreaming. Slow waves dominate as the brain consolidates memory.",
    color: "#a78bfa",
  },
];

export default function StateControls({ currentState, onStateChange, onExportCSV }: Props) {
  const active = STATES.find((s) => s.name === currentState)!;

  return (
    <div
      style={{
        background: "var(--bg-panel)",
        flexShrink: 0,       /* never collapse */
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div className="panel-header">
        <span className="section-label">Brain State</span>
        <span style={{ fontSize: 11, color: "var(--t3)" }}>
          shifts signal band weights
        </span>
      </div>

      {/* State rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {STATES.map((s) => {
          const isActive = currentState === s.name;
          return (
            <button
              key={s.name}
              onClick={() => onStateChange(s.name)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "stretch",
                background: isActive ? "var(--bg-hover)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--border-lo)",
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {/* Left accent bar */}
              <div
                style={{
                  width: 3,
                  flexShrink: 0,
                  background: isActive ? s.color : "transparent",
                  transition: "background 0.2s",
                }}
              />

              {/* Row content */}
              <div
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                {/* Greek symbol */}
                <span
                  className="mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: isActive ? s.color : "var(--t4)",
                    width: 24,
                    flexShrink: 0,
                    lineHeight: 1,
                    paddingTop: 1,
                    transition: "color 0.2s",
                  }}
                >
                  {s.dominant}
                </span>

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? "var(--text-1)" : "var(--t2)",
                        transition: "color 0.2s",
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: isActive ? s.color : "var(--t4)",
                        transition: "color 0.2s",
                      }}
                    >
                      {s.bands}
                    </span>
                  </div>

                  {/* Detail — only shown when active */}
                  {isActive && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--t2)",
                        marginTop: 4,
                        lineHeight: 1.55,
                      }}
                    >
                      {s.detail}
                    </p>
                  )}
                </div>

                {/* Checkmark when active */}
                {isActive && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  >
                    <circle cx="7" cy="7" r="6" stroke={s.color} strokeWidth="1.5" />
                    <path
                      d="M4.5 7l2 2 3-3"
                      stroke={s.color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Export button */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid var(--border-lo)",
        }}
      >
        <button
          className="btn btn-cyan"
          onClick={onExportCSV}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "8px 14px",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M5.5 1v6M2.5 5l3 3 3-3" />
            <path d="M1 9.5h9" />
          </svg>
          Export CSV — last 5 seconds
        </button>
        <p
          style={{
            fontSize: 10,
            color: "var(--t4)",
            marginTop: 7,
            textAlign: "center",
          }}
        >
          Raw μV samples · all channels · open in Python or Excel
        </p>
      </div>
    </div>
  );
}