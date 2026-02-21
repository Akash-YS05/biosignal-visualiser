"use client";
import { useEffect, useRef } from "react";
import type { ChannelName } from "@/types";

interface Props {
  name: ChannelName;
  location: string;
  index: number;
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
  name, location, index, buffer, writeHead,
  color, quality, enabled, paused, onToggle,
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
    const amp = H * 0.4;

    // Background
    ctx.fillStyle = "#111113";
    ctx.fillRect(0, 0, W, H);

    // Subtle center rule
    ctx.strokeStyle = "#1c1c1f";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(W, mid);
    ctx.stroke();
    ctx.setLineDash([]);

    const startIdx = writeHead % BUFFER_SIZE;

    // Build path points
    const pts: [number, number][] = [];
    for (let x = 0; x < W; x++) {
      const sp = (startIdx + Math.floor((x / W) * BUFFER_SIZE)) % BUFFER_SIZE;
      pts.push([x, mid - buffer[sp] * amp]);
    }

    // --- Filled area under curve ---
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, color + "28");
    fillGrad.addColorStop(0.5, color + "10");
    fillGrad.addColorStop(1, color + "00");

    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(W, mid);
    ctx.closePath();
    ctx.fill();

    // --- Stroke line ---
    ctx.strokeStyle = color;
    ctx.lineWidth = paused ? 1 : 1.5;
    ctx.globalAlpha = paused ? 0.4 : 1;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Edge fade masks so it doesn't look clipped
    const maskW = 24;
    const leftMask = ctx.createLinearGradient(0, 0, maskW, 0);
    leftMask.addColorStop(0, "#111113");
    leftMask.addColorStop(1, "transparent");
    ctx.fillStyle = leftMask;
    ctx.fillRect(0, 0, maskW, H);

    const rightMask = ctx.createLinearGradient(W - maskW, 0, W, 0);
    rightMask.addColorStop(0, "transparent");
    rightMask.addColorStop(1, "#111113");
    ctx.fillStyle = rightMask;
    ctx.fillRect(W - maskW, 0, maskW, H);

  }, [buffer, writeHead, color, enabled, paused]);

  const qualityColor =
    quality > 0.75 ? "var(--green)" :
    quality > 0.45 ? "var(--amber)" : "var(--red)";

  const qualityLabel =
    quality > 0.75 ? "good" :
    quality > 0.45 ? "fair" : "poor";

  return (
    <div
      className="row-hover"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        borderBottom: "1px solid var(--border-lo)",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={onToggle}
      title={`${enabled ? "Disable" : "Enable"} ${name}`}
    >
      {/* Index */}
      <div
        className="mono"
        style={{
          width: 36,
          fontSize: 10,
          color: "var(--t4)",
          textAlign: "center",
          flexShrink: 0,
          paddingLeft: 12,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Channel name + location */}
      <div
        style={{
          width: 88,
          flexShrink: 0,
          padding: "0 12px",
          borderRight: "1px solid var(--border-lo)",
          borderLeft: "1px solid var(--border-lo)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 3,
              height: 12,
              background: enabled ? color : "var(--t4)",
              borderRadius: 0,
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: enabled ? "var(--text-1)" : "var(--t4)",
              transition: "color 0.2s",
            }}
          >
            {name}
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--t3)",
            marginTop: 2,
            paddingLeft: 9,
            fontWeight: 400,
          }}
        >
          {location}
        </div>
      </div>

      {/* Canvas waveform */}
      <div
        style={{
          flex: 1,
          height: 52,
          overflow: "hidden",
          opacity: enabled ? 1 : 0.15,
          transition: "opacity 0.2s",
        }}
      >
        {enabled ? (
          <canvas
            ref={canvasRef}
            width={1000}
            height={52}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#111113",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="mono" style={{ fontSize: 10, color: "var(--t4)", letterSpacing: "0.1em" }}>
              CHANNEL OFF
            </span>
          </div>
        )}
      </div>

      {/* Quality indicator */}
      <div
        style={{
          width: 72,
          flexShrink: 0,
          padding: "0 14px",
          borderLeft: "1px solid var(--border-lo)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: enabled ? qualityColor : "var(--t4)",
              flexShrink: 0,
            }}
          />
          <span
            className="mono"
            style={{ fontSize: 12, fontWeight: 500, color: enabled ? "var(--text-1)" : "var(--t4)" }}
          >
            {enabled ? `${Math.round(quality * 100)}%` : "—"}
          </span>
        </div>
        <span
          style={{ fontSize: 10, color: "var(--t3)", paddingLeft: 10 }}
        >
          {enabled ? qualityLabel : ""}
        </span>
      </div>
    </div>
  );
}