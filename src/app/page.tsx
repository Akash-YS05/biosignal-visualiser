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
  const { buffers, writeHead, channelQuality, bandPower, paused, togglePause, exportCSV, actualHz } =
    useSignalWorker(brainState);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Top bar — fixed height */}
      <StatusBar paused={paused} onTogglePause={togglePause} actualHz={actualHz} />

      {/* Info strip — fixed height */}
      <div
        style={{
          height: 30,
          borderBottom: "1px solid var(--border-lo)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 8,
          flexShrink: 0,
          background: "var(--bg)",
          overflow: "hidden",
        }}
      >
        {[
          "8-channel EEG simulation",
          "256 Hz sample rate",
          "Web Worker signal generation",
          "Swap source → Anthriq BLE for live hardware",
        ].map((item, i) => (
          <span
            key={i}
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--t3)",
              letterSpacing: "0.04em",
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            {i > 0 && <span style={{ color: "var(--t4)" }}>·</span>}
            {item}
          </span>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,          
          display: "flex",
          overflow: "hidden",
          gap: 1,
          background: "var(--border-lo)",
        }}
      >
        {/* Signal stream panel — fills all horizontal space left */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          <SignalStreamPanel
            buffers={buffers}
            writeHead={writeHead}
            paused={paused}
            channelQuality={channelQuality}
          />
        </div>

       
        <div
          style={{
            width: 300,
            flexShrink: 0,
            minHeight: 0,
            overflowY: "auto",  
            overflowX: "hidden",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FrequencyAnalyzer bandPower={bandPower} />

          <div style={{ height: 1, background: "var(--border-lo)", flexShrink: 0 }} />

          <StateControls
            currentState={brainState}
            onStateChange={setBrainState}
            onExportCSV={exportCSV}
          />

          <div style={{ height: 1, background: "var(--border-lo)", flexShrink: 0 }} />

          {/* Device info */}
          <div style={{ background: "var(--bg-panel)", flexShrink: 0 }}>
            <div className="panel-header">
              <span className="section-label">Device Info</span>
            </div>
            {[
              ["Device",    "Anthriq Instinct"],
              ["Firmware",  "v2.3.1-sim"],
              ["Protocol",  "NeuroStream BLE"],
              ["Impedance", "< 5 kΩ"],
              ["Filter",    "0.5–100 Hz BP"],
              ["Notch",     "50 / 60 Hz"],
            ].map(([key, val], i, arr) => (
              <div
                key={key}
                className="row-hover"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border-lo)" : "none",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--t3)" }}>{key}</span>
                <span
                  className="mono"
                  style={{ fontSize: 11, fontWeight: 500, color: "var(--text-1)" }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--border-lo)", flexShrink: 0 }} />

          {/* How to read */}
          <div style={{ background: "var(--bg-panel)", flexShrink: 0 }}>
            <div className="panel-header">
              <span className="section-label">How to Read</span>
            </div>
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                {
                  label: "Waveform",
                  color: "var(--cyan)",
                  text: "Raw voltage from one scalp electrode. X-axis = time (past → present). Y-axis = amplitude in μV.",
                },
                {
                  label: "Signal Quality",
                  color: "var(--green)",
                  text: "Impedance estimate. Green >75% = reliable. Amber = check contact. Red = noisy — don't use for analysis.",
                },
                {
                  label: "Band Power %",
                  color: "#a78bfa",
                  text: "Proportion of signal energy in each frequency band. All 5 sum to 100%.",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 2,
                        height: 10,
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="mono"
                      style={{ fontSize: 11, fontWeight: 500, color: "var(--text-1)" }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--t2)",
                      lineHeight: 1.6,
                      paddingLeft: 8,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom padding so last item isn't flush against the scrollbar */}
          <div style={{ height: 16, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}