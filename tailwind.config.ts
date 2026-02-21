import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e12",
        panel: "#0f1520",
        border: "#1e2d40",
        accent: "#00d4ff",
        green: "#00ff88",
        warn: "#ffaa00",
        danger: "#ff3355",
        muted: "#3a5068",
        text: "#c8d8e8",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;