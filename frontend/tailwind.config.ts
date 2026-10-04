import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        "muted-2": "var(--muted-2)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        paper: "var(--paper)",
        "paper-soft": "var(--paper-soft)",
        page: "var(--page)",
        terracotta: "var(--terracotta)",
        olive: "var(--olive)",
        gold: "var(--gold)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      }
    }
  },
  plugins: []
};

export default config;
