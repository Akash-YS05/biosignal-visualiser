"use client";
import { useEffect, useRef } from "react";
import type { ChannelName } from "@/types";

interface Props {
  name: ChannelName;
  location: string;
  buffer: Float32Array;
  writeHead: number;
  color: string;
  quality: number;
  enabled: boolean;
  paused: boolean;
  onToggle: () => void;
}

const BUFFER_SIZE = 1280;

export default function ChannelStrip({
  name, location, buffer, writeHead, color, quality, enabled, paused, onToggle,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const mid = H / 2;
    const amp = H * 0.36;

    ctx.fillStyle = "#0c1118";
    ctx.fillRect(0, 0, W, H);

    // Center line
    ctx.strokeStyle = "#131f2e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();

    // Waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = paused ? 0.5 : 0.9;
    ctx.beginPath();

    const startIdx = writeHead % BUFFER_SIZE;
    for (let x = 0; x < W; x++) {
      const samplePos = (startIdx + Math.floor((x / W) * BUFFER_SIZE)) % BUFFER_SIZE;
      const y = mid - buffer[samplePos] * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

  }, [buffer, writeHead, color, enabled, paused]);

  const qualityColor = quality > 0.75 ? "#34d399" : quality > 0.45 ? "#fbbf24" : "#f87171";
  const qualityLabel = quality > 0.75 ? "good" : quality > 0.45 ? "fair" : "poor";

  return (
    <div className="flex items-center gap-3 py-1.5">

      {/* Label */}
      <button
        onClick={onToggle}
        className="w-24 shrink-0 flex flex-col gap-0.5 text-left"
        title="Click to toggle channel"
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
            style={{ backgroundColor: enabled ? qualityColor : "#1e2d40" }}
          />
          {/* Mono for channel code */}
          <span
            className="font-mono text-xs font-medium tracking-widest"
            style={{ color: enabled ? color : "#253545" }}
          >
            {name}
          </span>
        </div>
        {/* Inter for descriptive label */}
        <span className="text-[10px] text-muted pl-3 leading-none">{location}</span>
      </button>

      {/* Canvas */}
      <div
        className="flex-1 rounded overflow-hidden"
        style={{
          height: 44,
          border: `1px solid ${enabled ? "#1a2838" : "#0f1620"}`,
          opacity: enabled ? 1 : 0.25,
        }}
      >
        {enabled ? (
          <canvas ref={canvasRef} width={900} height={44} className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-[#0c1118] flex items-center justify-center">
            <span className="text-[10px] text-muted tracking-widest">off</span>
          </div>
        )}
      </div>

      {/* Quality */}
      <div className="w-10 shrink-0 flex flex-col items-end gap-0.5">
        <span className="font-mono text-[10px]" style={{ color: enabled ? qualityColor : "#1e2d3d" }}>
          {enabled ? `${Math.round(quality * 100)}%` : "—"}
        </span>
        {/* Inter for the word label */}
        <span className="text-[9px] text-muted">{enabled ? qualityLabel : ""}</span>
      </div>
    </div>
  );
}