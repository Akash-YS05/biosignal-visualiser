/**
 * FrequencyAnalyzer
 *
 * Live bar chart of EEG band power using Recharts.
 * Delta / Theta / Alpha / Beta / Gamma
 */
"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer
} from "recharts";
import type { BandPower } from "@/types";

interface Props {
  bandPower: BandPower;
}

const BANDS = [
  { key: "delta", label: "δ Delta",  range: "0.5–4Hz",  color: "#7b61ff" },
  { key: "theta", label: "θ Theta",  range: "4–8Hz",    color: "#00d4ff" },
  { key: "alpha", label: "α Alpha",  range: "8–13Hz",   color: "#00ff88" },
  { key: "beta",  label: "β Beta",   range: "13–30Hz",  color: "#ffcc00" },
  { key: "gamma", label: "γ Gamma",  range: "30Hz+",    color: "#ff6b35" },
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { range: string; color: string } }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#0a0e14] border border-border rounded p-2">
      <p className="font-mono text-xs" style={{ color: d.payload.color }}>
        {d.payload.range}
      </p>
      <p className="font-mono text-sm text-text">{d.value.toFixed(1)}%</p>
    </div>
  );
};

export default function FrequencyAnalyzer({ bandPower }: Props) {
  const data = BANDS.map((b) => ({
    name: b.label,
    range: b.range,
    color: b.color,
    value: bandPower[b.key as keyof BandPower],
  }));

  return (
    <div className="bg-panel border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-muted tracking-widest uppercase">Frequency Bands</span>
        <span className="font-mono text-xs text-muted">PSD — rel. power %</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#c8d8e8", fontFamily: "monospace", fontSize: 11 }}
            axisLine={{ stroke: "#1e2d40" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 60]}
            tick={{ fill: "#3a5068", fontFamily: "monospace", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            //@ts-ignore
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}88)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Band legend with live values */}
      <div className="grid grid-cols-5 gap-1 mt-3">
        {BANDS.map((b) => (
          <div key={b.key} className="flex flex-col items-center gap-0.5">
            <span className="font-mono text-xs" style={{ color: b.color }}>
              {bandPower[b.key as keyof BandPower].toFixed(1)}%
            </span>
            <span className="font-mono text-xs text-muted">{b.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}