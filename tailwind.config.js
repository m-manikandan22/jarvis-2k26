/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          black: '#0a0e1a',
          dark: '#0d1224',
          navy: '#111827',
        },
        neon: {
          cyan: '#00e5ff',
          blue: '#2979ff',
          violet: '#8a2be2',
          magenta: '#ff00ff',
        },
      },
      fontFamily: {
        futuristic: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'glow-gradient': 'radial-gradient(circle at center, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3)',
        'neon-blue': '0 0 10px rgba(41, 121, 255, 0.5), 0 0 20px rgba(41, 121, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
