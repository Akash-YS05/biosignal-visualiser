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
        bg:      "#080b10",
        panel:   "#0c1118",
        surface: "#101820",
        border:  "#1a2838",
        accent:  "#5aafd4",   // teal — lifted slightly, not electric
        dim:     "#2a5a7a",
        green:   "#4abe8f",   // softer emerald — visible but calm
        warn:    "#d4a843",   // warm amber
        danger:  "#d46070",   // muted red
        muted:   "#3a5570",
        soft:    "#6b8fa8",
        text:    "#a0b8cc",
        bright:  "#c8dce8",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;