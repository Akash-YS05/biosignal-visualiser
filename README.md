# NeuroStream

> Real-time multi-channel EEG biosignal visualization dashboard — companion layer for the **Anthriq Instinct** EEG headset.

<img width="1919" height="899" alt="image" src="https://github.com/user-attachments/assets/7194325c-ddc1-4a30-ae9c-821213b912d0" />

## Overview

NeuroStream is a developer-facing biosignal visualizer built to demonstrate how real-time EEG data from a device like the Anthriq Instinct could be rendered, analyzed, and interacted with in a browser — with zero backend required.

It simulates an 8-channel EEG stream using a sum-of-sines + Gaussian noise model, runs signal generation entirely in a **Web Worker** off the main thread, renders waveforms with the **Canvas API**, and displays frequency band power with **Recharts**.

## Architecture
```
signal.worker.js          ← Web Worker: generates EEG samples at 256 Hz
        ↓ postMessage (SignalFrame)
useSignalWorker.ts        ← React hook: ring buffer management, CSV export
        ↓ props
SignalStreamPanel.tsx     ← 8x ChannelStrip (Canvas waveform renderers)
FrequencyAnalyzer.tsx     ← Recharts bar chart (δ θ α β γ band power)
StateControls.tsx         ← Brain state presets + CSV export button
StatusBar.tsx             ← Device status, session timer
```

## Signal Generation

Each channel is modeled as:
```
signal(t) = Σ [ weight_band × sin(2π × freq_band × t + φ_channel) ]
           + gaussian_noise(σ=0.08)
```

Band weights shift based on the active **brain state**:

| State   | δ    | θ    | α    | β    | γ    |
|---------|------|------|------|------|------|
| Relaxed | 0.2  | 0.3  | 1.0  | 0.3  | 0.1  |
| Focused | 0.1  | 0.2  | 0.4  | 1.0  | 0.3  |
| Alert   | 0.1  | 0.1  | 0.2  | 0.8  | 1.0  |
| REM     | 1.0  | 0.8  | 0.2  | 0.1  | 0.05 |

## Tech Stack

- **Next.js 14** (App Router, client-side only)
- **TypeScript** throughout
- **Tailwind CSS** — dark scientific aesthetic
- **Canvas API** — raw waveform rendering, no chart library overhead
- **Recharts** — frequency band bar chart
- **Web Workers** — signal generation off main thread

## Getting Started
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).


## Relevance to Anthriq Instinct

The Anthriq Instinct headset outputs raw EEG samples over BLE. NeuroStream is designed as the visualization layer that would sit above a BLE driver — replace `signal.worker.js`'s synthetic generator with a real BLE data handler, and the rest of the stack works unchanged. The architecture intentionally mirrors what a production companion app would look like.
