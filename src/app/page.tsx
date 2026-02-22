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
  const {
    buffers,
    writeHead,
    bandPower,
    channelQuality,
    paused,
    togglePause,
    exportCSV,
    actualHz,
  } = useSignalWorker(brainState);

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
      {/* Top bar */}
      <StatusBar
        paused={paused}
        onTogglePause={togglePause}
        actualHz={actualHz}
      />

      {/* Info strip */}
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

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Left — signal stream */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            borderRight: "1px solid var(--border-lo)",
          }}
        >
          <SignalStreamPanel
            buffers={buffers}
            writeHead={writeHead}
            paused={paused}
            channelQuality={channelQuality}
          />
        </div>

        {/*Right sidebar.*/}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--bg)",
          }}
        >

          {/* Frequency Bands */}
          <FrequencyAnalyzer bandPower={bandPower} />

          <div style={{ height: 1, background: "var(--border-lo)" }} />

          {/* Brain State */}
          <StateControls
            currentState={brainState}
            onStateChange={setBrainState}
            onExportCSV={exportCSV}
          />

          <div style={{ height: 1, background: "var(--border-lo)" }} />

          {/* Device Info */}
          <div style={{ background: "var(--bg-panel)" }}>
            <div className="panel-header">
              <span className="section-label">Device Info</span>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>
                reported over BLE on connect
              </span>
            </div>
            <div>
              {[
                ["Device",     "Anthriq Instinct"],
                ["Firmware",   "v2.3.1-sim"],
                ["Protocol",   "NeuroStream BLE"],
                ["Impedance",  "< 5 kΩ"],
                ["Filter",     "0.5–100 Hz BP"],
                ["Notch",      "50 / 60 Hz"],
              ].map(([key, val], i, arr) => (
                <div
                  key={key}
                  className="row-hover"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderBottom:
                      i < arr.length - 1
                        ? "1px solid var(--border-lo)"
                        : "none",
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>
                    {key}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-1)",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "var(--border-lo)" }} />

          {/* How to Read */}
          <div style={{ background: "var(--bg-panel)" }}>
            <div className="panel-header">
              <span className="section-label">How to Read</span>
            </div>
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[
                {
                  label: "Waveform",
                  color: "var(--cyan)",
                  text: "Raw voltage from one scalp electrode. Left = past, right = present. Amplitude = signal strength in μV.",
                },
                {
                  label: "Signal Quality",
                  color: "var(--green)",
                  text: "Impedance-based estimate per channel. Green >75% reliable. Amber = check contact. Red = too noisy for analysis.",
                },
                {
                  label: "Band Power %",
                  color: "#a78bfa",
                  text: "Energy in each EEG frequency band as a proportion. All 5 bands sum to 100%. Changes with brain state.",
                },
                {
                  label: "Brain State",
                  color: "var(--amber)",
                  text: "Shifts the weights of each frequency band in the signal generator. Switching state clears the waveform buffer instantly.",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 5,
                    }}
                  >
                    <div
                      style={{
                        width: 2,
                        height: 11,
                        background: item.color,
                        flexShrink: 0,
                        borderRadius: 1,
                      }}
                    />
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--text-1)",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--t2)",
                      lineHeight: 1.65,
                      paddingLeft: 8,
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom breathing room */}
          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}