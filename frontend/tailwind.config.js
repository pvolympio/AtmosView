/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We'll default to dark mode in design
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",       // Deep Slate
          darker: "#020617",     // Slate 950
          card: "#1e293b",       // Slate 800
          accent: "#10b981",     // Emerald
          indigo: "#6366f1",     // Indigo
          cyan: "#06b6d4",       // Cyan
          error: "#ef4444"       // Red 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
