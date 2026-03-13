import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      colors: {
        ink: "#0a0a0f",
        paper: "#f5f2eb",
        accent: "#ff4d00",
        muted: "#6b6b7a",
        border: "#e0ddd6",
        surface: "#ffffff",
        "surface-2": "#f9f7f4",
      },
    },
  },
  plugins: [],
};
export default config;
