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
          black: '#0a0a0a',
          dark: '#171717',
          navy: '#171717',
        },
        neon: {
          cyan: '#1677e8',
          blue: '#0756b8',
          violet: '#4b238a',
          magenta: '#f4511e',
        },
      },
      fontFamily: {
        futuristic: ['Bebas Neue', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
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
