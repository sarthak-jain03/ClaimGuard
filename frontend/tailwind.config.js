/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        dark: {
          950: '#090b0f',
          900: '#0d0f14',
          850: '#0f1117',
          800: '#13161e',
          750: '#181c26',
          700: '#1e2333',
          600: '#252c3f',
          input: '#1a1e2a',
        },
        brand: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          hover: '#4f51d9',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        status: {
          green: '#22c55e',
          yellow: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
          purple: '#a855f7',
          orange: '#f97316',
          teal: '#14b8a6',
        }
      },
      boxShadow: {
        glow: '0 0 20px -3px rgba(99, 102, 241, 0.25)',
        'card-glow': '0 4px 24px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
