import { useEffect, useRef, useState, useCallback } from "react";
import type { BrainState, ChannelName, SignalFrame, BandPower } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];
const BUFFER_SIZE = 1280;

// Static base quality per channel (electrode position dependent)
const BASE_QUALITY: Record<ChannelName, number> = {
  Fp1: 0.92, Fp2: 0.88, Fz: 0.95, Cz: 0.97,
  Pz:  0.85, O1:  0.91, O2: 0.78, T3: 0.62,
};

export function useSignalWorker(brainState: BrainState) {
  const workerRef = useRef<Worker | null>(null);
  const [paused, setPaused] = useState(false);

  const buffersRef = useRef<Record<ChannelName, Float32Array>>(
    Object.fromEntries(
      CHANNELS.map((ch) => [ch, new Float32Array(BUFFER_SIZE)])
    ) as Record<ChannelName, Float32Array>
  );
  const writeHeadRef = useRef(0);

  const [bandPower, setBandPower] = useState<BandPower>({
    delta: 20, theta: 20, alpha: 20, beta: 20, gamma: 20,
  });

  // Live channel quality — updated from worker each frame
  const [channelQuality, setChannelQuality] = useState<Record<ChannelName, number>>(
    { ...BASE_QUALITY }
  );

  const [tick, setTick]         = useState(0);
  const sampleCountRef          = useRef(0);
  const windowStartRef          = useRef(Date.now());
  const [actualHz, setActualHz] = useState(0);
  const frameHistoryRef         = useRef<SignalFrame[]>([]);

  // Flush: zero out all ring buffers and reset write head
  // Called immediately when brain state changes so old state
  // doesn't linger visually for 5 seconds
  const flushBuffers = useCallback(() => {
    for (const ch of CHANNELS) {
      buffersRef.current[ch].fill(0);
    }
    writeHeadRef.current = 0;
    frameHistoryRef.current = [];
  }, []);

  useEffect(() => {
    const worker = new Worker("/signal.worker.js");
    workerRef.current = worker;

    worker.addEventListener("message", (e: MessageEvent) => {
      // Handle flush signal from worker
      if (e.data.type === "FLUSH") {
        flushBuffers();
        setTick((t) => t + 1);
        return;
      }

      const frame = e.data as SignalFrame & {
        channelQuality?: Record<ChannelName, number>;
      };

      const samplesThisFrame = frame.channels["Fp1"].length;

      for (const ch of CHANNELS) {
        const samples = frame.channels[ch];
        for (const sample of samples) {
          buffersRef.current[ch][writeHeadRef.current % BUFFER_SIZE] = sample;
          writeHeadRef.current++;
        }
      }

      // Update channel quality from worker (blended with base quality
      // so it doesn't jump around too much frame to frame)
      if (frame.channelQuality) {
        setChannelQuality((prev) => {
          const next = { ...prev };
          for (const ch of CHANNELS) {
            const live = frame.channelQuality![ch];
            const base = BASE_QUALITY[ch];
            // Weighted blend: 80% base position quality + 20% live noise estimate
            // This gives gentle variation without wild swings
            next[ch] = base * 0.80 + live * 0.20;
          }
          return next;
        });
      }

      // Measure actual Hz over 2s window
      sampleCountRef.current += samplesThisFrame;
      const now     = Date.now();
      const elapsed = (now - windowStartRef.current) / 1000;
      if (elapsed >= 2) {
        setActualHz(Math.round(sampleCountRef.current / elapsed));
        sampleCountRef.current = 0;
        windowStartRef.current = now;
      }

      frameHistoryRef.current.push(frame);
      if (frameHistoryRef.current.length > 400) frameHistoryRef.current.shift();

      setBandPower(frame.bandPower);
      setTick((t) => t + 1);
    });

    worker.postMessage({ type: "START" });

    return () => {
      worker.postMessage({ type: "STOP" });
      worker.terminate();
    };
  }, [flushBuffers]);

  // Push brain state to worker — worker sends FLUSH back
  useEffect(() => {
    workerRef.current?.postMessage({ type: "SET_STATE", state: brainState });
  }, [brainState]);

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: "STOP" });
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    workerRef.current?.postMessage({ type: "START" });
    setPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (paused) resume(); else pause();
  }, [paused, pause, resume]);

  const exportCSV = useCallback(() => {
    const frames = frameHistoryRef.current;
    if (!frames.length) return;

    const rows: string[] = [["timestamp_ms", ...CHANNELS].join(",")];
    for (const frame of frames) {
      const count = frame.channels["Fp1"].length;
      for (let i = 0; i < count; i++) {
        rows.push([
          (frame.timestamp + i * (1000 / 256)).toFixed(3),
          ...CHANNELS.map((ch) => frame.channels[ch][i]?.toFixed(6) ?? "0"),
        ].join(","));
      }
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `neurostream_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    buffers: buffersRef.current,
    writeHead: writeHeadRef.current,
    bandPower,
    channelQuality,   // ← now live, not static
    tick,
    paused,
    togglePause,
    exportCSV,
    actualHz,
  };
}