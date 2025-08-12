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
        'primary': '#4F46E5',
        'secondary': '#10B981',
        'accent': '#F59E0B',
        'dark-bg': '#111827',
        'dark-surface': '#1F2937',
      },
    },
  },
  plugins: [],
}