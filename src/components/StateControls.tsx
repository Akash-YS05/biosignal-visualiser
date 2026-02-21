"use client";
import type { BrainState } from "@/types";

interface Props {
  currentState: BrainState;
  onStateChange: (s: BrainState) => void;
  onExportCSV: () => void;
}

const STATES: { name: BrainState; description: string; detail: string; color: string; dominant: string }[] = [
  { name: "Relaxed", description: "Alpha-dominant",      detail: "Eyes closed, idle. Alpha waves (8–13 Hz) rise when the brain disengages from active processing.",          color: "#4abe8f", dominant: "α"  },
  { name: "Focused", description: "Beta-dominant",       detail: "Active thinking, reading, problem-solving. Beta (13–30 Hz) reflects engaged analytical cognition.",        color: "#5aafd4", dominant: "β"  },
  { name: "Alert",   description: "Gamma/Beta-dominant", detail: "High arousal or sensory load. Gamma (30+ Hz) is associated with rapid information binding.",               color: "#c8a83a", dominant: "γ"  },
  { name: "REM",     description: "Delta/Theta-dominant",detail: "REM sleep stage. Slow waves (0.5–8 Hz) dominate as the brain consolidates memory during dreaming.",        color: "#9080e0", dominant: "δθ" },
];

export default function StateControls({ currentState, onStateChange, onExportCSV }: Props) {
  const active = STATES.find((s) => s.name === currentState)!;

  return (
    <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-4">
      <div>
        <span className="font-mono text-xs text-bright font-medium tracking-widest uppercase">
          State Simulator
        </span>
        <p className="text-[11px] text-muted mt-1 leading-relaxed">
          Shifts which frequency bands dominate the signal. A real device would infer this automatically.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {STATES.map((s) => {
          const isActive = currentState === s.name;
          return (
            <button
              key={s.name}
              onClick={() => onStateChange(s.name)}
              className="flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all"
              style={{
                borderColor: isActive ? s.color + "70" : "#1a2838",
                backgroundColor: isActive ? s.color + "12" : "#0c1118",
              }}
            >
              <div className="flex items-center justify-between w-full">
                {/* Mono for the state name */}
                <span className="font-mono text-xs font-medium" style={{ color: isActive ? s.color : "#6b8fa8" }}>
                  {s.name}
                </span>
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    color: isActive ? s.color : "#3a5570",
                    backgroundColor: isActive ? s.color + "1a" : "transparent",
                  }}
                >
                  {s.dominant}
                </span>
              </div>
              {/* Inter for the description */}
              <span className="text-[10px] text-muted leading-none">{s.description}</span>
            </button>
          );
        })}
      </div>

      {/* Active state detail — Inter */}
      <div className="px-3 py-2.5 rounded-lg bg-surface border border-border">
        <p className="text-[11px] text-soft leading-relaxed">{active.detail}</p>
      </div>

      <button
        onClick={onExportCSV}
        className="w-full text-[11px] py-2.5 px-4 rounded-lg border border-border text-soft hover:border-accent hover:text-accent hover:bg-[#38bdf808] transition-all tracking-wider uppercase"
      >
        Export CSV — last 5 seconds
      </button>
      <p className="text-[10px] text-muted -mt-2 text-center">
        Raw sample values, all channels. Open in Excel or Python.
      </p>
    </div>
  );
}