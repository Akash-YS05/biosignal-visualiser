"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer
} from "recharts";
import type { BandPower } from "@/types";

interface Props { bandPower: BandPower; }

const BANDS = [
    { key: "delta", symbol: "δ", name: "Delta", range: "0.5–4 Hz",  color: "#9080e0", note: "deep sleep"    },
    { key: "theta", symbol: "θ", name: "Theta", range: "4–8 Hz",    color: "#5aafd4", note: "drowsy / REM"  },
    { key: "alpha", symbol: "α", name: "Alpha", range: "8–13 Hz",   color: "#4abe8f", note: "relaxed"       },
    { key: "beta",  symbol: "β", name: "Beta",  range: "13–30 Hz",  color: "#c8a83a", note: "focused"       },
    { key: "gamma", symbol: "γ", name: "Gamma", range: "30+ Hz",    color: "#d4875a", note: "alert"         },
  ];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: { value: number; payload: { name: string; range: string; note: string; color: string } }[]
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-panel border border-border rounded-lg p-3 shadow-xl">
      <p className="font-mono text-xs font-medium mb-1" style={{ color: d.color }}>{d.name} · {d.range}</p>
      <p className="font-mono text-xs text-text">{payload[0].value.toFixed(1)}% power</p>
      <p className="text-[10px] text-muted mt-1">associated with: {d.note}</p>
    </div>
  );
};

export default function FrequencyAnalyzer({ bandPower }: Props) {
  const data = BANDS.map((b) => ({ ...b, value: bandPower[b.key as keyof BandPower] }));
  const dominant = data.reduce((a, b) => a.value > b.value ? a : b);

  return (
    <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-4">
      <div>
        <span className="font-mono text-xs text-bright font-medium tracking-widest uppercase">
          Frequency Bands
        </span>
        {/* Inter subtitle */}
        <p className="text-[11px] text-muted mt-1 leading-relaxed">
          How much brain activity is in each frequency range. Taller = more energy.
        </p>
      </div>

      {/* Dominant callout */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border">
        <span className="font-mono text-sm" style={{ color: dominant.color }}>{dominant.symbol}</span>
        <div>
          <span className="font-mono text-xs text-bright">{dominant.name} dominant</span>
          {/* Inter for contextual note */}
          <span className="text-[10px] text-muted ml-2">— {dominant.note}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#111d28" vertical={false} />
          <XAxis
            dataKey="symbol"
            tick={{ fill: "#6b8fa8", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 60]}
            tick={{ fill: "#3a5570", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(56,189,248,0.04)" }} />
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Mini legend rows */}
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        {BANDS.map((b) => {
          const val = bandPower[b.key as keyof BandPower];
          const isDom = b.key === dominant.key;
          return (
            <div key={b.key} className="flex items-center gap-2">
              <span className="font-mono text-[10px] w-4" style={{ color: b.color }}>{b.symbol}</span>
              <span className="font-mono text-[10px] text-soft w-10">{b.name}</span>
              <span className="text-[10px] text-muted w-16">{b.range}</span>
              <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(val / 60) * 100}%`, backgroundColor: b.color, opacity: 0.8 }}
                />
              </div>
              <span
                className="font-mono text-[10px] w-8 text-right"
                style={{ color: isDom ? b.color : "#3a5570" }}
              >
                {val.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}