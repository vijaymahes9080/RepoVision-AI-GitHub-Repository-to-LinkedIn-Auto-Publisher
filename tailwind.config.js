/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        linkedin: {
          blue: '#0a66c2',
          hover: '#004182',
          light: '#e8f4f9',
          dark: '#00264d',
        },
        github: {
          dark: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          green: '#238636',
          text: '#c9d1d9',
        },
        cyber: {
          dark: '#090d16',
          panel: '#111827',
          border: '#1f2937',
          cyan: '#06b6d4',
          purple: '#a855f7',
          emerald: '#10b981',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon': '0 0 20px rgba(99, 102, 241, 0.4)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'neon-linkedin': '0 0 20px rgba(10, 102, 194, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(6, 182, 212, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
