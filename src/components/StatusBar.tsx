/**
 * StatusBar — now includes pause/resume button
 */
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
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-panel shrink-0">

      {/* Branding */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-bright font-medium tracking-[0.2em]">NEUROSTREAM</span>
        <span className="text-xs text-muted">/ EEG Visualizer</span>
      </div>

      {/* Center — device + pause */}
      <div className="flex items-center gap-3">
        {/* Device pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${paused ? "" : "breathe"}`}
            style={{ backgroundColor: paused ? "#6b8fa8" : "#34d399" }}
          />
          <span className="font-mono text-xs text-soft">Anthriq Instinct</span>
          <span className="text-xs text-muted">· SIM</span>
        </div>

        {/* Pause / Resume button */}
        <button
          onClick={onTogglePause}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium
            transition-all duration-200
            ${paused
              ? "border-green bg-[#34d39915] text-green hover:bg-[#34d39925]"
              : "border-border bg-surface text-soft hover:border-[#38bdf8] hover:text-[#38bdf8] hover:bg-[#38bdf808]"
            }
          `}
        >
          {paused ? (
            <>
              {/* Play icon */}
              <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
                <path d="M2 1.5l7 4-7 4V1.5z" />
              </svg>
              Resume
            </>
          ) : (
            <>
              {/* Pause icon */}
              <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
                <rect x="1.5" y="1.5" width="2.5" height="8" rx="0.5" />
                <rect x="6" y="1.5" width="2.5" height="8" rx="0.5" />
              </svg>
              Pause
            </>
          )}
        </button>

        {/* Paused badge */}
        {paused && (
          <span className="font-mono text-xs text-warn tracking-widest animate-pulse">
            PAUSED
          </span>
        )}
      </div>

      {/* Session meta */}
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs text-bright">{fmt(elapsed)}</span>
          <span className="text-[10px] text-muted leading-none">session</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs text-bright">256 Hz</span>
          <span className="text-[10px] text-muted leading-none">sample rate</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-xs text-bright">8 ch</span>
          <span className="text-[10px] text-muted leading-none">electrodes</span>
        </div>
      </div>
    </div>
  );
}