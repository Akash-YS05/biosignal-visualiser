/**
 * ChannelStrip
 *
 * Renders a single EEG channel as a scrolling waveform using the Canvas API.
 * Uses a ring buffer read approach: draws BUFFER_SIZE samples starting from
 * (writeHead % BUFFER_SIZE) so the oldest sample is on the left.
 */
"use client";
import { useEffect, useRef } from "react";
import type { ChannelName } from "@/types";

interface Props {
  name: ChannelName;
  buffer: Float32Array;
  writeHead: number;
  color: string;
  quality: number; // 0–1
  enabled: boolean;
  onToggle: () => void;
}

const BUFFER_SIZE = 1280;

export default function ChannelStrip({ name, buffer, writeHead, color, quality, enabled, onToggle }: Props) {
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
    const amp = H * 0.38; // signal amplitude in pixels

    // Clear
    ctx.fillStyle = "#0a0e14";
    ctx.fillRect(0, 0, W, H);

    // Draw subtle center line
    ctx.strokeStyle = "#1a2a3a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();

    // Draw waveform
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.beginPath();

    const startIdx = writeHead % BUFFER_SIZE;

    for (let x = 0; x < W; x++) {
      // Map pixel x to sample index in ring buffer
      const samplePos = (startIdx + Math.floor((x / W) * BUFFER_SIZE)) % BUFFER_SIZE;
      const sample = buffer[samplePos];
      const y = mid - sample * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw scan line (current write position marker)
    const scanX = ((writeHead % BUFFER_SIZE) / BUFFER_SIZE) * W;
    const grad = ctx.createLinearGradient(scanX - 20, 0, scanX, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0,212,255,0.15)");
    ctx.fillStyle = grad;
    ctx.fillRect(scanX - 20, 0, 20, H);

  }, [buffer, writeHead, color, enabled]);

  const qualityColor = quality > 0.7 ? "#00ff88" : quality > 0.4 ? "#ffaa00" : "#ff3355";

  return (
    <div className="flex items-center gap-2 group">
      {/* Channel label + toggle */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-20 shrink-0 text-left"
        title={enabled ? "Click to disable" : "Click to enable"}
      >
        {/* Signal quality dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0 transition-colors"
          style={{ backgroundColor: enabled ? qualityColor : "#1e2d40", boxShadow: enabled ? `0 0 6px ${qualityColor}` : "none" }}
        />
        <span
          className="font-mono text-xs tracking-widest transition-colors"
          style={{ color: enabled ? color : "#3a5068" }}
        >
          {name}
        </span>
      </button>

      {/* Canvas */}
      <div
        className="flex-1 rounded overflow-hidden border"
        style={{ borderColor: enabled ? "#1e2d40" : "#111820", height: 48 }}
      >
        {enabled ? (
          <canvas
            ref={canvasRef}
            width={800}
            height={48}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0a0e12]">
            <span className="font-mono text-xs text-muted">DISABLED</span>
          </div>
        )}
      </div>

      {/* Quality pct */}
      <span className="font-mono text-xs w-8 text-right shrink-0" style={{ color: qualityColor }}>
        {enabled ? `${Math.round(quality * 100)}%` : "—"}
      </span>
    </div>
  );
}