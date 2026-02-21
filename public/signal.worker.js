/**
 * NeuroStream Signal Generation Web Worker
 *
 * Generates synthetic EEG-like signals for 8 channels using
 * a sum-of-sines model at representative frequencies for each
 * EEG band, weighted by the active brain state, plus Gaussian noise.
 *
 * Runs off the main thread to keep the UI smooth.
 */

// Sample rate: 256 Hz (standard EEG)
const SAMPLE_RATE = 256;

// Samples per frame sent to main thread (≈ 16ms @ 256Hz = ~4 samples)
const FRAME_SIZE = 4;

// Representative frequencies (Hz) for each band
const BAND_FREQS = {
  delta: 2,
  theta: 6,
  alpha: 10,
  beta: 20,
  gamma: 40,
};

// Brain state → band amplitude weights
const STATE_WEIGHTS = {
  Relaxed:  { delta: 0.2, theta: 0.3, alpha: 1.0, beta: 0.3, gamma: 0.1 },
  Focused:  { delta: 0.1, theta: 0.2, alpha: 0.4, beta: 1.0, gamma: 0.3 },
  Alert:    { delta: 0.1, theta: 0.1, alpha: 0.2, beta: 0.8, gamma: 1.0 },
  REM:      { delta: 1.0, theta: 0.8, alpha: 0.2, beta: 0.1, gamma: 0.05 },
};

const CHANNELS = ["Fp1", "Fp2", "Fz", "Cz", "Pz", "O1", "O2", "T3"];

// Per-channel phase offsets so channels don't look identical
const PHASE_OFFSETS = {
  Fp1: { delta: 0.0,  theta: 0.3,  alpha: 0.7,  beta: 1.1,  gamma: 0.5  },
  Fp2: { delta: 0.5,  theta: 0.9,  alpha: 0.2,  beta: 0.6,  gamma: 1.3  },
  Fz:  { delta: 1.0,  theta: 0.1,  alpha: 1.4,  beta: 0.3,  gamma: 0.8  },
  Cz:  { delta: 0.3,  theta: 1.2,  alpha: 0.5,  beta: 1.8,  gamma: 0.2  },
  Pz:  { delta: 0.8,  theta: 0.4,  alpha: 1.1,  beta: 0.9,  gamma: 1.6  },
  O1:  { delta: 0.2,  theta: 0.7,  alpha: 1.9,  beta: 0.4,  gamma: 0.9  },
  O2:  { delta: 1.5,  theta: 0.0,  alpha: 0.3,  beta: 1.3,  gamma: 0.4  },
  T3:  { delta: 0.6,  theta: 1.5,  alpha: 0.8,  beta: 0.2,  gamma: 1.1  },
};

/**
 * Box-Muller transform: generates Gaussian noise with mean=0, std=1
 */
function gaussianNoise() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generate one sample for a channel at a given time index
 * @param {string} channel
 * @param {number} t - time in seconds
 * @param {object} weights - band amplitude weights
 */
function generateSample(channel, t, weights) {
  const phases = PHASE_OFFSETS[channel];
  let signal = 0;

  // Sum sine waves for each band, scaled by weight
  for (const [band, freq] of Object.entries(BAND_FREQS)) {
    const w = weights[band];
    const phi = phases[band];
    // amplitude scaled so total signal roughly stays in ±1 range
    signal += w * Math.sin(2 * Math.PI * freq * t + phi);
  }

  // Normalize by sum of weights to keep amplitude bounded
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  signal /= totalWeight;

  // Add Gaussian noise (scaled small so structure is visible)
  signal += gaussianNoise() * 0.08;

  return signal;
}

/**
 * Compute approximate band power for the current weights
 * (Just use weights² as a proxy — real FFT not needed for visualization)
 */
function computeBandPower(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  return {
    delta: (weights.delta / total) * 100,
    theta: (weights.theta / total) * 100,
    alpha: (weights.alpha / total) * 100,
    beta:  (weights.beta  / total) * 100,
    gamma: (weights.gamma / total) * 100,
  };
}

// State
let currentState = "Relaxed";
let sampleIndex = 0;
let intervalId = null;

// Interval: emit FRAME_SIZE samples at SAMPLE_RATE
// 1000ms / (SAMPLE_RATE / FRAME_SIZE) = frame interval in ms
const FRAME_INTERVAL_MS = (1000 * FRAME_SIZE) / SAMPLE_RATE; // ~15.6ms

function emitFrame() {
  const weights = STATE_WEIGHTS[currentState];
  const frame = {
    timestamp: Date.now(),
    channels: {},
    bandPower: computeBandPower(weights),
  };

  for (const ch of CHANNELS) {
    const samples = [];
    for (let i = 0; i < FRAME_SIZE; i++) {
      const t = (sampleIndex + i) / SAMPLE_RATE;
      samples.push(generateSample(ch, t, weights));
    }
    frame.channels[ch] = samples;
  }

  sampleIndex += FRAME_SIZE;
  self.postMessage(frame);
}

// Listen for state changes from main thread
self.addEventListener("message", (e) => {
  if (e.data.type === "SET_STATE") {
    currentState = e.data.state;
  }
  if (e.data.type === "START") {
    if (intervalId !== null) return;
    intervalId = setInterval(emitFrame, FRAME_INTERVAL_MS);
  }
  if (e.data.type === "STOP") {
    clearInterval(intervalId);
    intervalId = null;
  }
});