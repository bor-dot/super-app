/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./App.js"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f0d",
        panel: "#121816",
        mist: "#e8f2ec",
        muted: "#8da39a",
        emeraldSignal: "#35e39b",
        amberSignal: "#f5c86b",
        coralSignal: "#ff806b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(53, 227, 155, 0.18), 0 24px 80px rgba(0, 0, 0, 0.45)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
