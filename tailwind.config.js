/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      colors: {
        palm: {
          bg: '#0a0f1a',
          card: '#111827',
          border: '#1e293b',
          surface: '#0d1117',
        },
        amber: {
          350: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
};
