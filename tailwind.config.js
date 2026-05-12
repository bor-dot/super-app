/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./data/**/*.{js,jsx}", "./App.js"],
  theme: {
    extend: {
      colors: {
        background: "#141313",
        surface: "#141313",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2b2a2a",
        "surface-container-highest": "#353434",
        "surface-variant": "#353434",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c4c7c7",
        "on-primary-container": "#7e7d7d",
        "outline-variant": "#444748",
        primary: "#c8c6c5",
        teal: "#00f5e1",
        gold: "#d4af37",
        "red-soft": "#ff5f5f"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Hanken Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        ticker: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};
