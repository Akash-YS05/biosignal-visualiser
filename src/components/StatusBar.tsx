/**
 * StatusBar
 *
 * Top bar: device status, session timer, version.
 */
"use client";
import { useEffect, useState } from "react";

export default function StatusBar() {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-panel">
      <div className="flex items-center gap-3">
        <span className="font-mono text-accent font-bold tracking-widest text-sm">NEUROSTREAM</span>
        <span className="font-mono text-xs text-muted">v0.1.0</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00ff88", boxShadow: "0 0 8px #00ff88" }} />
        <span className="font-mono text-xs text-green-400" style={{ color: "#00ff88" }}>
          ANTHRIQ INSTINCT — CONNECTED
        </span>
        <span className="font-mono text-xs text-muted ml-3">SIM MODE</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-muted">SESSION {fmt(elapsed)}</span>
        <span className="font-mono text-xs text-muted">256 SPS · 8 CH · 24-bit</span>
      </div>
    </div>
  );
}