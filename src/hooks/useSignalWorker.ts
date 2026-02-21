/**
 * useSignalWorker
 * Now exposes pause / resume controls.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import type { BrainState, ChannelName, SignalFrame, BandPower } from "@/types";

const CHANNELS: ChannelName[] = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];
const BUFFER_SIZE = 1280;

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
  const [tick, setTick] = useState(0);

  const frameHistoryRef = useRef<SignalFrame[]>([]);

  useEffect(() => {
    const worker = new Worker("/signal.worker.js");
    workerRef.current = worker;

    worker.addEventListener("message", (e: MessageEvent<SignalFrame>) => {
      const frame = e.data;

      for (const ch of CHANNELS) {
        const samples = frame.channels[ch];
        for (const sample of samples) {
          buffersRef.current[ch][writeHeadRef.current % BUFFER_SIZE] = sample;
          writeHeadRef.current++;
        }
      }

      frameHistoryRef.current.push(frame);
      if (frameHistoryRef.current.length > 330) frameHistoryRef.current.shift();

      setBandPower(frame.bandPower);
      setTick((t) => t + 1);
    });

    worker.postMessage({ type: "START" });

    return () => {
      worker.postMessage({ type: "STOP" });
      worker.terminate();
    };
  }, []);

  // Brain state changes
  useEffect(() => {
    workerRef.current?.postMessage({ type: "SET_STATE", state: brainState });
  }, [brainState]);

  // Pause / resume
  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: "STOP" });
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    workerRef.current?.postMessage({ type: "START" });
    setPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (paused) resume();
    else pause();
  }, [paused, pause, resume]);

  // CSV export
  const exportCSV = useCallback(() => {
    const frames = frameHistoryRef.current;
    if (!frames.length) return;

    const rows: string[] = [["timestamp", ...CHANNELS].join(",")];
    for (const frame of frames) {
      const sampleCount = frame.channels["Fp1"].length;
      for (let i = 0; i < sampleCount; i++) {
        rows.push([
          frame.timestamp + i * (1000 / 256),
          ...CHANNELS.map((ch) => frame.channels[ch][i]?.toFixed(6) ?? "0"),
        ].join(","));
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
    paused,
    togglePause,
    exportCSV,
  };
}