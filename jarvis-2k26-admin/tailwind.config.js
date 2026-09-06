/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jarvis-dark': '#1a1a1a',
        'jarvis-accent': '#facc15',
      }
    },
  },
  plugins: [],
}
