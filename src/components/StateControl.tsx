/**
 * StateControls
 *
 * Brain state selector + CSV export button.
 */
"use client";
import type { BrainState } from "@/types";

interface Props {
  currentState: BrainState;
  onStateChange: (s: BrainState) => void;
  onExportCSV: () => void;
}

const STATES: { name: BrainState; description: string; color: string; icon: string }[] = [
  { name: "Relaxed",  description: "Alpha-dominant. Eyes closed, calm.",          color: "#00ff88", icon: "◉" },
  { name: "Focused",  description: "Beta-dominant. Active concentration.",         color: "#00d4ff", icon: "◈" },
  { name: "Alert",    description: "Gamma/Beta. High arousal, sensory input.",     color: "#ffcc00", icon: "◆" },
  { name: "REM",      description: "Delta/Theta. Deep sleep, slow waves.",         color: "#7b61ff", icon: "◌" },
];

export default function StateControls({ currentState, onStateChange, onExportCSV }: Props) {
  return (
    <div className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-4">
      <span className="font-mono text-xs text-muted tracking-widest uppercase">Brain State Simulator</span>

      <div className="grid grid-cols-2 gap-2">
        {STATES.map((s) => {
          const active = currentState === s.name;
          return (
            <button
              key={s.name}
              onClick={() => onStateChange(s.name)}
              className="relative flex flex-col items-start gap-1 p-3 rounded border transition-all text-left"
              style={{
                borderColor: active ? s.color : "#1e2d40",
                backgroundColor: active ? `${s.color}14` : "#0a0e12",
                boxShadow: active ? `0 0 16px ${s.color}30` : "none",
              }}
            >
              {/* Active indicator */}
              {active && (
                <span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }}
                />
              )}
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm" style={{ color: s.color }}>{s.icon}</span>
                <span className="font-mono text-sm font-semibold" style={{ color: active ? s.color : "#c8d8e8" }}>
                  {s.name}
                </span>
              </div>
              <span className="font-mono text-xs text-muted leading-tight">{s.description}</span>
            </button>
          );
        })}
      </div>

      {/* Export */}
      <button
        onClick={onExportCSV}
        className="w-full font-mono text-xs py-2.5 px-4 rounded border border-border text-accent hover:border-accent hover:bg-[#00d4ff10] transition-all tracking-widest uppercase"
      >
        ⬇ Export CSV — Last 5s
      </button>
    </div>
  );
}