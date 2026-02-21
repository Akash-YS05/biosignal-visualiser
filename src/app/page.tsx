"use client";
import { useState } from "react";
import { useSignalWorker } from "@/hooks/useSignalWorker";
import StatusBar from "@/components/StatusBar";
import SignalStreamPanel from "@/components/SignalStreamPanel";
import FrequencyAnalyzer from "@/components/FrequencyAnalyzer";
import StateControls from "@/components/StateControls";
import type { BrainState } from "@/types";

export default function Home() {
  const [brainState, setBrainState] = useState<BrainState>("Relaxed");
  const { buffers, writeHead, bandPower, paused, togglePause, exportCSV } = useSignalWorker(brainState);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080b10]">

      <StatusBar paused={paused} onTogglePause={togglePause} />

      {/* Info strip */}
      <div className="px-6 py-2 border-b border-border bg-[#0a0e14] flex items-center gap-4 shrink-0">
        <span className="text-[10px] text-muted">
          Simulated 8-channel EEG · 256 Hz · Signal generation runs in a background Web Worker thread
        </span>
        <span className="text-[#1a2838]">·</span>
        <span className="text-[10px] text-muted">
          Replace signal source with BLE stream from Anthriq Instinct to use with real hardware
        </span>
      </div>

      {/* Main layout — overflow-hidden keeps everything contained */}
      <div className="flex flex-1 overflow-hidden gap-3 p-4">

        {/* 
          Signal stream column.
          overflow-hidden here is critical — the SignalStreamPanel
          manages its own internal scroll, so this column must NOT scroll.
        */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <SignalStreamPanel buffers={buffers} writeHead={writeHead} paused={paused} />
        </div>

        {/* Right sidebar — this one CAN scroll independently */}
        <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto">

          <FrequencyAnalyzer bandPower={bandPower} />

          <StateControls
            currentState={brainState}
            onStateChange={setBrainState}
            onExportCSV={exportCSV}
          />

          {/* Device info */}
          <div className="bg-panel border border-border rounded-xl p-5">
            <span className="font-mono text-xs text-bright font-medium tracking-widest uppercase block mb-1">
              Device Info
            </span>
            <p className="text-[11px] text-muted mb-4 leading-relaxed">
              Metadata a real headset reports over BLE on connect.
            </p>
            <div className="flex flex-col gap-3">
              {[
                ["Device",    "Anthriq Instinct",  "headset model"],
                ["Firmware",  "v2.3.1-sim",         "software version on device"],
                ["Protocol",  "NeuroStream BLE",    "data transfer standard"],
                ["Impedance", "< 5 kΩ (sim)",       "electrode-skin contact quality"],
                ["Filter",    "0.5–100 Hz BP",      "removes DC offset and high-freq noise"],
                ["Notch",     "50 / 60 Hz",         "cancels power line interference"],
              ].map(([key, val, hint]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-[10px] text-muted">{key}</span>
                    <span className="font-mono text-[10px] text-soft">{val}</span>
                  </div>
                  <span className="text-[9px] text-[#253545] leading-none">{hint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-panel border border-border rounded-xl p-5">
            <span className="font-mono text-xs text-bright font-medium tracking-widest uppercase block mb-3">
              Reading the display
            </span>
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Waveform",
                  text: "Each row shows raw voltage from one electrode over the last ~5 seconds. Amplitude reflects signal strength."
                },
                {
                  label: "Signal Quality (SQ)",
                  text: "Green >75% · Amber 45–75% · Red <45%. Based on electrode-skin impedance. Low quality means noisy contact."
                },
                {
                  label: "Band Power %",
                  text: "Relative energy per frequency band. All 5 bands sum to 100%. Shifts when you change the brain state."
                },
              ].map((item) => (
                <div key={item.label}>
                  <span className="font-mono text-[10px] text-accent block mb-1">{item.label}</span>
                  <p className="text-[10px] text-muted leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}