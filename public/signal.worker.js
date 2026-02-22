/**
 * NeuroStream Signal Generation Web Worker
 */

const SAMPLE_RATE = 256;

const BAND_FREQS = {
  delta: 2,
  theta: 6,
  alpha: 10,
  beta:  20,
  gamma: 40,
};

/**
 * Weights are raw (not normalized) so dominant bands are clearly visible.
 * But kept modest so signals look like EEG, not earthquake data.
 *
 * Relaxed : slow rolling alpha waves (~10Hz), very clean
 * Focused : faster beta (~20Hz), more compact oscillation
 * Alert   : rapid gamma buzz (~40Hz), looks almost textured
 * REM     : huge slow delta (~2Hz), looks like big lazy waves
 */
const STATE_WEIGHTS = {
  Relaxed: { delta: 0.04, theta: 0.08, alpha: 0.75, beta: 0.06, gamma: 0.02, noise: 0.025 },
  Focused: { delta: 0.04, theta: 0.06, alpha: 0.12, beta: 0.70, gamma: 0.10, noise: 0.040 },
  Alert:   { delta: 0.02, theta: 0.04, alpha: 0.06, beta: 0.35, gamma: 0.72, noise: 0.070 },
  REM:     { delta: 0.80, theta: 0.45, alpha: 0.04, beta: 0.02, gamma: 0.01, noise: 0.020 },
};

const CHANNELS = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

const PHASE_OFFSETS = {
  Fp1: { delta: 0.00, theta: 0.30, alpha: 0.70, beta: 1.10, gamma: 0.50 },
  Fp2: { delta: 0.50, theta: 0.90, alpha: 0.20, beta: 0.60, gamma: 1.30 },
  Fz:  { delta: 1.00, theta: 0.10, alpha: 1.40, beta: 0.30, gamma: 0.80 },
  Cz:  { delta: 0.30, theta: 1.20, alpha: 0.50, beta: 1.80, gamma: 0.20 },
  Pz:  { delta: 0.80, theta: 0.40, alpha: 1.10, beta: 0.90, gamma: 1.60 },
  O1:  { delta: 0.20, theta: 0.70, alpha: 1.90, beta: 0.40, gamma: 0.90 },
  O2:  { delta: 1.50, theta: 0.00, alpha: 0.30, beta: 1.30, gamma: 0.40 },
  T3:  { delta: 0.60, theta: 1.50, alpha: 0.80, beta: 0.20, gamma: 1.10 },
};

// Slight per-channel amplitude variation
const CHANNEL_SCALE = {
  Fp1: 0.95, Fp2: 0.90, Fz: 1.00, Cz: 1.05,
  Pz:  0.88, O1:  0.92, O2: 0.85, T3: 0.78,
};

function gaussianNoise() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateSample(channel, n, weights) {
  const t      = n / SAMPLE_RATE;
  const phases = PHASE_OFFSETS[channel];
  const scale  = CHANNEL_SCALE[channel];

  let signal = 0;

  for (const [band, freq] of Object.entries(BAND_FREQS)) {
    const w = weights[band];
    if (w < 0.001) continue;
    signal += w * Math.sin(2 * Math.PI * freq * t + phases[band]);
  }

  signal += gaussianNoise() * weights.noise;
  signal *= scale;

  // Gentle soft clip — only activates on real extremes
  signal = Math.max(-1, Math.min(1, signal));

  return signal;
}

function computeBandPower(weights) {
  const bands  = ["delta", "theta", "alpha", "beta", "gamma"];
  const powers = bands.map((b) => weights[b] ** 2);
  const total  = powers.reduce((a, b) => a + b, 0);
  return Object.fromEntries(bands.map((b, i) => [b, (powers[i] / total) * 100]));
}

let currentState = "Relaxed";
let running      = false;
let sampleIndex  = 0;
let lastTs       = null;
let sampleDebt   = 0;

function loop(timestamp) {
  if (!running) return;

  if (lastTs === null) {
    lastTs = timestamp;
    requestAnimationFrame(loop);
    return;
  }

  const elapsed  = timestamp - lastTs;
  lastTs         = timestamp;

  const exact    = (elapsed / 1000) * SAMPLE_RATE + sampleDebt;
  const count    = Math.floor(exact);
  sampleDebt     = exact - count;

  if (count === 0) {
    requestAnimationFrame(loop);
    return;
  }

  const weights = STATE_WEIGHTS[currentState];
  const frame   = {
    timestamp:   Date.now(),
    channels:    {},
    bandPower:   computeBandPower(weights),
    sampleCount: count,
    sampleRate:  SAMPLE_RATE,
    // Signal quality per channel — varies with noise level
    // Higher noise = lower quality. Scaled to realistic range (0.55–0.97)
    channelQuality: Object.fromEntries(
      CHANNELS.map((ch) => [
        ch,
        Math.min(
          0.97,
          Math.max(
            0.45,
            CHANNEL_SCALE[ch] * (1 - weights.noise * 4) +
              (Math.random() * 0.04 - 0.02) // tiny jitter per frame
          )
        ),
      ])
    ),
  };

  for (const ch of CHANNELS) {
    const samples = new Array(count);
    for (let i = 0; i < count; i++) {
      samples[i] = generateSample(ch, sampleIndex + i, weights);
    }
    frame.channels[ch] = samples;
  }

  sampleIndex += count;
  self.postMessage(frame);
  requestAnimationFrame(loop);
}

self.addEventListener("message", (e) => {
  if (e.data.type === "SET_STATE") {
    currentState = e.data.state;
    // Tell main thread to flush the ring buffer immediately
    // so state change is visible right away, not after 5s of history drains
    self.postMessage({ type: "FLUSH" });
  }
  if (e.data.type === "START") {
    if (running) return;
    running    = true;
    lastTs     = null;
    sampleDebt = 0;
    requestAnimationFrame(loop);
  }
  if (e.data.type === "STOP") {
    running = false;
    lastTs  = null;
  }
});