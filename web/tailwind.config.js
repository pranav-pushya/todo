/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030508',
          900: '#060810',
          850: '#0a0d16',
          800: '#0e1320',
          700: '#141b2d',
          600: '#1f2942',
        },
        cobalt: {
          950: '#001a3d',
          900: '#002d62',
          800: '#0047ab',
          700: '#1d4ed8',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cobalt': '0 0 20px -3px rgba(0, 71, 171, 0.45)',
        'glow-subtle': '0 0 15px -3px rgba(59, 130, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
