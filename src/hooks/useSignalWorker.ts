/**
 * useSignalWorker
 *
 * Manages the Web Worker lifecycle and provides a ring buffer
 * of recent signal data to consumers. Also handles CSV export.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { BrainState, ChannelName, SignalFrame, BandPower } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

// Keep 5 seconds of data at 256Hz = 1280 samples per channel
const BUFFER_SIZE = 1280;

export interface SignalData {
  // Ring buffer: Float32Array per channel, length BUFFER_SIZE
  buffers: Record<ChannelName, Float32Array>;
  bandPower: BandPower;
  writeHead: number; // current write position in ring buffer
}

export function useSignalWorker(brainState: BrainState) {
  const workerRef = useRef<Worker | null>(null);

  // Ring buffers for waveform rendering
  const buffersRef = useRef<Record<ChannelName, Float32Array>>(
    Object.fromEntries(CHANNELS.map((ch) => [ch, new Float32Array(BUFFER_SIZE)])) as Record<ChannelName, Float32Array>
  );
  const writeHeadRef = useRef(0);

  // Band power for frequency analyzer (state so it re-renders)
  const [bandPower, setBandPower] = useState<BandPower>({
    delta: 20, theta: 20, alpha: 20, beta: 20, gamma: 20,
  });

  // Expose write head as state so canvas components know when to redraw
  const [tick, setTick] = useState(0);

  // Raw frame history for CSV export (last 5s)
  const frameHistoryRef = useRef<SignalFrame[]>([]);

  useEffect(() => {
    const worker = new Worker("/signal.worker.js");
    workerRef.current = worker;

    worker.addEventListener("message", (e: MessageEvent<SignalFrame>) => {
      const frame = e.data;

      // Write samples into ring buffers
      for (const ch of CHANNELS) {
        const samples = frame.channels[ch];
        for (const sample of samples) {
          buffersRef.current[ch][writeHeadRef.current % BUFFER_SIZE] = sample;
          writeHeadRef.current++;
        }
        // Normalize write head per channel would be complex; use global tick
      }

      // Store frames for CSV (keep last ~5s worth)
      frameHistoryRef.current.push(frame);
      if (frameHistoryRef.current.length > 330) { // 330 frames ≈ 5s
        frameHistoryRef.current.shift();
      }

      setBandPower(frame.bandPower);
      setTick((t) => t + 1);
    });

    worker.postMessage({ type: "START" });

    return () => {
      worker.postMessage({ type: "STOP" });
      worker.terminate();
    };
  }, []);

  // Push brain state changes to worker
  useEffect(() => {
    workerRef.current?.postMessage({ type: "SET_STATE", state: brainState });
  }, [brainState]);

  // CSV export: flatten frame history
  const exportCSV = useCallback(() => {
    const frames = frameHistoryRef.current;
    if (frames.length === 0) return;

    const rows: string[] = [];
    // Header
    rows.push(["timestamp", ...CHANNELS].join(","));

    for (const frame of frames) {
      const sampleCount = frame.channels["Fp1"].length;
      for (let i = 0; i < sampleCount; i++) {
        const row = [
          frame.timestamp + i * (1000 / 256), // approximate ms timestamp per sample
          ...CHANNELS.map((ch) => frame.channels[ch][i]?.toFixed(6) ?? "0"),
        ];
        rows.push(row.join(","));
      }
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neurostream_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    buffers: buffersRef.current,
    writeHead: writeHeadRef.current,
    bandPower,
    tick,
    exportCSV,
  };
}