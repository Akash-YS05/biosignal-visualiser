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
        bg:      "#09090b",
        raised:  "#0f0f11",
        panel:   "#111113",
        hover:   "#18181b",
        border:  "#27272a",
        borderlo:"#1c1c1f",
        t1:      "#fafafa",
        t2:      "#a1a1aa",
        t3:      "#52525b",
        t4:      "#3f3f46",
        cyan:    "#06b6d4",
        cyandim: "#0891b2",
        red:     "#f87171",
        amber:   "#fbbf24",
        green:   "#4ade80",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'Manrope'",       "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "4px",
        xl: "6px",
      },
    },
  },
  plugins: [],
};
export default config;