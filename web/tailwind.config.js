/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--color-white-adaptive) / <alpha-value>)',
        obsidian: {
          950: 'rgb(var(--color-obsidian-950) / <alpha-value>)',
          900: 'rgb(var(--color-obsidian-900) / <alpha-value>)',
          850: 'rgb(var(--color-obsidian-850) / <alpha-value>)',
          800: 'rgb(var(--color-obsidian-800) / <alpha-value>)',
          700: 'rgb(var(--color-obsidian-700) / <alpha-value>)',
          600: 'rgb(var(--color-obsidian-600) / <alpha-value>)',
        },
        cobalt: {
          950: 'rgb(var(--color-cobalt-950) / <alpha-value>)',
          900: 'rgb(var(--color-cobalt-900) / <alpha-value>)',
          800: 'rgb(var(--color-cobalt-800) / <alpha-value>)',
          700: 'rgb(var(--color-cobalt-700) / <alpha-value>)',
          600: 'rgb(var(--color-cobalt-600) / <alpha-value>)',
          500: 'rgb(var(--color-cobalt-500) / <alpha-value>)',
          400: 'rgb(var(--color-cobalt-400) / <alpha-value>)',
          300: 'rgb(var(--color-cobalt-300) / <alpha-value>)',
        },
        slate: {
          50: 'rgb(var(--color-slate-50) / <alpha-value>)',
          100: 'rgb(var(--color-slate-100) / <alpha-value>)',
          200: 'rgb(var(--color-slate-200) / <alpha-value>)',
          300: 'rgb(var(--color-slate-300) / <alpha-value>)',
          400: 'rgb(var(--color-slate-400) / <alpha-value>)',
          500: 'rgb(var(--color-slate-500) / <alpha-value>)',
          600: 'rgb(var(--color-slate-600) / <alpha-value>)',
          700: 'rgb(var(--color-slate-700) / <alpha-value>)',
          800: 'rgb(var(--color-slate-800) / <alpha-value>)',
          900: 'rgb(var(--color-slate-900) / <alpha-value>)',
          950: 'rgb(var(--color-slate-950) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cobalt': 'var(--shadow-glow-cobalt)',
        'glow-subtle': 'var(--shadow-glow-subtle)',
      }
    },
  },
  plugins: [],
}
