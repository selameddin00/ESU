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
        "bg-primary":   "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary":  "var(--bg-tertiary)",
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
        "accent-primary":   "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-tertiary":  "var(--accent-tertiary)",
        "border-subtle":  "var(--border-subtle)",
        "glass-fill":     "var(--glass-fill)",
      },
      maxWidth: {
        container: "var(--container-max)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
