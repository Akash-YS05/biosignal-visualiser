"use client";
import { useEffect, useState } from "react";

interface Props {
  paused: boolean;
  onTogglePause: () => void;
}

export default function StatusBar({ paused, onTogglePause }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [startTime]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      style={{
        height: 48,
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
        zIndex: 20,
        position: "relative",
      }}
    >
      {/* Left — wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Minimal logo — 3 horizontal bars of different widths */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[12, 8, 10].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 1.5,
                  background: "var(--cyan)",
                  borderRadius: 0,
                }}
              />
            ))}
          </div>
          <span
            className="mono"
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "var(--text-1)",
            }}
          >
            NEUROSTREAM
          </span>
        </div>

        <div
          style={{
            width: 1,
            height: 16,
            background: "var(--border)",
          }}
        />

        {/* Device status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            className={paused ? "" : "blink"}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: paused ? "var(--t3)" : "var(--cyan)",
            }}
          />
          <span className="mono" style={{ fontSize: 11, color: "var(--t3)" }}>
            ANTHRIQ INSTINCT
          </span>
          <span
            className="mono"
            style={{
              fontSize: 9,
              color: "var(--cyan)",
              background: "var(--cyan-bg)",
              border: "1px solid var(--cyan-bdr)",
              padding: "1px 5px",
              borderRadius: 2,
              letterSpacing: "0.08em",
            }}
          >
            SIM
          </span>
        </div>
      </div>

      {/* Center — pause */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {paused && (
          <span
            className="mono blink"
            style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.1em" }}
          >
            STREAM PAUSED
          </span>
        )}
        <button className={paused ? "btn btn-cyan" : "btn"} onClick={onTogglePause}>
          {paused ? (
            <>
              <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
                <path d="M1 1.2L8 5 1 8.8V1.2z" />
              </svg>
              Resume Stream
            </>
          ) : (
            <>
              <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
                <rect x="1" y="1" width="2.5" height="8" rx="0.5" />
                <rect x="5.5" y="1" width="2.5" height="8" rx="0.5" />
              </svg>
              Pause Stream
            </>
          )}
        </button>
      </div>

      {/* Right — meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {[
          { label: "SESSION", value: fmt(elapsed) },
          { label: "SAMPLE RATE", value: "256 Hz" },
          { label: "RESOLUTION", value: "24-bit" },
          { label: "CHANNELS", value: "8" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>
              {value}
            </span>
            <span className="mono" style={{ fontSize: 9, color: "var(--t4)", letterSpacing: "0.08em" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}