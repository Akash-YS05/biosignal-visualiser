export type ChannelName = "Fp1" | "Fp2" | "Fz" | "Cz" | "Pz" | "O1" | "O2" | "T3";

export type BrainState = "Relaxed" | "Focused" | "Alert" | "REM";

export interface BandPower {
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface SignalFrame {
  timestamp: number;
  channels: Record<ChannelName, number[]>; // each channel: array of samples in this frame
  bandPower: BandPower;
}

export interface ChannelConfig {
  name: ChannelName;
  enabled: boolean;
  quality: number; // 0–1
  color: string;
}

// Weights per brain state: how much each band contributes to signal
export interface BandWeights {
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export type StateWeights = Record<BrainState, BandWeights>;