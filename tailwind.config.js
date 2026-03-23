/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI ITRI NTIC EVENT 2026 Color Palette
        primary: '#21277B',   // Deep Navy (Main)
        secondary: '#006AD7', // Electric Blue (Vibrant)
        accent: '#FF007A',    // Deep Pink/Magenta (Pop)
        success: '#10B981',   // Emerald
        warning: '#F59E0B',   // Amber
        danger: '#EF4444',    // Rose/Red
        dark: '#0F172A',      // Slate/Background
        light: '#F8FAFC',     // Ghost White
        muted: '#64748B',     // Slate Grey
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
